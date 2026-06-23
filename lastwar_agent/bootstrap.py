from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from .appium_ios import AppiumError, AppiumIosBackend
from .appium_service import AppiumServiceError, ensure_appium_server
from .device_config import find_lastwar_apps, save_lastwar_bundle_id


def _step(name: str, fn) -> Dict[str, Any]:
    try:
        value = fn()
        return {"name": name, "ok": True, "value": value}
    except Exception as exc:
        return {"name": name, "ok": False, "error": str(exc)}


def _install(cwd: Path) -> Dict[str, Any]:
    result = subprocess.run(
        ["bash", "scripts/appium_install_local.sh"],
        cwd=str(cwd),
        text=True,
        capture_output=True,
    )
    return {
        "returncode": result.returncode,
        "stdout_tail": result.stdout[-4000:],
        "stderr_tail": result.stderr[-4000:],
    }


def bootstrap_direct_control(config: Dict[str, Any], cwd: Path, install: bool = False) -> Dict[str, Any]:
    steps: List[Dict[str, Any]] = []
    if install:
        steps.append(_step("install_appium", lambda: _install(cwd)))

    steps.append(_step("ensure_appium_server", lambda: ensure_appium_server(config, cwd, install_hint=not install)))

    backend = AppiumIosBackend(config, cwd)

    def discover() -> Dict[str, Any]:
        apps = backend.list_apps()
        matches = find_lastwar_apps(apps)
        saved = None
        if matches:
            saved = save_lastwar_bundle_id(cwd, matches[0]["bundle_id"], source="bootstrap:listApps", app=matches[0])
        return {"matches": matches, "saved": saved}

    steps.append(_step("discover_lastwar", discover))
    steps.append(_step("start_session", lambda: backend.start_session()))
    steps.append(_step("session_screenshot", lambda: backend.observe_saved_session(tag="bootstrap").to_dict()))

    report = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "ok": all(step["ok"] for step in steps),
        "steps": steps,
    }
    out = cwd / "runs/direct_control_bootstrap_latest.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
        f.write("\n")
    report["report_path"] = str(out)
    return report


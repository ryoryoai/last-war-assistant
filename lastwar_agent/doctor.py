from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path
from typing import Any, Dict

from .appium_ios import AppiumError, AppiumIosBackend


def _cmd_output(cmd: list[str], timeout: int = 8) -> Dict[str, Any]:
    try:
        result = subprocess.run(cmd, text=True, capture_output=True, timeout=timeout)
        return {
            "ok": result.returncode == 0,
            "returncode": result.returncode,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
        }
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


def run_doctor(config: Dict[str, Any]) -> Dict[str, Any]:
    appium_cfg = config["backends"]["appium_ios"]
    bundle_env = appium_cfg.get("bundle_id_env", "LASTWAR_IOS_BUNDLE_ID")
    udid_env = appium_cfg.get("udid_env", "LASTWAR_IOS_UDID")
    checks: Dict[str, Any] = {
        "executables": {
            "node": shutil.which("node"),
            "npm": shutil.which("npm"),
            "xcodebuild": shutil.which("xcodebuild"),
            "xcrun": shutil.which("xcrun"),
            "appium": shutil.which("appium"),
        },
        "env": {
            bundle_env: bool(os.getenv(bundle_env)),
            udid_env: bool(os.getenv(udid_env)),
        },
        "xcode": _cmd_output(["xcodebuild", "-version"]) if shutil.which("xcodebuild") else {"ok": False},
    }
    local_appium = ".lastwar_agent/appium/node_modules/.bin/appium"
    checks["local_appium_bin"] = {
        "path": local_appium,
        "exists": os.path.exists(local_appium),
    }
    try:
        checks["appium_status"] = AppiumIosBackend(config, cwd=Path(os.getcwd())).status()
        checks["appium_status_ok"] = True
    except AppiumError as exc:
        checks["appium_status_ok"] = False
        checks["appium_status_error"] = str(exc)
    return checks

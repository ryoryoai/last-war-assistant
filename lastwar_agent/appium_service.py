from __future__ import annotations

import json
import os
import subprocess
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from .appium_ios import AppiumError, AppiumIosBackend


APPIUM_PID_PATH = Path(".lastwar_agent/appium_server.json")


class AppiumServiceError(RuntimeError):
    pass


def appium_pid_path(cwd: Path) -> Path:
    return cwd / APPIUM_PID_PATH


def _is_running(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def load_appium_server_state(cwd: Path) -> Dict[str, Any]:
    path = appium_pid_path(cwd)
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_appium_server_state(cwd: Path, state: Dict[str, Any]) -> None:
    path = appium_pid_path(cwd)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")


def local_appium_command(cwd: Path) -> List[str]:
    return [
        "npx",
        "--prefix",
        str(cwd / ".lastwar_agent/appium"),
        "appium",
        "--address",
        "127.0.0.1",
        "--port",
        "4723",
        "--base-path",
        "/",
    ]


def wait_for_appium(config: Dict[str, Any], cwd: Path, timeout_seconds: int = 30) -> Dict[str, Any]:
    backend = AppiumIosBackend(config, cwd)
    deadline = time.time() + timeout_seconds
    last_error = ""
    while time.time() < deadline:
        try:
            return backend.status()
        except AppiumError as exc:
            last_error = str(exc)
            time.sleep(1)
    raise AppiumServiceError(f"Appium did not become ready within {timeout_seconds}s: {last_error}")


def ensure_appium_server(config: Dict[str, Any], cwd: Path, install_hint: bool = True) -> Dict[str, Any]:
    try:
        status = AppiumIosBackend(config, cwd).status()
        return {"started": False, "already_running": True, "status": status}
    except AppiumError:
        pass

    appium_bin = cwd / ".lastwar_agent/appium/node_modules/.bin/appium"
    if not appium_bin.exists() and install_hint:
        raise AppiumServiceError(
            "Local Appium is not installed. Run: bash scripts/appium_install_local.sh"
        )

    log_path = cwd / "runs/appium_server.log"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_file = log_path.open("ab")
    env = os.environ.copy()
    env["APPIUM_HOME"] = str(cwd / ".lastwar_agent/appium-home")
    process = subprocess.Popen(
        local_appium_command(cwd),
        cwd=str(cwd),
        stdout=log_file,
        stderr=subprocess.STDOUT,
        env=env,
        start_new_session=True,
    )
    state = {
        "pid": process.pid,
        "log_path": str(log_path),
        "started_at": time.time(),
        "command": local_appium_command(cwd),
    }
    save_appium_server_state(cwd, state)
    status = wait_for_appium(config, cwd)
    return {"started": True, "already_running": False, "state": state, "status": status}


def stop_appium_server(cwd: Path) -> Dict[str, Any]:
    state = load_appium_server_state(cwd)
    if not state:
        return {"stopped": False, "reason": "no saved Appium server state"}
    pid = int(state.get("pid", 0))
    if pid and _is_running(pid):
        os.kill(pid, 15)
        time.sleep(1)
        if _is_running(pid):
            os.kill(pid, 9)
    path = appium_pid_path(cwd)
    if path.exists():
        path.unlink()
    return {"stopped": True, "state": state}


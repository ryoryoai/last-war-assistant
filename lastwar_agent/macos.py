from __future__ import annotations

import subprocess
import time
import os
import json
from pathlib import Path
from typing import Any, Dict, Iterable, List

from .models import Rect


ROOT = Path(__file__).resolve().parents[1]
CLICK_SWIFT = ROOT / "tools" / "macos_click.swift"
CLICK_BIN = ROOT / ".lastwar_agent" / "bin" / "macos_click"
POINTER_SWIFT = ROOT / "tools" / "macos_pointer_position.swift"
POINTER_BIN = ROOT / ".lastwar_agent" / "bin" / "macos_pointer_position"
PERMISSIONS_SWIFT = ROOT / "tools" / "macos_permissions.swift"
PERMISSIONS_BIN = ROOT / ".lastwar_agent" / "bin" / "macos_permissions"


class ScreenCaptureError(RuntimeError):
    pass


class AutomationAccessError(RuntimeError):
    pass


def run_osascript(lines: Iterable[str]) -> str:
    cmd: List[str] = ["osascript"]
    for line in lines:
        cmd.extend(["-e", line])
    result = subprocess.run(cmd, text=True, capture_output=True)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        raise AutomationAccessError(
            "osascript/System Events access failed. Grant Accessibility permission to the app "
            f"running this script, then retry. detail={detail}"
        )
    return result.stdout.strip()


def get_window_rect(process_names: List[str]) -> tuple[str, Rect]:
    names = "{" + ", ".join(f'"{name}"' for name in process_names) + "}"
    script = [
        'tell application "System Events"',
        f"set candidates to {names}",
        "repeat with pname in candidates",
        "if exists process (pname as text) then",
        "tell process (pname as text)",
        "set frontmost to true",
        "set p to position of window 1",
        "set s to size of window 1",
        'return (pname as text) & ":" & (item 1 of p as text) & "," & (item 2 of p as text) & "," & (item 1 of s as text) & "," & (item 2 of s as text)',
        "end tell",
        "end if",
        "end repeat",
        'error "iPhone Mirroring process not found"',
        "end tell",
    ]
    output = run_osascript(script)
    process_name, values = output.split(":", 1)
    x, y, width, height = [int(float(part)) for part in values.split(",")]
    return process_name, Rect(x=x, y=y, width=width, height=height)


def capture_rect(rect: Rect, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    region = f"{rect.x},{rect.y},{rect.width},{rect.height}"
    result = subprocess.run(
        ["screencapture", "-x", "-R", region, str(output_path)],
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        raise ScreenCaptureError(
            "screencapture failed. Grant Screen Recording permission to the app running "
            "this script, then retry. On this setup Codex computer-use can still inspect "
            f"the iPhone Mirroring window directly. region={region}; detail={detail}"
        )


def compile_swift_helper(source: Path, output: Path) -> Path:
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists() and output.stat().st_mtime >= source.stat().st_mtime:
        return output
    cache_dir = ROOT / ".lastwar_agent" / "cache" / "swift-module-cache"
    cache_dir.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env["CLANG_MODULE_CACHE_PATH"] = str(cache_dir)
    env["XDG_CACHE_HOME"] = str(ROOT / ".lastwar_agent" / "cache")
    subprocess.run(
        ["xcrun", "swiftc", "-module-cache-path", str(cache_dir), str(source), "-o", str(output)],
        check=True,
        env=env,
    )
    return output


def compile_click_helper() -> Path:
    return compile_swift_helper(CLICK_SWIFT, CLICK_BIN)


def compile_pointer_helper() -> Path:
    return compile_swift_helper(POINTER_SWIFT, POINTER_BIN)


def compile_permissions_helper() -> Path:
    return compile_swift_helper(PERMISSIONS_SWIFT, PERMISSIONS_BIN)


def click_global(x: int, y: int, click_count: int = 1) -> None:
    helper = compile_click_helper()
    subprocess.run([str(helper), str(x), str(y), str(click_count)], check=True)


def click_helper_permissions(prompt_accessibility: bool = False) -> Dict[str, Any]:
    helper = compile_click_helper()
    cmd = [str(helper), "--check-accessibility"]
    if prompt_accessibility:
        cmd.append("--prompt-accessibility")
    result = subprocess.run(cmd, text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


def pointer_position() -> tuple[int, int]:
    helper = compile_pointer_helper()
    result = subprocess.run([str(helper)], text=True, capture_output=True, check=True)
    parts = result.stdout.strip().split()
    if len(parts) != 2:
        raise RuntimeError(f"unexpected pointer helper output: {result.stdout!r}")
    return int(float(parts[0])), int(float(parts[1]))


def macos_permissions(prompt_accessibility: bool = False, prompt_screen_capture: bool = False) -> Dict[str, Any]:
    helper = compile_permissions_helper()
    cmd = [str(helper)]
    if prompt_screen_capture:
        cmd.append("--prompt-screen-capture")
    result = subprocess.run(cmd, text=True, capture_output=True, check=True)
    payload = json.loads(result.stdout)
    click_payload = click_helper_permissions(prompt_accessibility=prompt_accessibility)
    payload["permission_helper_accessibility"] = bool(payload.get("accessibility"))
    payload["click_helper_accessibility"] = bool(click_payload.get("accessibility"))
    payload["accessibility"] = bool(click_payload.get("accessibility"))
    payload["prompted_accessibility"] = bool(click_payload.get("prompted_accessibility"))
    return payload


def hotkey(key: str) -> None:
    if key == "cmd+1":
        run_osascript(['tell application "System Events" to keystroke "1" using command down'])
        return
    if key == "cmd+2":
        run_osascript(['tell application "System Events" to keystroke "2" using command down'])
        return
    if key == "escape":
        run_osascript(['tell application "System Events" to key code 53'])
        return
    raise ValueError(f"unsupported hotkey: {key}")


def sleep(seconds: float) -> None:
    time.sleep(max(0.0, seconds))

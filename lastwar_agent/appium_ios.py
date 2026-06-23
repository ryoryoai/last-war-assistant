from __future__ import annotations

import base64
import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional
from urllib.parse import urljoin

from .device_config import configured_lastwar_bundle_id
from .executor import Executor
from .models import Action, Observation, Rect
from .observer import get_tz


class AppiumError(RuntimeError):
    pass


SESSION_STATE_PATH = Path(".lastwar_agent/appium_session.json")


class AppiumClient:
    def __init__(self, server_url: str, timeout: int = 20):
        self.server_url = server_url.rstrip("/") + "/"
        self.timeout = timeout

    def request(self, method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = urljoin(self.server_url, path.lstrip("/"))
        data = None
        headers = {"Content-Type": "application/json"}
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                body = response.read().decode("utf-8")
        except urllib.error.URLError as exc:
            raise AppiumError(f"Appium request failed: {method} {url}: {exc}") from exc
        if not body:
            return {}
        parsed = json.loads(body)
        value = parsed.get("value")
        if isinstance(value, dict) and value.get("error"):
            raise AppiumError(f"Appium error: {value.get('error')}: {value.get('message')}")
        return parsed

    def status(self) -> Dict[str, Any]:
        return self.request("GET", "/status")

    def create_session(self, capabilities: Dict[str, Any]) -> str:
        payload = {"capabilities": {"alwaysMatch": capabilities, "firstMatch": [{}]}}
        response = self.request("POST", "/session", payload)
        session_id = response.get("sessionId") or response.get("value", {}).get("sessionId")
        if not session_id:
            raise AppiumError(f"session id missing in response: {response}")
        return str(session_id)

    def delete_session(self, session_id: str) -> None:
        self.request("DELETE", f"/session/{session_id}")

    def get_window_rect(self, session_id: str) -> Rect:
        response = self.request("GET", f"/session/{session_id}/window/rect")
        value = response.get("value", response)
        width = int(value.get("width", 0))
        height = int(value.get("height", 0))
        if width <= 0 or height <= 0:
            raise AppiumError(f"invalid window rect from Appium: {response}")
        return Rect(0, 0, width, height)

    def screenshot(self, session_id: str, path: Path) -> None:
        response = self.request("GET", f"/session/{session_id}/screenshot")
        image_b64 = response.get("value")
        if not isinstance(image_b64, str) or not image_b64:
            raise AppiumError("screenshot response did not include base64 image data")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(base64.b64decode(image_b64))

    def tap(self, session_id: str, x: int, y: int) -> None:
        payload = {
            "actions": [
                {
                    "type": "pointer",
                    "id": "finger1",
                    "parameters": {"pointerType": "touch"},
                    "actions": [
                        {"type": "pointerMove", "duration": 0, "x": x, "y": y},
                        {"type": "pointerDown", "button": 0},
                        {"type": "pause", "duration": 120},
                        {"type": "pointerUp", "button": 0},
                    ],
                }
            ]
        }
        self.request("POST", f"/session/{session_id}/actions", payload)

    def execute_script(self, session_id: str, script: str, args: Optional[List[Any]] = None) -> Any:
        response = self.request(
            "POST",
            f"/session/{session_id}/execute/sync",
            {"script": script, "args": args or []},
        )
        return response.get("value")


def build_capabilities(config: Dict[str, Any], cwd: Optional[Path] = None) -> Dict[str, Any]:
    appium_cfg = config["backends"]["appium_ios"]
    capabilities = dict(appium_cfg.get("capabilities", {}))
    udid_env = appium_cfg.get("udid_env", "LASTWAR_IOS_UDID")
    bundle_env = appium_cfg.get("bundle_id_env", "LASTWAR_IOS_BUNDLE_ID")
    udid = os.getenv(udid_env)
    bundle_id = os.getenv(bundle_env)
    if not bundle_id and cwd is not None:
        bundle_id = configured_lastwar_bundle_id(cwd)
    if udid:
        capabilities["appium:udid"] = udid
    if bundle_id:
        capabilities["appium:bundleId"] = bundle_id
    if "platformName" not in capabilities:
        capabilities["platformName"] = "iOS"
    if "appium:automationName" not in capabilities:
        capabilities["appium:automationName"] = "XCUITest"
    if "appium:noReset" not in capabilities:
        capabilities["appium:noReset"] = True
    if "appium:newCommandTimeout" not in capabilities:
        capabilities["appium:newCommandTimeout"] = 300
    if "appium:bundleId" not in capabilities and "browserName" not in capabilities and "appium:app" not in capabilities:
        raise AppiumError(
            f"Set {bundle_env} to the Last War iOS bundle id, run ios-discover-lastwar, "
            "or configure browserName/app in config."
        )
    return capabilities


def build_bootstrap_capabilities(config: Dict[str, Any]) -> Dict[str, Any]:
    appium_cfg = config["backends"]["appium_ios"]
    capabilities = dict(appium_cfg.get("capabilities", {}))
    udid_env = appium_cfg.get("udid_env", "LASTWAR_IOS_UDID")
    udid = os.getenv(udid_env)
    if udid:
        capabilities["appium:udid"] = udid
    capabilities.setdefault("platformName", "iOS")
    capabilities.setdefault("appium:automationName", "XCUITest")
    capabilities.setdefault("appium:noReset", True)
    capabilities.setdefault("appium:newCommandTimeout", 300)
    capabilities["appium:bundleId"] = appium_cfg.get("bootstrap_bundle_id", "com.apple.Preferences")
    return capabilities


class AppiumIosBackend:
    def __init__(self, config: Dict[str, Any], cwd: Path):
        self.config = config
        self.cwd = cwd
        appium_cfg = config["backends"]["appium_ios"]
        self.client = AppiumClient(
            server_url=appium_cfg.get("server_url", "http://127.0.0.1:4723"),
            timeout=int(appium_cfg.get("timeout_seconds", 20)),
        )

    def status(self) -> Dict[str, Any]:
        return self.client.status()

    def session_state_path(self) -> Path:
        return self.cwd / SESSION_STATE_PATH

    def start_session(self, bootstrap: bool = False) -> Dict[str, Any]:
        capabilities = build_bootstrap_capabilities(self.config) if bootstrap else build_capabilities(self.config, self.cwd)
        session_id = self.client.create_session(capabilities)
        rect = self.client.get_window_rect(session_id)
        state = {
            "backend": "appium_ios",
            "session_id": session_id,
            "server_url": self.client.server_url,
            "width": rect.width,
            "height": rect.height,
            "bootstrap": bootstrap,
            "created_at": datetime.now().astimezone().isoformat(),
        }
        self.save_session_state(state)
        return state

    def load_session_state(self) -> Dict[str, Any]:
        path = self.session_state_path()
        if not path.exists():
            raise AppiumError(f"no saved Appium session state at {path}")
        with path.open("r", encoding="utf-8") as f:
            state = json.load(f)
        if state.get("backend") != "appium_ios" or not state.get("session_id"):
            raise AppiumError(f"invalid Appium session state at {path}")
        return state

    def save_session_state(self, state: Dict[str, Any]) -> None:
        path = self.session_state_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False, indent=2, sort_keys=True)
            f.write("\n")

    def clear_session_state(self) -> None:
        path = self.session_state_path()
        if path.exists():
            path.unlink()

    def stop_saved_session(self) -> Dict[str, Any]:
        state = self.load_session_state()
        self.client.delete_session(str(state["session_id"]))
        self.clear_session_state()
        return state

    def observation_from_session(self, session_id: str, tag: str = "observe") -> Observation:
        tz = get_tz(self.config["scheduler"].get("timezone", "Asia/Tokyo"))
        now = datetime.now(tz=tz)
        rect = self.client.get_window_rect(session_id)
        out_dir = self.cwd / self.config["runtime"]["log_dir"] / now.strftime("%Y%m%d")
        stamp = now.strftime("%Y%m%d-%H%M%S")
        screenshot_path = out_dir / f"{self.config['runtime']['screenshot_prefix']}-appium-{tag}-{stamp}.png"
        self.client.screenshot(session_id, screenshot_path)
        return Observation(
            now=now,
            screenshot_path=screenshot_path,
            window_rect=rect,
            content_rect=rect,
            screen="device_session",
            metadata={
                "backend": "appium_ios",
                "session_id": session_id,
                "appium_server": self.client.server_url,
                "width": rect.width,
                "height": rect.height,
                "persistent_session": True,
            },
        )

    def observe(self, tag: str = "observe") -> Observation:
        capabilities = build_capabilities(self.config, self.cwd)
        tz = get_tz(self.config["scheduler"].get("timezone", "Asia/Tokyo"))
        now = datetime.now(tz=tz)
        session_id = self.client.create_session(capabilities)
        rect = self.client.get_window_rect(session_id)
        out_dir = self.cwd / self.config["runtime"]["log_dir"] / now.strftime("%Y%m%d")
        stamp = now.strftime("%Y%m%d-%H%M%S")
        screenshot_path = out_dir / f"{self.config['runtime']['screenshot_prefix']}-appium-{tag}-{stamp}.png"
        self.client.screenshot(session_id, screenshot_path)
        return Observation(
            now=now,
            screenshot_path=screenshot_path,
            window_rect=rect,
            content_rect=rect,
            screen="device_session",
            metadata={
                "backend": "appium_ios",
                "session_id": session_id,
                "appium_server": self.client.server_url,
                "width": rect.width,
                "height": rect.height,
            },
        )

    def observe_saved_session(self, tag: str = "observe") -> Observation:
        state = self.load_session_state()
        return self.observation_from_session(str(state["session_id"]), tag=tag)

    def close(self, observation: Observation) -> None:
        session_id = observation.metadata.get("session_id")
        if session_id:
            self.client.delete_session(str(session_id))

    def list_apps(self) -> Any:
        session_id = self.client.create_session(build_bootstrap_capabilities(self.config))
        try:
            return self.client.execute_script(session_id, "mobile: listApps")
        finally:
            self.client.delete_session(session_id)


class AppiumIosExecutor(Executor):
    def __init__(self, config: Dict[str, Any], dry_run: bool, backend: AppiumIosBackend):
        super().__init__(config, dry_run=dry_run)
        self.backend = backend

    def is_allowed(self, action: Action) -> tuple[bool, str]:
        allowed, reason = super().is_allowed(action)
        if not allowed:
            return allowed, reason
        if action.kind == "hotkey":
            return False, "hotkey actions are not supported by appium_ios backend"
        return True, "allowed"

    def execute(self, actions: Iterable[Action], observation: Observation, max_actions: int) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []
        delay = float(self.config["runtime"].get("action_delay_seconds", 1.2))
        session_id = str(observation.metadata.get("session_id", ""))
        if not session_id:
            raise AppiumError("observation has no Appium session_id")
        for action in list(actions)[:max_actions]:
            allowed, reason = self.is_allowed(action)
            result: Dict[str, Any] = {
                "action": action.to_dict(),
                "allowed": allowed,
                "dry_run": self.dry_run,
                "reason": reason,
                "executed": False,
                "backend": "appium_ios",
            }
            if not allowed:
                results.append(result)
                continue
            if self.dry_run:
                results.append(result)
                continue
            if action.kind == "click_norm":
                x, y = observation.content_rect.point_from_norm(action.x_norm or 0, action.y_norm or 0)
                self.backend.client.tap(session_id, x, y)
                result["executed"] = True
                result["device_point"] = {"x": x, "y": y}
            elif action.kind == "wait":
                time.sleep(float(action.seconds or delay))
                result["executed"] = True
            results.append(result)
            time.sleep(delay)
        return results

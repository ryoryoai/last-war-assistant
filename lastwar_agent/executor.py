from __future__ import annotations

import time
from typing import Any, Dict, Iterable, List

from .macos import AutomationAccessError, click_global, hotkey, macos_permissions, sleep
from .models import Action, Observation


class Executor:
    def __init__(self, config: Dict[str, Any], dry_run: bool):
        self.config = config
        self.dry_run = dry_run
        self._accessibility_checked = False

    def is_allowed(self, action: Action) -> tuple[bool, str]:
        safety = self.config["safety"]
        if action.kind not in safety["allowed_action_kinds"]:
            return False, f"action kind is not allowed: {action.kind}"
        if action.risk not in safety["allowed_risk"]:
            return False, f"risk is not allowed: {action.risk}"
        if action.kind == "click_norm":
            if action.x_norm is None or action.y_norm is None:
                return False, "click action has no normalized coordinates"
            if not 0 <= action.x_norm <= 1 or not 0 <= action.y_norm <= 1:
                return False, "click action coordinates out of range"
        return True, "allowed"

    def ensure_accessibility_permission(self) -> None:
        if self._accessibility_checked:
            return
        permissions = macos_permissions()
        if not permissions.get("accessibility"):
            raise AutomationAccessError(
                "macOS Accessibility permission is required before executing clicks or hotkeys. "
                "Run: bash scripts/macos_permission_probe.sh --prompt"
            )
        self._accessibility_checked = True

    def execute(self, actions: Iterable[Action], observation: Observation, max_actions: int) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []
        delay = float(self.config["runtime"].get("action_delay_seconds", 1.2))
        for action in list(actions)[:max_actions]:
            allowed, reason = self.is_allowed(action)
            result: Dict[str, Any] = {
                "action": action.to_dict(),
                "allowed": allowed,
                "dry_run": self.dry_run,
                "reason": reason,
                "executed": False,
            }
            if not allowed:
                results.append(result)
                continue
            if self.dry_run:
                result["executed"] = False
                results.append(result)
                continue
            if action.kind == "click_norm":
                self.ensure_accessibility_permission()
                x, y = observation.content_rect.point_from_norm(action.x_norm or 0, action.y_norm or 0)
                click_global(x, y)
                result["executed"] = True
                result["global_point"] = {"x": x, "y": y}
            elif action.kind == "hotkey" and action.key:
                self.ensure_accessibility_permission()
                hotkey(action.key)
                result["executed"] = True
            elif action.kind == "wait":
                sleep(float(action.seconds or delay))
                result["executed"] = True
            results.append(result)
            time.sleep(delay)
        return results

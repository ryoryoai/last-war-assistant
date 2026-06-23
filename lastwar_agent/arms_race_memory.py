from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict


ARMS_RACE_MEMORY_PATH = Path("memory/arms_race.json")


def _memory_path(cwd: Path) -> Path:
    return cwd / ARMS_RACE_MEMORY_PATH


def load_arms_race_memory(cwd: Path) -> Dict[str, Any]:
    path = _memory_path(cwd)
    if not path.exists():
        return {
            "source": "agent",
            "known_rules": {},
            "current_live_state": {},
            "control_backends": {},
            "phase_memory": [],
        }
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_arms_race_memory(cwd: Path, data: Dict[str, Any]) -> Dict[str, Any]:
    path = _memory_path(cwd)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    return data


def update_arms_race_attempt(cwd: Path, attempt: Dict[str, Any]) -> Dict[str, Any]:
    data = load_arms_race_memory(cwd)
    now = datetime.now().astimezone().isoformat()
    data["source"] = "user_and_agent_attempts"
    data["updated_at"] = now

    route_result = attempt.get("route_result") or {}
    post_observation = attempt.get("post_observation")
    ok = bool(attempt.get("ok"))
    dry_run = bool(attempt.get("dry_run"))
    if attempt.get("skipped"):
        status = "skipped_not_ready"
        reason = attempt.get("error") or "Direct-control readiness gate skipped the route attempt."
    elif ok and post_observation:
        status = "observed_after_route"
        if attempt.get("ocr"):
            reason = "Route executed, post-route screenshot was saved, and local OCR extracted text."
        else:
            reason = "Route executed and post-route screenshot was saved. Screen contents still require OCR/vision extraction."
    elif ok and dry_run:
        status = "route_previewed"
        reason = "Route was validated in dry-run mode; no live screen was observed."
    elif ok:
        status = "route_executed_without_post_observation"
        reason = "Route command completed, but no post-route screenshot was saved."
    else:
        status = "not_observed"
        reason = attempt.get("error") or "Route attempt did not complete."

    current = data.setdefault("current_live_state", {})
    current.update(
        {
            "status": status,
            "reason": reason,
            "last_attempted_at": now,
            "intended_route": ["イベント", "日程"],
            "observed_at": post_observation.get("now") if isinstance(post_observation, dict) else None,
            "screen": post_observation.get("screen") if isinstance(post_observation, dict) else None,
            "last_route_attempt": {
                "ok": ok,
                "backend": attempt.get("backend"),
                "dry_run": dry_run,
                "execute": bool(attempt.get("execute")),
                "use_session": bool(attempt.get("use_session")),
                "use_manual_rect": bool(attempt.get("use_manual_rect")),
                "route": route_result.get("route", "arms_race_schedule"),
                "error": attempt.get("error"),
                "skipped": bool(attempt.get("skipped")),
                "gate": attempt.get("gate"),
                "post_screenshot_path": post_observation.get("screenshot_path")
                if isinstance(post_observation, dict)
                else None,
            },
        }
    )

    if attempt.get("ocr"):
        ocr = attempt["ocr"]
        text = ocr.get("text", []) if isinstance(ocr, dict) else []
        current["detected_text"] = text
        current["ocr"] = {
            "status": "ok",
            "image_path": ocr.get("image_path") if isinstance(ocr, dict) else None,
            "text_count": len(text),
            "text_joined": ocr.get("text_joined") if isinstance(ocr, dict) else None,
        }
    elif attempt.get("ocr_error"):
        current["ocr"] = {
            "status": "failed",
            "error": attempt["ocr_error"],
        }

    if attempt.get("gate", {}).get("blockers"):
        current["required_before_retry"] = attempt["gate"]["blockers"]
    elif not ok and attempt.get("readiness", {}).get("automation_blockers"):
        current["required_before_retry"] = attempt["readiness"]["automation_blockers"]

    phase_memory = data.setdefault("phase_memory", [])
    phase_memory.append(
        {
            "recorded_at": now,
            "status": status,
            "backend": attempt.get("backend"),
            "dry_run": dry_run,
            "skipped": bool(attempt.get("skipped")),
            "post_screenshot_path": current["last_route_attempt"]["post_screenshot_path"],
            "ocr_status": current.get("ocr", {}).get("status"),
        }
    )
    data["phase_memory"] = phase_memory[-50:]
    return save_arms_race_memory(cwd, data)

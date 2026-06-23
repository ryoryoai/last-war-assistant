from __future__ import annotations

import base64
import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List

from .models import Action, Observation


VISION_PROMPT = """
You are a cautious automation planner for Last War: Survival running in iPhone Mirroring.

Return strict JSON only. Do not include markdown.

Rules:
- Only propose low-risk actions that collect already-free resources, free rewards, or dismiss clearly harmless popups.
- Never propose clicking purchase, gem/diamond spend, paid shop, speedup use, alliance/PvP, delete, leave, disband, or irreversible confirmation controls.
- If the screen contains any risky confirmation, return abort=true and no actions.
- Coordinates must be normalized to the screenshot: x_norm and y_norm between 0 and 1.
- Prefer at most five actions.

JSON schema:
{
  "screen": "home|event|dialog|unknown",
  "abort": false,
  "danger_terms": [],
  "actions": [
    {
      "kind": "click_norm",
      "label": "short label",
      "x_norm": 0.5,
      "y_norm": 0.5,
      "risk": "low",
      "reason": "why this is safe"
    }
  ]
}
"""


def _extract_json(text: str) -> Dict[str, Any]:
    text = text.strip()
    if text.startswith("{"):
        return json.loads(text)
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("vision response did not contain JSON")
    return json.loads(match.group(0))


class VisionPlanner:
    def __init__(self, config: Dict[str, Any]):
        self.config = config

    def enabled(self) -> bool:
        model_env = self.config["vision"].get("model_env", "LASTWAR_VISION_MODEL")
        return bool(os.getenv("OPENAI_API_KEY") and os.getenv(model_env))

    def plan(self, observation: Observation) -> Dict[str, Any]:
        if not self.enabled():
            return {"enabled": False, "reason": "OPENAI_API_KEY or LASTWAR_VISION_MODEL is not set", "actions": []}
        try:
            from openai import OpenAI
        except Exception as exc:
            return {"enabled": False, "reason": f"openai import failed: {exc}", "actions": []}

        model_env = self.config["vision"].get("model_env", "LASTWAR_VISION_MODEL")
        model = os.environ[model_env]
        image_b64 = base64.b64encode(Path(observation.screenshot_path).read_bytes()).decode("ascii")
        client = OpenAI()
        response = client.responses.create(
            model=model,
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": VISION_PROMPT},
                        {"type": "input_image", "image_url": f"data:image/png;base64,{image_b64}"},
                    ],
                }
            ],
        )
        text = getattr(response, "output_text", "")
        data = _extract_json(text)
        max_actions = int(self.config["vision"].get("max_actions", 5))
        actions: List[Dict[str, Any]] = data.get("actions", [])[:max_actions]
        data["actions"] = actions
        return data


def actions_from_vision(data: Dict[str, Any], source_skill: str = "vision_planner") -> List[Action]:
    actions: List[Action] = []
    if data.get("abort"):
        return actions
    for item in data.get("actions", []):
        if item.get("kind") != "click_norm":
            continue
        actions.append(
            Action(
                kind="click_norm",
                label=str(item.get("label", "vision action")),
                x_norm=float(item["x_norm"]),
                y_norm=float(item["y_norm"]),
                risk=str(item.get("risk", "medium")),
                reason=str(item.get("reason", "")),
                source_skill=source_skill,
            )
        )
    return actions


from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from ..models import Observation, SkillOutcome
from ..state import StateStore


class Skill:
    name = "base"

    def __init__(self, config: Dict[str, Any], state: StateStore):
        self.config = config
        self.state = state
        self.skill_config = config["skills"].get(self.name, {})

    @property
    def enabled(self) -> bool:
        return bool(self.skill_config.get("enabled", True))

    @property
    def priority(self) -> int:
        return int(self.skill_config.get("priority", 0))

    def cooldown_ready(self, now: datetime) -> bool:
        cooldown = int(self.skill_config.get("cooldown_seconds", 0))
        if cooldown <= 0:
            return True
        last_run = self.state.last_skill_run(self.name)
        if not last_run:
            return True
        return (now - last_run).total_seconds() >= cooldown

    def evaluate(self, observation: Observation) -> SkillOutcome:
        raise NotImplementedError


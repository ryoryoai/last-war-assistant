from __future__ import annotations

from ..models import Action, Observation, SkillOutcome
from .base import Skill


class ReturnToHomeSkill(Skill):
    name = "return_to_home"

    def evaluate(self, observation: Observation) -> SkillOutcome:
        if not self.cooldown_ready(observation.now):
            return SkillOutcome(self.name, "skipped", "cooldown active", priority=self.priority)
        if observation.screen == "blank_or_locked":
            return SkillOutcome(self.name, "skipped", "screen appears blank or locked", priority=self.priority)
        action = Action(
            kind="hotkey",
            key="cmd+1",
            label="iPhone Mirroring home shortcut",
            risk="low",
            reason="⌘1 returns iPhone Mirroring to the iPhone home screen if needed",
            source_skill=self.name,
        )
        return SkillOutcome(
            skill=self.name,
            status="candidate",
            reason="home shortcut is available as a recovery action",
            actions=[action],
            priority=self.priority,
        )


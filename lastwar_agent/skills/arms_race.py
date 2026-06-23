from __future__ import annotations

from ..models import Action, Observation, SkillOutcome
from ..scheduler import current_arms_race_window
from .base import Skill


class OpenArmsRaceSkill(Skill):
    name = "open_arms_race"

    def evaluate(self, observation: Observation) -> SkillOutcome:
        window = current_arms_race_window(observation.now, self.config)
        if not (window["is_start_window"] or window["is_precheck_window"]):
            return SkillOutcome(
                skill=self.name,
                status="skipped",
                reason="not in arms race start/precheck window",
                priority=self.priority,
            )
        if not self.cooldown_ready(observation.now):
            return SkillOutcome(self.name, "skipped", "cooldown active", priority=self.priority)
        point = self.skill_config.get("tap_point")
        if not point:
            return SkillOutcome(self.name, "skipped", "no tap point configured", priority=self.priority)
        action = Action(
            kind="click_norm",
            label=point.get("label", "open arms race"),
            x_norm=float(point["x_norm"]),
            y_norm=float(point["y_norm"]),
            risk="low",
            reason="current time is inside the configured arms race window",
            source_skill=self.name,
        )
        return SkillOutcome(
            skill=self.name,
            status="candidate",
            reason="arms race timing window matched",
            actions=[action],
            priority=self.priority,
        )


class ReadArmsRacePhaseSkill(Skill):
    name = "read_arms_race_phase"

    def evaluate(self, observation: Observation) -> SkillOutcome:
        window = current_arms_race_window(observation.now, self.config)
        return SkillOutcome(
            skill=self.name,
            status="info",
            reason=(
                f"active window {window['active_start']} -> {window['active_end']}; "
                f"remaining {window['remaining_seconds']}s"
            ),
            priority=self.priority,
        )


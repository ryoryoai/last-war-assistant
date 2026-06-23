from __future__ import annotations

from ..models import Action, Observation, SkillOutcome
from ..planner import actions_from_vision
from .base import Skill


class CollectBaseResourcesSkill(Skill):
    name = "collect_base_resources"

    def evaluate(self, observation: Observation) -> SkillOutcome:
        if not self.cooldown_ready(observation.now):
            return SkillOutcome(self.name, "skipped", "cooldown active", priority=self.priority)
        if observation.screen == "blank_or_locked":
            return SkillOutcome(self.name, "skipped", "screen appears blank or locked", priority=self.priority)

        vision_actions = [
            action
            for action in actions_from_vision(observation.vision, source_skill=self.name)
            if "resource" in action.label.lower()
            or "free" in action.label.lower()
            or "claim" in action.label.lower()
            or "collect" in action.label.lower()
            or "受取" in action.label
            or "無料" in action.label
            or "回収" in action.label
        ]
        if vision_actions:
            return SkillOutcome(
                skill=self.name,
                status="candidate",
                reason="vision planner found low-risk collect actions",
                actions=vision_actions,
                priority=self.priority,
            )

        actions = []
        if self.skill_config.get("strategy") == "static_safe_candidates":
            for point in self.skill_config.get("tap_points", []):
                actions.append(
                    Action(
                        kind="click_norm",
                        label=point["label"],
                        x_norm=float(point["x_norm"]),
                        y_norm=float(point["y_norm"]),
                        risk="low",
                        reason="configured base resource candidate point",
                        source_skill=self.name,
                    )
                )
        return SkillOutcome(
            skill=self.name,
            status="candidate" if actions else "skipped",
            reason="using configured static resource candidate points" if actions else "no candidate points configured",
            actions=actions,
            priority=self.priority,
        )


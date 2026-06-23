from __future__ import annotations

from ..models import Observation, SkillOutcome
from .base import Skill


class DetectDangerousDialogSkill(Skill):
    name = "detect_dangerous_dialog"

    def evaluate(self, observation: Observation) -> SkillOutcome:
        keywords = self.config["safety"].get("blocked_keywords", [])
        text_sources = list(observation.detected_text)
        danger_terms = observation.vision.get("danger_terms", [])
        text_sources.extend(str(term) for term in danger_terms)
        matched = [kw for kw in keywords if any(kw in text for text in text_sources)]
        if observation.vision.get("abort"):
            return SkillOutcome(
                skill=self.name,
                status="abort",
                reason="vision planner requested abort",
                priority=self.priority,
                abort=True,
                risk="high",
            )
        if matched:
            return SkillOutcome(
                skill=self.name,
                status="abort",
                reason=f"blocked keywords detected: {', '.join(matched)}",
                priority=self.priority,
                abort=True,
                risk="high",
            )
        return SkillOutcome(
            skill=self.name,
            status="ok",
            reason="no dangerous terms detected",
            priority=self.priority,
        )


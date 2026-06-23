from __future__ import annotations

from typing import Any, Dict, List

from .models import Action, Observation, SkillOutcome
from .skills import (
    CollectBaseResourcesSkill,
    DetectDangerousDialogSkill,
    OpenArmsRaceSkill,
    ReadArmsRacePhaseSkill,
    ReturnToHomeSkill,
    Skill,
)
from .state import StateStore


SKILL_TYPES = [
    DetectDangerousDialogSkill,
    ReturnToHomeSkill,
    CollectBaseResourcesSkill,
    OpenArmsRaceSkill,
    ReadArmsRacePhaseSkill,
]


class SkillRouter:
    def __init__(self, config: Dict[str, Any], state: StateStore):
        self.config = config
        self.state = state
        self.skills: List[Skill] = [cls(config, state) for cls in SKILL_TYPES]

    def list_skills(self) -> List[Dict[str, Any]]:
        rows = []
        for skill in sorted(self.skills, key=lambda s: s.priority, reverse=True):
            rows.append(
                {
                    "name": skill.name,
                    "enabled": skill.enabled,
                    "priority": skill.priority,
                    "cooldown_seconds": int(skill.skill_config.get("cooldown_seconds", 0)),
                }
            )
        return rows

    def evaluate(self, observation: Observation) -> List[SkillOutcome]:
        outcomes: List[SkillOutcome] = []
        for skill in sorted(self.skills, key=lambda s: s.priority, reverse=True):
            if not skill.enabled:
                outcomes.append(SkillOutcome(skill.name, "disabled", "skill disabled", priority=skill.priority))
                continue
            outcome = skill.evaluate(observation)
            outcomes.append(outcome)
            if outcome.abort:
                break
        return outcomes

    def select_actions(self, outcomes: List[SkillOutcome]) -> List[Action]:
        actions: List[Action] = []
        if any(outcome.abort for outcome in outcomes):
            return actions
        for outcome in outcomes:
            if outcome.status == "candidate":
                actions.extend(outcome.actions)
        return actions


from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class Rect:
    x: int
    y: int
    width: int
    height: int

    def inset(self, insets: Dict[str, int]) -> "Rect":
        left = int(insets.get("left", 0))
        top = int(insets.get("top", 0))
        right = int(insets.get("right", 0))
        bottom = int(insets.get("bottom", 0))
        return Rect(
            x=self.x + left,
            y=self.y + top,
            width=max(1, self.width - left - right),
            height=max(1, self.height - top - bottom),
        )

    def point_from_norm(self, x_norm: float, y_norm: float) -> tuple[int, int]:
        x = self.x + round(self.width * x_norm)
        y = self.y + round(self.height * y_norm)
        return x, y

    def to_dict(self) -> Dict[str, int]:
        return asdict(self)


@dataclass
class Action:
    kind: str
    label: str
    risk: str = "low"
    x_norm: Optional[float] = None
    y_norm: Optional[float] = None
    key: Optional[str] = None
    seconds: Optional[float] = None
    reason: str = ""
    source_skill: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Observation:
    now: datetime
    screenshot_path: Path
    window_rect: Rect
    content_rect: Rect
    screen: str = "unknown"
    detected_text: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    vision: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "now": self.now.isoformat(),
            "screenshot_path": str(self.screenshot_path),
            "window_rect": self.window_rect.to_dict(),
            "content_rect": self.content_rect.to_dict(),
            "screen": self.screen,
            "detected_text": self.detected_text,
            "metadata": self.metadata,
            "vision": self.vision,
        }


@dataclass
class SkillOutcome:
    skill: str
    status: str
    reason: str
    actions: List[Action] = field(default_factory=list)
    risk: str = "low"
    priority: int = 0
    abort: bool = False

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["actions"] = [action.to_dict() for action in self.actions]
        return data


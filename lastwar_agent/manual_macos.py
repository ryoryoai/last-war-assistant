from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from .models import Observation, Rect
from .observer import get_tz


MANUAL_RECT_PATH = Path(".lastwar_agent/macos_mirroring_rect.json")


def _rect_path(cwd: Path) -> Path:
    return cwd / MANUAL_RECT_PATH


def rect_from_dict(data: Dict[str, Any]) -> Rect:
    return Rect(
        x=int(data["x"]),
        y=int(data["y"]),
        width=int(data["width"]),
        height=int(data["height"]),
    )


def load_manual_content_rect(cwd: Path) -> Rect | None:
    path = _rect_path(cwd)
    if not path.exists():
        return None
    import json

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return rect_from_dict(data["content_rect"])


def save_manual_content_rect(cwd: Path, rect: Rect) -> Dict[str, Any]:
    import json

    path = _rect_path(cwd)
    path.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "content_rect": rect.to_dict(),
        "note": "Manual iPhone Mirroring content rect for coordinate-only route execution.",
    }
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    return data


def save_manual_content_rect_from_points(
    cwd: Path,
    top_left_x: int,
    top_left_y: int,
    bottom_right_x: int,
    bottom_right_y: int,
) -> Dict[str, Any]:
    left = min(top_left_x, bottom_right_x)
    top = min(top_left_y, bottom_right_y)
    right = max(top_left_x, bottom_right_x)
    bottom = max(top_left_y, bottom_right_y)
    width = right - left
    height = bottom - top
    if width <= 0 or height <= 0:
        raise ValueError("manual content rect points must create a positive width and height")
    return save_manual_content_rect(cwd, Rect(x=left, y=top, width=width, height=height))


def manual_rect_observation(config: Dict[str, Any], cwd: Path, tag: str = "manual-route") -> Observation:
    rect = load_manual_content_rect(cwd)
    if rect is None:
        raise ValueError(
            "manual macOS mirroring rect is not configured. Run set-macos-manual-rect first."
        )
    tz = get_tz(config["scheduler"].get("timezone", "Asia/Tokyo"))
    now = datetime.now(tz=tz)
    return Observation(
        now=now,
        screenshot_path=cwd / ".lastwar_agent" / f"{tag}-no-screenshot.png",
        window_rect=rect,
        content_rect=rect,
        screen="manual_rect_no_screenshot",
        metadata={
            "backend": "macos_mirroring",
            "manual_content_rect": True,
            "requires_window_position_to_remain_fixed": True,
        },
    )

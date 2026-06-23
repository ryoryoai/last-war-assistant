from __future__ import annotations

from datetime import datetime
from pathlib import Path
import subprocess
from typing import Any, Dict, Optional
from zoneinfo import ZoneInfo

try:
    from PIL import Image, ImageStat
except Exception:
    Image = None
    ImageStat = None

from .macos import capture_rect, get_window_rect
from .models import Observation


def get_tz(name: str):
    try:
        return ZoneInfo(name)
    except Exception:
        return None


class Observer:
    def __init__(self, config: Dict[str, Any], cwd: Path):
        self.config = config
        self.cwd = cwd

    def observe(self, tag: str = "observe") -> Observation:
        app_cfg = self.config["app"]
        runtime = self.config["runtime"]
        tz = get_tz(self.config["scheduler"].get("timezone", "Asia/Tokyo"))
        now = datetime.now(tz=tz)
        process, window_rect = get_window_rect(app_cfg["process_names"])
        content_rect = window_rect.inset(app_cfg.get("content_insets", {}))
        stamp = now.strftime("%Y%m%d-%H%M%S")
        out_dir = self.cwd / runtime["log_dir"] / now.strftime("%Y%m%d")
        screenshot_path = out_dir / f"{runtime['screenshot_prefix']}-{tag}-{stamp}.png"
        capture_rect(content_rect, screenshot_path)

        metadata = self._basic_image_metadata(screenshot_path)
        metadata["process_name"] = process
        screen = "home_or_game" if metadata.get("non_blank") else "blank_or_locked"
        return Observation(
            now=now,
            screenshot_path=screenshot_path,
            window_rect=window_rect,
            content_rect=content_rect,
            screen=screen,
            metadata=metadata,
        )

    def _basic_image_metadata(self, path: Path) -> Dict[str, Any]:
        if Image is None or ImageStat is None:
            return self._basic_image_metadata_with_sips(path)
        with Image.open(path) as image:
            rgb = image.convert("RGB")
            stat = ImageStat.Stat(rgb)
            extrema = rgb.getextrema()
            width, height = rgb.size
        spread = sum(channel[1] - channel[0] for channel in extrema)
        return {
            "width": width,
            "height": height,
            "mean_rgb": [round(v, 2) for v in stat.mean],
            "spread": spread,
            "non_blank": spread > 60 and width > 100 and height > 100,
        }

    def _basic_image_metadata_with_sips(self, path: Path) -> Dict[str, Any]:
        result = subprocess.run(
            ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
            text=True,
            capture_output=True,
            check=True,
        )
        width = 0
        height = 0
        for line in result.stdout.splitlines():
            stripped = line.strip()
            if stripped.startswith("pixelWidth:"):
                width = int(stripped.split(":", 1)[1].strip())
            elif stripped.startswith("pixelHeight:"):
                height = int(stripped.split(":", 1)[1].strip())
        return {
            "width": width,
            "height": height,
            "mean_rgb": [],
            "spread": None,
            "non_blank": width > 100 and height > 100,
            "metadata_provider": "sips",
        }

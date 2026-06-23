from __future__ import annotations

import json
import struct
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

from .manual_macos import load_manual_content_rect


ROUTE_CALIBRATION_PATH = Path(".lastwar_agent/route_calibration.json")


def route_calibration_path(cwd: Path) -> Path:
    return cwd / ROUTE_CALIBRATION_PATH


def load_route_calibration(cwd: Path) -> Dict[str, Any]:
    path = route_calibration_path(cwd)
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_route_calibration(cwd: Path, data: Dict[str, Any]) -> None:
    path = route_calibration_path(cwd)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")


def apply_route_calibration(config: Dict[str, Any], calibration: Dict[str, Any]) -> Dict[str, Any]:
    routes = config.get("routes", {})
    for route_name, route_override in calibration.get("routes", {}).items():
        if route_name not in routes:
            continue
        route = routes[route_name]
        if "calibrated" in route_override:
            route["calibrated"] = bool(route_override["calibrated"])
        step_overrides = route_override.get("steps", {})
        for step in route.get("steps", []):
            step_id = step.get("id") or step.get("label")
            if step_id in step_overrides:
                override = step_overrides[step_id]
                for key in ("x_norm", "y_norm", "seconds", "risk", "reason", "label"):
                    if key in override:
                        step[key] = override[key]
    return config


def set_route_point(
    cwd: Path,
    route_name: str,
    step_id: str,
    x_norm: float,
    y_norm: float,
    calibrated: Optional[bool] = None,
) -> Dict[str, Any]:
    if not 0 <= x_norm <= 1 or not 0 <= y_norm <= 1:
        raise ValueError("x_norm and y_norm must be between 0 and 1")
    data = load_route_calibration(cwd)
    route = data.setdefault("routes", {}).setdefault(route_name, {})
    if calibrated is not None:
        route["calibrated"] = calibrated
    route.setdefault("steps", {}).setdefault(step_id, {})
    route["steps"][step_id]["x_norm"] = x_norm
    route["steps"][step_id]["y_norm"] = y_norm
    data["updated_at"] = datetime.now().astimezone().isoformat()
    save_route_calibration(cwd, data)
    return data


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as f:
        header = f.read(24)
    if len(header) < 24 or header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise ValueError(f"not a PNG screenshot: {path}")
    width, height = struct.unpack(">II", header[16:24])
    return int(width), int(height)


def set_route_point_from_pixel(
    cwd: Path,
    route_name: str,
    step_id: str,
    screenshot_path: Path,
    x_pixel: float,
    y_pixel: float,
    calibrated: Optional[bool] = None,
) -> Dict[str, Any]:
    width, height = png_dimensions(screenshot_path)
    if width <= 0 or height <= 0:
        raise ValueError(f"invalid screenshot dimensions: {width}x{height}")
    return set_route_point(
        cwd,
        route_name,
        step_id,
        x_norm=x_pixel / width,
        y_norm=y_pixel / height,
        calibrated=calibrated,
    )


def set_route_point_from_screen(
    cwd: Path,
    route_name: str,
    step_id: str,
    x_screen: float,
    y_screen: float,
    calibrated: Optional[bool] = None,
) -> Dict[str, Any]:
    rect = load_manual_content_rect(cwd)
    if rect is None:
        raise ValueError("manual macOS mirroring rect is not configured. Run set-macos-manual-rect first.")
    x_norm = (x_screen - rect.x) / rect.width
    y_norm = (y_screen - rect.y) / rect.height
    return set_route_point(cwd, route_name, step_id, x_norm=x_norm, y_norm=y_norm, calibrated=calibrated)


def set_route_calibrated(cwd: Path, route_name: str, calibrated: bool) -> Dict[str, Any]:
    data = load_route_calibration(cwd)
    route = data.setdefault("routes", {}).setdefault(route_name, {})
    route["calibrated"] = calibrated
    data["updated_at"] = datetime.now().astimezone().isoformat()
    save_route_calibration(cwd, data)
    return data

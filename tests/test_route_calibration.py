import tempfile
import unittest
from pathlib import Path

from lastwar_agent.config import load_config
from lastwar_agent.manual_macos import save_manual_content_rect
from lastwar_agent.models import Rect
from lastwar_agent.route_calibration import (
    apply_route_calibration,
    load_route_calibration,
    png_dimensions,
    set_route_calibrated,
    set_route_point,
    set_route_point_from_pixel,
    set_route_point_from_screen,
)
from lastwar_agent.routes import route_actions


class RouteCalibrationTests(unittest.TestCase):
    def test_set_route_point_round_trip(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            set_route_point(cwd, "arms_race_schedule", "open_event", 0.11, 0.22, calibrated=True)
            data = load_route_calibration(cwd)
        self.assertTrue(data["routes"]["arms_race_schedule"]["calibrated"])
        self.assertEqual(data["routes"]["arms_race_schedule"]["steps"]["open_event"]["x_norm"], 0.11)

    def test_apply_route_calibration(self):
        config = load_config()
        calibration = {
            "routes": {
                "arms_race_schedule": {
                    "calibrated": True,
                    "steps": {
                        "open_event": {"x_norm": 0.12, "y_norm": 0.34},
                        "open_schedule": {"x_norm": 0.56, "y_norm": 0.78},
                    },
                }
            }
        }
        calibrated = apply_route_calibration(config, calibration)
        actions = route_actions(calibrated, "arms_race_schedule")
        click_actions = [action for action in actions if action.kind == "click_norm"]
        self.assertEqual(click_actions[0].x_norm, 0.12)
        self.assertEqual(click_actions[0].y_norm, 0.34)
        self.assertEqual(click_actions[1].x_norm, 0.56)
        self.assertEqual(click_actions[1].y_norm, 0.78)

    def test_mark_route_uncalibrated(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            set_route_calibrated(cwd, "arms_race_schedule", True)
            set_route_calibrated(cwd, "arms_race_schedule", False)
            data = load_route_calibration(cwd)
        self.assertFalse(data["routes"]["arms_race_schedule"]["calibrated"])

    def test_set_route_point_from_png_pixel(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            screenshot = cwd / "screenshot.png"
            screenshot.write_bytes(
                b"\x89PNG\r\n\x1a\n"
                + (13).to_bytes(4, "big")
                + b"IHDR"
                + (200).to_bytes(4, "big")
                + (400).to_bytes(4, "big")
                + b"\x08\x02\x00\x00\x00"
                + b"\x00\x00\x00\x00"
            )
            self.assertEqual(png_dimensions(screenshot), (200, 400))
            data = set_route_point_from_pixel(
                cwd,
                "arms_race_schedule",
                "open_event",
                screenshot,
                x_pixel=50,
                y_pixel=100,
            )
        point = data["routes"]["arms_race_schedule"]["steps"]["open_event"]
        self.assertEqual(point["x_norm"], 0.25)
        self.assertEqual(point["y_norm"], 0.25)

    def test_set_route_point_from_screen_uses_manual_rect(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            save_manual_content_rect(cwd, Rect(x=100, y=200, width=300, height=600))
            data = set_route_point_from_screen(
                cwd,
                "arms_race_schedule",
                "open_schedule",
                x_screen=250,
                y_screen=500,
            )
        point = data["routes"]["arms_race_schedule"]["steps"]["open_schedule"]
        self.assertEqual(point["x_norm"], 0.5)
        self.assertEqual(point["y_norm"], 0.5)


if __name__ == "__main__":
    unittest.main()

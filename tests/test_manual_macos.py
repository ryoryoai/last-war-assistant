import tempfile
import unittest
from pathlib import Path

from lastwar_agent.config import load_config
from lastwar_agent.manual_macos import (
    load_manual_content_rect,
    manual_rect_observation,
    save_manual_content_rect,
    save_manual_content_rect_from_points,
)
from lastwar_agent.models import Rect


class ManualMacOSTests(unittest.TestCase):
    def test_save_load_and_observe_manual_rect(self):
        config = load_config()
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            save_manual_content_rect(cwd, Rect(x=10, y=20, width=300, height=600))
            rect = load_manual_content_rect(cwd)
            self.assertEqual(rect, Rect(x=10, y=20, width=300, height=600))

            observation = manual_rect_observation(config, cwd)
            self.assertEqual(observation.content_rect, rect)
            self.assertEqual(observation.screen, "manual_rect_no_screenshot")
            self.assertTrue(observation.metadata["manual_content_rect"])

    def test_save_manual_rect_from_points(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            save_manual_content_rect_from_points(
                cwd,
                top_left_x=100,
                top_left_y=200,
                bottom_right_x=400,
                bottom_right_y=800,
            )
            self.assertEqual(load_manual_content_rect(cwd), Rect(x=100, y=200, width=300, height=600))


if __name__ == "__main__":
    unittest.main()

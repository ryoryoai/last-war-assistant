from datetime import datetime
from zoneinfo import ZoneInfo
import unittest

from lastwar_agent.config import load_config
from lastwar_agent.scheduler import current_arms_race_window


class SchedulerTests(unittest.TestCase):
    def test_start_window_after_offset(self):
        config = load_config()
        now = datetime(2026, 6, 21, 4, 3, tzinfo=ZoneInfo("Asia/Tokyo"))
        window = current_arms_race_window(now, config)
        self.assertTrue(window["is_start_window"])
        self.assertFalse(window["is_precheck_window"])

    def test_precheck_window(self):
        config = load_config()
        now = datetime(2026, 6, 21, 7, 55, tzinfo=ZoneInfo("Asia/Tokyo"))
        window = current_arms_race_window(now, config)
        self.assertFalse(window["is_start_window"])
        self.assertTrue(window["is_precheck_window"])


if __name__ == "__main__":
    unittest.main()


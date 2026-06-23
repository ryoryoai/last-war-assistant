from datetime import datetime
from pathlib import Path
import unittest
from unittest import mock

from lastwar_agent.config import load_config
from lastwar_agent.executor import Executor
from lastwar_agent.macos import AutomationAccessError
from lastwar_agent.models import Action, Observation, Rect


class ExecutorTests(unittest.TestCase):
    def setUp(self):
        self.config = load_config()
        self.executor = Executor(self.config, dry_run=True)
        self.observation = Observation(
            now=datetime(2026, 6, 21, 12, 0),
            screenshot_path=Path("dummy.png"),
            window_rect=Rect(0, 0, 300, 600),
            content_rect=Rect(10, 20, 300, 600),
        )

    def test_allows_low_risk_normalized_click(self):
        action = Action(kind="click_norm", label="safe", x_norm=0.5, y_norm=0.5, risk="low")
        allowed, _ = self.executor.is_allowed(action)
        self.assertTrue(allowed)

    def test_rejects_high_risk(self):
        action = Action(kind="click_norm", label="unsafe", x_norm=0.5, y_norm=0.5, risk="high")
        allowed, reason = self.executor.is_allowed(action)
        self.assertFalse(allowed)
        self.assertIn("risk", reason)

    def test_rejects_out_of_range_coordinates(self):
        action = Action(kind="click_norm", label="bad", x_norm=1.5, y_norm=0.5, risk="low")
        allowed, reason = self.executor.is_allowed(action)
        self.assertFalse(allowed)
        self.assertIn("out of range", reason)

    @mock.patch("lastwar_agent.executor.click_global")
    @mock.patch("lastwar_agent.executor.macos_permissions")
    def test_execute_requires_accessibility_for_click(self, macos_permissions_mock, click_global_mock):
        macos_permissions_mock.return_value = {"accessibility": False, "screen_capture": False}
        executor = Executor(self.config, dry_run=False)
        action = Action(kind="click_norm", label="safe", x_norm=0.5, y_norm=0.5, risk="low")

        with self.assertRaises(AutomationAccessError):
            executor.execute([action], self.observation, max_actions=1)

        click_global_mock.assert_not_called()

    @mock.patch("lastwar_agent.executor.click_global")
    @mock.patch("lastwar_agent.executor.macos_permissions")
    def test_execute_click_when_accessibility_is_allowed(self, macos_permissions_mock, click_global_mock):
        macos_permissions_mock.return_value = {"accessibility": True, "screen_capture": False}
        executor = Executor(self.config, dry_run=False)
        action = Action(kind="click_norm", label="safe", x_norm=0.5, y_norm=0.5, risk="low")

        results = executor.execute([action], self.observation, max_actions=1)

        self.assertTrue(results[0]["executed"])
        click_global_mock.assert_called_once_with(160, 320)


if __name__ == "__main__":
    unittest.main()

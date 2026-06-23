import tempfile
import unittest
from pathlib import Path
from unittest import mock

from lastwar_agent.config import load_config
from lastwar_agent.manual_macos import save_manual_content_rect
from lastwar_agent.models import Rect
from lastwar_agent.readiness import direct_control_status, macos_mirroring_status


class ReadinessTests(unittest.TestCase):
    @mock.patch("lastwar_agent.readiness.appium_ios_status")
    @mock.patch("lastwar_agent.readiness.macos_mirroring_status")
    def test_reports_not_ready_without_external_state(self, macos_status, appium_status):
        macos_status.return_value = {
            "status": "not_ready",
            "coordinate_only_status": "not_ready",
            "checks": {"window": False, "screen_capture": False, "click_helper": True},
            "blockers": ["window denied"],
            "details": {},
        }
        appium_status.return_value = {
            "status": "not_ready",
            "checks": {"appium_server": False, "lastwar_bundle_id": False, "saved_session": False},
            "blockers": ["appium denied"],
        }
        config = load_config()
        with tempfile.TemporaryDirectory() as tmp:
            status = direct_control_status(config, Path(tmp))
        self.assertEqual(status["status"], "not_ready")
        self.assertEqual(status["automation_status"], "not_ready")
        self.assertIn("lastwar_bundle_id", status["checks"])
        self.assertFalse(status["checks"]["macos_mirroring"])
        self.assertFalse(status["checks"]["macos_mirroring_coordinate_only"])
        self.assertFalse(status["checks"]["appium_ios"])
        self.assertTrue(status["blockers"])

    @mock.patch("lastwar_agent.readiness.compile_click_helper")
    @mock.patch("lastwar_agent.readiness.macos_permissions")
    @mock.patch("lastwar_agent.readiness.capture_rect")
    @mock.patch("lastwar_agent.readiness.get_window_rect")
    def test_macos_mirroring_ready_when_window_capture_and_click_helper_work(
        self,
        get_window_rect_mock,
        capture_rect_mock,
        macos_permissions_mock,
        compile_click_helper_mock,
    ):
        config = load_config()
        get_window_rect_mock.return_value = ("iPhone Mirroring", Rect(10, 20, 300, 600))
        macos_permissions_mock.return_value = {"accessibility": True, "screen_capture": True}
        compile_click_helper_mock.return_value = Path("/tmp/macos_click")

        with tempfile.TemporaryDirectory() as tmp:
            status = macos_mirroring_status(config, Path(tmp))

        self.assertEqual(status["status"], "ready")
        self.assertTrue(status["checks"]["window"])
        self.assertTrue(status["checks"]["screen_capture"])
        self.assertTrue(status["checks"]["click_helper"])
        capture_rect_mock.assert_called_once()

    @mock.patch("lastwar_agent.readiness.appium_ios_status")
    @mock.patch("lastwar_agent.readiness.compile_click_helper")
    @mock.patch("lastwar_agent.readiness.macos_permissions")
    @mock.patch("lastwar_agent.readiness.get_window_rect")
    def test_direct_status_rejects_coordinate_only_without_accessibility(
        self,
        get_window_rect_mock,
        macos_permissions_mock,
        compile_click_helper_mock,
        appium_status_mock,
    ):
        config = load_config()
        get_window_rect_mock.side_effect = RuntimeError("window denied")
        macos_permissions_mock.return_value = {"accessibility": False, "screen_capture": False}
        compile_click_helper_mock.return_value = Path("/tmp/macos_click")
        appium_status_mock.return_value = {
            "status": "not_ready",
            "checks": {"appium_server": False, "lastwar_bundle_id": False, "saved_session": False},
            "blockers": ["appium denied"],
        }

        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            save_manual_content_rect(cwd, Rect(x=10, y=20, width=300, height=600))
            status = direct_control_status(config, cwd)

        self.assertEqual(status["status"], "not_ready")
        self.assertEqual(status["automation_status"], "not_ready")
        self.assertFalse(status["checks"]["macos_mirroring_coordinate_only"])
        self.assertFalse(status["checks"]["macos_mirroring"])

    @mock.patch("lastwar_agent.readiness.appium_ios_status")
    @mock.patch("lastwar_agent.readiness.compile_click_helper")
    @mock.patch("lastwar_agent.readiness.macos_permissions")
    @mock.patch("lastwar_agent.readiness.get_window_rect")
    def test_direct_status_reports_coordinate_only_with_accessibility(
        self,
        get_window_rect_mock,
        macos_permissions_mock,
        compile_click_helper_mock,
        appium_status_mock,
    ):
        config = load_config()
        get_window_rect_mock.side_effect = RuntimeError("window denied")
        macos_permissions_mock.return_value = {"accessibility": True, "screen_capture": False}
        compile_click_helper_mock.return_value = Path("/tmp/macos_click")
        appium_status_mock.return_value = {
            "status": "not_ready",
            "checks": {"appium_server": False, "lastwar_bundle_id": False, "saved_session": False},
            "blockers": ["appium denied"],
        }

        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            save_manual_content_rect(cwd, Rect(x=10, y=20, width=300, height=600))
            status = direct_control_status(config, cwd)

        self.assertEqual(status["status"], "not_ready")
        self.assertTrue(status["checks"]["macos_mirroring_coordinate_only"])
        self.assertFalse(status["checks"]["macos_mirroring"])


if __name__ == "__main__":
    unittest.main()

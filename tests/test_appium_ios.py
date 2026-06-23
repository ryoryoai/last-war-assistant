import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from lastwar_agent.appium_ios import AppiumError, AppiumIosBackend, build_capabilities
from lastwar_agent.config import load_config


class AppiumIosTests(unittest.TestCase):
    def test_requires_bundle_id_or_app_target(self):
        config = load_config()
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(AppiumError):
                build_capabilities(config)

    def test_uses_bundle_id_from_env(self):
        config = load_config()
        with patch.dict(os.environ, {"LASTWAR_IOS_BUNDLE_ID": "com.example.lastwar"}, clear=True):
            capabilities = build_capabilities(config)
        self.assertEqual(capabilities["appium:bundleId"], "com.example.lastwar")
        self.assertEqual(capabilities["platformName"], "iOS")
        self.assertEqual(capabilities["appium:automationName"], "XCUITest")

    def test_uses_bundle_id_from_device_config(self):
        config = load_config()
        with tempfile.TemporaryDirectory() as tmp:
            from lastwar_agent.device_config import save_lastwar_bundle_id

            cwd = Path(tmp)
            save_lastwar_bundle_id(cwd, "com.example.savedlastwar", source="test")
            with patch.dict(os.environ, {}, clear=True):
                capabilities = build_capabilities(config, cwd)
        self.assertEqual(capabilities["appium:bundleId"], "com.example.savedlastwar")

    def test_uses_udid_from_env(self):
        config = load_config()
        env = {
            "LASTWAR_IOS_BUNDLE_ID": "com.example.lastwar",
            "LASTWAR_IOS_UDID": "00000000-0000000000000000",
        }
        with patch.dict(os.environ, env, clear=True):
            capabilities = build_capabilities(config)
        self.assertEqual(capabilities["appium:udid"], "00000000-0000000000000000")

    def test_session_state_round_trip(self):
        config = load_config()
        with tempfile.TemporaryDirectory() as tmp:
            backend = AppiumIosBackend(config, Path(tmp))
            state = {
                "backend": "appium_ios",
                "session_id": "abc",
                "server_url": "http://127.0.0.1:4723/",
                "width": 390,
                "height": 844,
            }
            backend.save_session_state(state)
            self.assertEqual(backend.load_session_state()["session_id"], "abc")
            backend.clear_session_state()
            with self.assertRaises(AppiumError):
                backend.load_session_state()


if __name__ == "__main__":
    unittest.main()

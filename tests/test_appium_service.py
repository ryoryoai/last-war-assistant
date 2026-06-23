import tempfile
import unittest
from pathlib import Path

from lastwar_agent.appium_service import (
    AppiumServiceError,
    load_appium_server_state,
    save_appium_server_state,
    stop_appium_server,
)


class AppiumServiceTests(unittest.TestCase):
    def test_server_state_round_trip(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            save_appium_server_state(cwd, {"pid": 123, "log_path": "runs/appium.log"})
            self.assertEqual(load_appium_server_state(cwd)["pid"], 123)

    def test_stop_without_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = stop_appium_server(Path(tmp))
        self.assertFalse(result["stopped"])
        self.assertIn("no saved", result["reason"])


if __name__ == "__main__":
    unittest.main()


import tempfile
import unittest
from pathlib import Path

from lastwar_agent.device_config import (
    configured_lastwar_bundle_id,
    find_lastwar_apps,
    save_lastwar_bundle_id,
)


class DeviceConfigTests(unittest.TestCase):
    def test_find_lastwar_apps_from_flat_payload(self):
        apps = [
            {"name": "Settings", "bundleId": "com.apple.Preferences"},
            {"name": "Last War: Survival", "bundleId": "com.fun.lastwar.ios"},
        ]
        matches = find_lastwar_apps(apps)
        self.assertEqual(matches[0]["bundle_id"], "com.fun.lastwar.ios")

    def test_find_lastwar_apps_from_nested_payload(self):
        payload = {
            "value": {
                "user": [
                    {"CFBundleDisplayName": "ラストウォー", "CFBundleIdentifier": "com.example.lastwar"}
                ]
            }
        }
        matches = find_lastwar_apps(payload)
        self.assertEqual(matches[0]["bundle_id"], "com.example.lastwar")

    def test_save_and_load_bundle_id(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            save_lastwar_bundle_id(cwd, "com.example.lastwar", source="test")
            self.assertEqual(configured_lastwar_bundle_id(cwd), "com.example.lastwar")


if __name__ == "__main__":
    unittest.main()


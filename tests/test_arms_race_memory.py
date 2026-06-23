import tempfile
import unittest
from pathlib import Path

from lastwar_agent.arms_race_memory import load_arms_race_memory, update_arms_race_attempt


class ArmsRaceMemoryTests(unittest.TestCase):
    def test_updates_dry_run_attempt(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            data = update_arms_race_attempt(
                cwd,
                {
                    "ok": True,
                    "backend": "macos_mirroring",
                    "dry_run": True,
                    "execute": False,
                    "route_result": {"route": "arms_race_schedule"},
                },
            )
            current = data["current_live_state"]
            self.assertEqual(current["status"], "route_previewed")
            self.assertEqual(current["last_route_attempt"]["backend"], "macos_mirroring")

            loaded = load_arms_race_memory(cwd)
            self.assertEqual(loaded["current_live_state"]["status"], "route_previewed")

    def test_records_post_observation(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            data = update_arms_race_attempt(
                cwd,
                {
                    "ok": True,
                    "backend": "appium_ios",
                    "dry_run": False,
                    "execute": True,
                    "route_result": {"route": "arms_race_schedule"},
                    "post_observation": {
                        "now": "2026-06-21T23:00:00+09:00",
                        "screen": "device_session",
                        "screenshot_path": "runs/20260621/lastwar-appium-after.png",
                    },
                },
            )
            current = data["current_live_state"]
            self.assertEqual(current["status"], "observed_after_route")
            self.assertEqual(current["observed_at"], "2026-06-21T23:00:00+09:00")
            self.assertEqual(current["last_route_attempt"]["post_screenshot_path"], "runs/20260621/lastwar-appium-after.png")

    def test_records_ocr_text(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            data = update_arms_race_attempt(
                cwd,
                {
                    "ok": True,
                    "backend": "appium_ios",
                    "dry_run": False,
                    "execute": True,
                    "route_result": {"route": "arms_race_schedule"},
                    "post_observation": {
                        "now": "2026-06-21T23:00:00+09:00",
                        "screen": "device_session",
                        "screenshot_path": "runs/20260621/lastwar-appium-after.png",
                    },
                    "ocr": {
                        "image_path": "runs/20260621/lastwar-appium-after.png",
                        "text": ["軍拡", "日程"],
                        "text_joined": "軍拡\n日程",
                    },
                },
            )
            current = data["current_live_state"]
            self.assertEqual(current["detected_text"], ["軍拡", "日程"])
            self.assertEqual(current["ocr"]["status"], "ok")
            self.assertEqual(current["ocr"]["text_count"], 2)

    def test_records_ready_gate_skip(self):
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp)
            data = update_arms_race_attempt(
                cwd,
                {
                    "ok": False,
                    "skipped": True,
                    "backend": "macos_mirroring",
                    "dry_run": False,
                    "execute": True,
                    "gate": {
                        "ready": False,
                        "skipped": True,
                        "blockers": ["Accessibility permission is missing"],
                    },
                    "error": "direct control is not ready: Accessibility permission is missing",
                },
            )
            current = data["current_live_state"]
            self.assertEqual(current["status"], "skipped_not_ready")
            self.assertTrue(current["last_route_attempt"]["skipped"])
            self.assertEqual(current["required_before_retry"], ["Accessibility permission is missing"])


if __name__ == "__main__":
    unittest.main()

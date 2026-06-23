import unittest

from lastwar_agent.readiness_gate import arms_race_schedule_execution_gate


class ReadinessGateTests(unittest.TestCase):
    def test_dry_run_does_not_require_direct_control(self):
        gate = arms_race_schedule_execution_gate(
            {"checks": {}},
            backend_name="macos_mirroring",
            execute=False,
        )
        self.assertTrue(gate["ready"])
        self.assertFalse(gate["skipped"])

    def test_appium_new_session_does_not_require_saved_session(self):
        gate = arms_race_schedule_execution_gate(
            {
                "checks": {
                    "appium_ios": False,
                    "appium_server": True,
                    "lastwar_bundle_id": True,
                    "saved_session": False,
                    "arms_race_schedule_calibrated": True,
                }
            },
            backend_name="appium_ios",
            execute=True,
            use_session=False,
        )
        self.assertTrue(gate["ready"])

    def test_appium_saved_session_requires_appium_ready(self):
        gate = arms_race_schedule_execution_gate(
            {
                "checks": {
                    "appium_ios": False,
                    "appium_server": True,
                    "lastwar_bundle_id": True,
                    "saved_session": False,
                    "arms_race_schedule_calibrated": True,
                }
            },
            backend_name="appium_ios",
            execute=True,
            use_session=True,
        )
        self.assertFalse(gate["ready"])
        self.assertTrue(gate["skipped"])
        self.assertIn("saved-session", gate["blockers"][0])

    def test_macos_manual_rect_requires_coordinate_only_ready(self):
        gate = arms_race_schedule_execution_gate(
            {
                "checks": {
                    "macos_mirroring": False,
                    "macos_mirroring_coordinate_only": True,
                    "arms_race_schedule_calibrated": True,
                }
            },
            backend_name="macos_mirroring",
            execute=True,
            use_manual_rect=True,
        )
        self.assertTrue(gate["ready"])

    def test_uncalibrated_route_blocks_execution_by_default(self):
        gate = arms_race_schedule_execution_gate(
            {
                "checks": {
                    "macos_mirroring": True,
                    "macos_mirroring_coordinate_only": True,
                    "arms_race_schedule_calibrated": False,
                }
            },
            backend_name="macos_mirroring",
            execute=True,
            use_manual_rect=True,
        )
        self.assertFalse(gate["ready"])
        self.assertIn("arms_race_schedule is not calibrated", gate["blockers"][0])

    def test_allow_uncalibrated_bypasses_calibration_blocker(self):
        gate = arms_race_schedule_execution_gate(
            {
                "checks": {
                    "macos_mirroring": True,
                    "macos_mirroring_coordinate_only": True,
                    "arms_race_schedule_calibrated": False,
                }
            },
            backend_name="macos_mirroring",
            execute=True,
            use_manual_rect=True,
            allow_uncalibrated=True,
        )
        self.assertTrue(gate["ready"])
        self.assertTrue(gate["warnings"])


if __name__ == "__main__":
    unittest.main()

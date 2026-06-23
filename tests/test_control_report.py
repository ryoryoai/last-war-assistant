import unittest

from lastwar_agent.control_report import summarize_bootstrap_report, summarize_report


class ControlReportTests(unittest.TestCase):
    def test_ready_when_required_steps_pass(self):
        report = {
            "created_at": "2026-06-21T00:00:00+00:00",
            "steps": [
                {"name": "doctor", "ok": True, "returncode": 0},
                {"name": "appium_status", "ok": True, "returncode": 0},
                {"name": "ios_list_apps", "ok": True, "returncode": 0},
                {"name": "ios_observe", "ok": True, "returncode": 0},
            ],
        }
        summary = summarize_report(report)
        self.assertEqual(summary["status"], "ready")
        self.assertEqual(summary["blockers"], [])

    def test_not_ready_when_appium_status_fails(self):
        report = {
            "created_at": "2026-06-21T00:00:00+00:00",
            "steps": [
                {"name": "doctor", "ok": True, "returncode": 0},
                {"name": "appium_status", "ok": False, "returncode": 2, "stderr": "not running"},
                {"name": "ios_list_apps", "ok": True, "returncode": 0},
            ],
        }
        summary = summarize_report(report)
        self.assertEqual(summary["status"], "not_ready")
        self.assertTrue(any("appium_status failed" in blocker for blocker in summary["blockers"]))

    def test_partially_ready_when_only_observe_fails(self):
        report = {
            "created_at": "2026-06-21T00:00:00+00:00",
            "steps": [
                {"name": "doctor", "ok": True, "returncode": 0},
                {"name": "appium_status", "ok": True, "returncode": 0},
                {"name": "ios_list_apps", "ok": True, "returncode": 0},
                {"name": "ios_observe", "ok": False, "returncode": 2, "stderr": "bundle id missing"},
            ],
        }
        summary = summarize_report(report)
        self.assertEqual(summary["status"], "partially_ready")
        self.assertTrue(any("ios_observe not verified" in blocker for blocker in summary["blockers"]))

    def test_partially_ready_when_discovery_fails(self):
        report = {
            "created_at": "2026-06-21T00:00:00+00:00",
            "steps": [
                {"name": "doctor", "ok": True, "returncode": 0},
                {"name": "appium_status", "ok": True, "returncode": 0},
                {"name": "ios_list_apps", "ok": True, "returncode": 0},
                {"name": "ios_discover_lastwar", "ok": False, "returncode": 1, "stdout": "no match"},
            ],
        }
        summary = summarize_report(report)
        self.assertEqual(summary["status"], "partially_ready")
        self.assertTrue(any("ios_discover_lastwar not verified" in blocker for blocker in summary["blockers"]))

    def test_bootstrap_report_summary(self):
        report = {
            "created_at": "2026-06-21T00:00:00+00:00",
            "ok": False,
            "steps": [
                {"name": "ensure_appium_server", "ok": False, "error": "not installed"},
                {"name": "discover_lastwar", "ok": False, "error": "no server"},
            ],
        }
        summary = summarize_bootstrap_report(report)
        self.assertEqual(summary["status"], "not_ready")
        self.assertTrue(any("ensure_appium_server failed" in blocker for blocker in summary["blockers"]))


if __name__ == "__main__":
    unittest.main()

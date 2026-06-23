import unittest

from lastwar_agent.config import load_config
from lastwar_agent.routes import RouteError, list_routes, route_actions


class RouteTests(unittest.TestCase):
    def test_lists_arms_race_schedule_route(self):
        config = load_config()
        names = {route["name"] for route in list_routes(config)}
        self.assertIn("arms_race_schedule", names)

    def test_uncalibrated_route_requires_override(self):
        config = load_config()
        with self.assertRaises(RouteError):
            route_actions(config, "arms_race_schedule")

    def test_uncalibrated_route_can_be_dry_run_materialized(self):
        config = load_config()
        actions = route_actions(config, "arms_race_schedule", allow_uncalibrated=True)
        self.assertGreaterEqual(len(actions), 2)
        self.assertEqual(actions[0].kind, "click_norm")
        self.assertEqual(actions[0].source_skill, "route:arms_race_schedule")


if __name__ == "__main__":
    unittest.main()


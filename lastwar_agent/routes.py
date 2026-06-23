from __future__ import annotations

from typing import Any, Dict, List

from .models import Action


class RouteError(RuntimeError):
    pass


def list_routes(config: Dict[str, Any]) -> List[Dict[str, Any]]:
    routes = config.get("routes", {})
    return [
        {
            "name": name,
            "description": route.get("description", ""),
            "calibrated": bool(route.get("calibrated", False)),
            "steps": len(route.get("steps", [])),
        }
        for name, route in sorted(routes.items())
    ]


def route_actions(config: Dict[str, Any], route_name: str, allow_uncalibrated: bool = False) -> List[Action]:
    routes = config.get("routes", {})
    if route_name not in routes:
        raise RouteError(f"unknown route: {route_name}")
    route = routes[route_name]
    if not route.get("calibrated", False) and not allow_uncalibrated:
        raise RouteError(
            f"route '{route_name}' is not calibrated. Review config/default.json or use "
            "--allow-uncalibrated only for deliberate test taps."
        )

    actions: List[Action] = []
    for index, step in enumerate(route.get("steps", []), start=1):
        kind = step.get("kind")
        if kind == "tap":
            actions.append(
                Action(
                    kind="click_norm",
                    label=step.get("label", f"{route_name} step {index}"),
                    x_norm=float(step["x_norm"]),
                    y_norm=float(step["y_norm"]),
                    risk=step.get("risk", "low"),
                    reason=step.get("reason", route.get("description", "")),
                    source_skill=f"route:{route_name}",
                )
            )
        elif kind == "wait":
            actions.append(
                Action(
                    kind="wait",
                    label=step.get("label", f"{route_name} wait {index}"),
                    seconds=float(step.get("seconds", 1.0)),
                    risk=step.get("risk", "low"),
                    reason=step.get("reason", "route wait"),
                    source_skill=f"route:{route_name}",
                )
            )
        else:
            raise RouteError(f"unsupported route step kind at {route_name}[{index}]: {kind}")
    return actions


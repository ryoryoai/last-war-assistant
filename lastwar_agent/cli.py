from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lastwar_agent.appium_ios import AppiumError, AppiumIosBackend, AppiumIosExecutor
from lastwar_agent.appium_service import AppiumServiceError, ensure_appium_server, stop_appium_server
from lastwar_agent.arms_race_memory import update_arms_race_attempt
from lastwar_agent.bootstrap import bootstrap_direct_control
from lastwar_agent.config import load_config, write_json
from lastwar_agent.control_report import (
    load_report,
    summarize_bootstrap_report,
    summarize_report,
    update_bootstrap_memory,
    update_control_memory,
)
from lastwar_agent.device_config import (
    find_lastwar_apps,
    load_device_config,
    save_lastwar_bundle_id,
)
from lastwar_agent.doctor import run_doctor
from lastwar_agent.executor import Executor
from lastwar_agent.manual_macos import (
    load_manual_content_rect,
    manual_rect_observation,
    save_manual_content_rect,
    save_manual_content_rect_from_points,
)
from lastwar_agent.macos import AutomationAccessError, ScreenCaptureError, macos_permissions, pointer_position
from lastwar_agent.models import Rect
from lastwar_agent.observer import Observer
from lastwar_agent.ocr import ocr_image
from lastwar_agent.planner import VisionPlanner
from lastwar_agent.router import SkillRouter
from lastwar_agent.routes import RouteError, list_routes, route_actions
from lastwar_agent.route_calibration import (
    load_route_calibration,
    set_route_calibrated,
    set_route_point,
    set_route_point_from_pixel,
    set_route_point_from_screen,
)
from lastwar_agent.readiness import direct_control_status
from lastwar_agent.readiness_gate import arms_race_schedule_execution_gate
from lastwar_agent.scheduler import current_arms_race_window
from lastwar_agent.state import StateStore


ROOT = Path(__file__).resolve().parents[1]


def _state(config: Dict[str, Any]) -> StateStore:
    return StateStore(ROOT / config["runtime"]["state_path"])


def _observer(config: Dict[str, Any]) -> Observer:
    return Observer(config, ROOT)


def _backend_name(args: argparse.Namespace, config: Dict[str, Any]) -> str:
    return getattr(args, "backend", None) or config.get("backends", {}).get("default", "macos_mirroring")


def print_json(data: Any) -> None:
    print(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True))


def cmd_observe(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    try:
        observation = _observer(config).observe(tag="observe")
        print_json(observation.to_dict())
    except (AutomationAccessError, ScreenCaptureError) as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_list_skills(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    router = SkillRouter(config, _state(config))
    print_json({"skills": router.list_skills()})
    return 0


def cmd_list_routes(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    print_json({"routes": list_routes(config)})
    return 0


def cmd_route_calibration(args: argparse.Namespace) -> int:
    print_json(load_route_calibration(ROOT))
    return 0


def cmd_set_route_point(args: argparse.Namespace) -> int:
    try:
        print_json(
            set_route_point(
                ROOT,
                args.route_name,
                args.step_id,
                x_norm=args.x,
                y_norm=args.y,
                calibrated=args.calibrated,
            )
        )
    except ValueError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_set_route_point_pixel(args: argparse.Namespace) -> int:
    try:
        print_json(
            set_route_point_from_pixel(
                ROOT,
                args.route_name,
                args.step_id,
                screenshot_path=Path(args.screenshot),
                x_pixel=args.x_pixel,
                y_pixel=args.y_pixel,
                calibrated=args.calibrated,
            )
        )
    except ValueError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_set_route_point_screen(args: argparse.Namespace) -> int:
    try:
        print_json(
            set_route_point_from_screen(
                ROOT,
                args.route_name,
                args.step_id,
                x_screen=args.x_screen,
                y_screen=args.y_screen,
                calibrated=args.calibrated,
            )
        )
    except ValueError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_set_route_calibrated(args: argparse.Namespace) -> int:
    print_json(set_route_calibrated(ROOT, args.route_name, calibrated=not args.no))
    return 0


def cmd_doctor(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    print_json(run_doctor(config))
    return 0


def cmd_direct_control_status(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    status = direct_control_status(config, ROOT)
    print_json(status)
    return 0 if status["status"] == "ready" else 2


def cmd_set_macos_manual_rect(args: argparse.Namespace) -> int:
    rect = Rect(x=args.x, y=args.y, width=args.width, height=args.height)
    print_json(save_manual_content_rect(ROOT, rect))
    return 0


def cmd_set_macos_manual_rect_points(args: argparse.Namespace) -> int:
    try:
        print_json(
            save_manual_content_rect_from_points(
                ROOT,
                top_left_x=args.top_left_x,
                top_left_y=args.top_left_y,
                bottom_right_x=args.bottom_right_x,
                bottom_right_y=args.bottom_right_y,
            )
        )
    except ValueError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_macos_manual_rect(args: argparse.Namespace) -> int:
    rect = load_manual_content_rect(ROOT)
    print_json({"configured": rect is not None, "content_rect": rect.to_dict() if rect else None})
    return 0 if rect is not None else 1


def cmd_macos_pointer_position(args: argparse.Namespace) -> int:
    try:
        x, y = pointer_position()
        print_json({"x": x, "y": y})
    except Exception as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_macos_permissions(args: argparse.Namespace) -> int:
    try:
        print_json(
            macos_permissions(
                prompt_accessibility=args.prompt_accessibility,
                prompt_screen_capture=args.prompt_screen_capture,
            )
        )
    except Exception as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_ocr_screenshot(args: argparse.Namespace) -> int:
    try:
        print_json(ocr_image(Path(args.image)))
    except Exception as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_control_report(args: argparse.Namespace) -> int:
    report_path = Path(args.report)
    if args.ingest:
        memory_path = ROOT / "memory" / "control_state.json"
        print_json(update_control_memory(report_path, memory_path))
        return 0
    print_json(summarize_report(load_report(report_path)))
    return 0


def cmd_bootstrap_report(args: argparse.Namespace) -> int:
    report_path = Path(args.report)
    if args.ingest:
        memory_path = ROOT / "memory" / "control_state.json"
        print_json(update_bootstrap_memory(report_path, memory_path))
        return 0
    print_json(summarize_bootstrap_report(load_report(report_path)))
    return 0


def run_once(args: argparse.Namespace) -> Dict[str, Any]:
    config = load_config(args.config)
    if args.max_actions is not None:
        config["runtime"]["max_actions_per_run"] = args.max_actions
    dry_run = not args.execute if args.dry_run is None else args.dry_run
    backend_name = _backend_name(args, config)
    use_session = bool(getattr(args, "use_session", False))
    appium_backend = None
    observation = None
    if backend_name == "appium_ios":
        appium_backend = AppiumIosBackend(config, ROOT)
        observation = appium_backend.observe_saved_session(tag="run") if use_session else appium_backend.observe(tag="run")
    elif backend_name == "macos_mirroring":
        observation = _observer(config).observe(tag="run")
    else:
        raise ValueError(f"unsupported backend: {backend_name}")

    try:
        if args.planner == "vision":
            planner = VisionPlanner(config)
            observation.vision = planner.plan(observation)

        state = _state(config)
        router = SkillRouter(config, state)
        outcomes = router.evaluate(observation)
        actions = router.select_actions(outcomes)
        if backend_name == "appium_ios":
            assert appium_backend is not None
            executor = AppiumIosExecutor(config, dry_run=dry_run, backend=appium_backend)
        else:
            executor = Executor(config, dry_run=dry_run)
        results = executor.execute(actions, observation, int(config["runtime"]["max_actions_per_run"]))

        executed_skills = {result["action"].get("source_skill") for result in results if result.get("executed")}
        for skill_name in executed_skills:
            if skill_name:
                state.mark_skill_run(skill_name, observation.now)

        run_record = {
            "observation": observation.to_dict(),
            "arms_race": current_arms_race_window(observation.now, config),
            "outcomes": [outcome.to_dict() for outcome in outcomes],
            "results": results,
            "dry_run": dry_run,
            "backend": backend_name,
        }
        state.append_run(run_record)
        state.save()

        log_path = Path(observation.screenshot_path).with_suffix(".json")
        write_json(log_path, run_record)
        return run_record
    finally:
        if appium_backend is not None and observation is not None and not use_session:
            try:
                appium_backend.close(observation)
            except Exception:
                pass


def cmd_run_once(args: argparse.Namespace) -> int:
    try:
        print_json(run_once(args))
    except (AutomationAccessError, ScreenCaptureError, AppiumError, ValueError) as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_appium_status(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    try:
        print_json(AppiumIosBackend(config, ROOT).status())
    except AppiumError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_appium_ensure_server(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    try:
        print_json(ensure_appium_server(config, ROOT))
    except (AppiumServiceError, AppiumError) as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_appium_stop_server(args: argparse.Namespace) -> int:
    print_json(stop_appium_server(ROOT))
    return 0


def cmd_bootstrap_direct_control(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    try:
        report = bootstrap_direct_control(config, ROOT, install=args.install)
        print_json(report)
        return 0 if report.get("ok") else 2
    except (AppiumServiceError, AppiumError) as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2


def cmd_ios_observe(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    backend = AppiumIosBackend(config, ROOT)
    observation = None
    try:
        observation = backend.observe_saved_session(tag="observe") if args.use_session else backend.observe(tag="observe")
        print_json(observation.to_dict())
    except AppiumError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    finally:
        if observation is not None and not args.use_session:
            try:
                backend.close(observation)
            except Exception:
                pass
    return 0


def cmd_ios_start_session(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    try:
        state = AppiumIosBackend(config, ROOT).start_session(bootstrap=args.bootstrap)
        print_json(state)
    except AppiumError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_ios_stop_session(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    try:
        state = AppiumIosBackend(config, ROOT).stop_saved_session()
        print_json({"stopped": state})
    except AppiumError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_ios_session_screenshot(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    try:
        observation = AppiumIosBackend(config, ROOT).observe_saved_session(tag=args.tag)
        print_json(observation.to_dict())
    except AppiumError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_ios_tap(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    dry_run = not args.execute
    backend = AppiumIosBackend(config, ROOT)
    observation = None
    try:
        observation = backend.observe_saved_session(tag="tap") if args.use_session else backend.observe(tag="tap")
        action = {
            "kind": "click_norm",
            "label": "manual normalized tap",
            "risk": "low",
            "x_norm": args.x,
            "y_norm": args.y,
            "source_skill": "manual",
        }
        from lastwar_agent.models import Action

        executor = AppiumIosExecutor(config, dry_run=dry_run, backend=backend)
        results = executor.execute([Action(**action)], observation, max_actions=1)
        print_json({"observation": observation.to_dict(), "results": results})
    except AppiumError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    finally:
        if observation is not None and not args.use_session:
            try:
                backend.close(observation)
            except Exception:
                pass
    return 0


def cmd_ios_list_apps(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    try:
        apps = AppiumIosBackend(config, ROOT).list_apps()
        print_json({"apps": apps})
    except AppiumError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def cmd_ios_discover_lastwar(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    try:
        apps_payload = AppiumIosBackend(config, ROOT).list_apps()
        matches = find_lastwar_apps(apps_payload, terms=args.term)
        result: Dict[str, Any] = {"matches": matches, "saved": None}
        if matches and args.save:
            result["saved"] = save_lastwar_bundle_id(
                ROOT,
                matches[0]["bundle_id"],
                source="appium:listApps",
                app=matches[0],
            )
        print_json(result)
        return 0 if matches else 1
    except AppiumError as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2


def cmd_device_config(args: argparse.Namespace) -> int:
    print_json(load_device_config(ROOT))
    return 0


def execute_route_record(
    config: Dict[str, Any],
    *,
    route_name: str,
    backend_name: str,
    dry_run: bool,
    observe: bool = False,
    use_session: bool = False,
    use_manual_rect: bool = False,
    allow_uncalibrated: bool = False,
    post_observe: bool = False,
) -> Dict[str, Any]:
    appium_backend = None
    observation = None
    try:
        actions = route_actions(
            config,
            route_name,
            allow_uncalibrated=allow_uncalibrated or dry_run,
        )
        if dry_run and not observe:
            validator = Executor(config, dry_run=True)
            return {
                "backend": backend_name,
                "route": route_name,
                "dry_run": True,
                "observed": False,
                "actions": [
                    {
                        "action": action.to_dict(),
                        "allowed": validator.is_allowed(action)[0],
                        "reason": validator.is_allowed(action)[1],
                    }
                    for action in actions
                ],
            }
        if backend_name == "appium_ios":
            appium_backend = AppiumIosBackend(config, ROOT)
            observation = (
                appium_backend.observe_saved_session(tag=f"route-{route_name}")
                if use_session
                else appium_backend.observe(tag=f"route-{route_name}")
            )
            executor = AppiumIosExecutor(config, dry_run=dry_run, backend=appium_backend)
        elif backend_name == "macos_mirroring":
            if use_manual_rect:
                observation = manual_rect_observation(config, ROOT, tag=f"route-{route_name}")
            else:
                observation = _observer(config).observe(tag=f"route-{route_name}")
            executor = Executor(config, dry_run=dry_run)
        else:
            raise ValueError(f"unsupported backend: {backend_name}")

        results = executor.execute(actions, observation, max_actions=len(actions))
        record: Dict[str, Any] = {
            "backend": backend_name,
            "route": route_name,
            "dry_run": dry_run,
            "observation": observation.to_dict(),
            "results": results,
        }
        if post_observe and not dry_run and not use_manual_rect:
            time.sleep(float(config["runtime"].get("action_delay_seconds", 1.2)))
            if backend_name == "appium_ios":
                assert appium_backend is not None
                if use_session:
                    post = appium_backend.observe_saved_session(tag=f"{route_name}-after")
                else:
                    session_id = str(observation.metadata.get("session_id", ""))
                    post = appium_backend.observation_from_session(session_id, tag=f"{route_name}-after")
            elif backend_name == "macos_mirroring":
                post = _observer(config).observe(tag=f"{route_name}-after")
            else:
                post = None
            if post is not None:
                record["post_observation"] = post.to_dict()
        return record
    finally:
        if appium_backend is not None and observation is not None and not use_session:
            try:
                appium_backend.close(observation)
            except Exception:
                pass


def cmd_run_route(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    backend_name = _backend_name(args, config)
    dry_run = not args.execute
    try:
        print_json(
            execute_route_record(
                config,
                route_name=args.route_name,
                backend_name=backend_name,
                dry_run=dry_run,
                observe=args.observe,
                use_session=args.use_session,
                use_manual_rect=args.use_manual_rect,
                allow_uncalibrated=args.allow_uncalibrated,
            )
        )
    except (AutomationAccessError, ScreenCaptureError, AppiumError, RouteError, ValueError) as exc:
        print_json({"ok": False, "error": str(exc)})
        return 2
    return 0


def capture_arms_race_schedule_attempt(
    config: Dict[str, Any],
    args: argparse.Namespace,
    *,
    require_ready: bool,
) -> Dict[str, Any]:
    backend_name = _backend_name(args, config)
    dry_run = not bool(getattr(args, "execute", False))
    readiness = direct_control_status(config, ROOT)
    attempt: Dict[str, Any] = {
        "ok": False,
        "backend": backend_name,
        "dry_run": dry_run,
        "execute": bool(getattr(args, "execute", False)),
        "use_session": bool(getattr(args, "use_session", False)),
        "use_manual_rect": bool(getattr(args, "use_manual_rect", False)),
        "readiness": readiness,
    }
    if require_ready:
        gate = arms_race_schedule_execution_gate(
            readiness,
            backend_name=backend_name,
            execute=bool(getattr(args, "execute", False)),
            use_session=bool(getattr(args, "use_session", False)),
            use_manual_rect=bool(getattr(args, "use_manual_rect", False)),
            allow_uncalibrated=bool(getattr(args, "allow_uncalibrated", False)),
        )
        attempt["gate"] = gate
        if gate["skipped"]:
            attempt["skipped"] = True
            attempt["error"] = gate["reason"]
            return attempt
    try:
        route_result = execute_route_record(
            config,
            route_name="arms_race_schedule",
            backend_name=backend_name,
            dry_run=dry_run,
            observe=bool(getattr(args, "observe", False)),
            use_session=bool(getattr(args, "use_session", False)),
            use_manual_rect=bool(getattr(args, "use_manual_rect", False)),
            allow_uncalibrated=bool(getattr(args, "allow_uncalibrated", False)),
            post_observe=True,
        )
        attempt["ok"] = True
        attempt["route_result"] = route_result
        if "post_observation" in route_result:
            attempt["post_observation"] = route_result["post_observation"]
            screenshot = Path(route_result["post_observation"].get("screenshot_path", ""))
            if screenshot.exists():
                try:
                    attempt["ocr"] = ocr_image(screenshot)
                except Exception as exc:
                    attempt["ocr_error"] = str(exc)
    except (AutomationAccessError, ScreenCaptureError, AppiumError, RouteError, ValueError) as exc:
        attempt["error"] = str(exc)
    return attempt


def cmd_capture_arms_race_schedule(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    attempt = capture_arms_race_schedule_attempt(config, args, require_ready=False)
    memory = update_arms_race_attempt(ROOT, attempt)
    print_json({"attempt": attempt, "memory_current_live_state": memory.get("current_live_state")})
    return 0 if attempt["ok"] else 2


def cmd_control_once(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    attempt = capture_arms_race_schedule_attempt(config, args, require_ready=True)
    memory = update_arms_race_attempt(ROOT, attempt)
    print_json({"attempt": attempt, "memory_current_live_state": memory.get("current_live_state")})
    return 0 if attempt["ok"] or attempt.get("skipped") else 2


def cmd_schedule(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    interval = max(60, int(config["scheduler"]["resource_sweep_minutes"]) * 60)
    print(f"starting scheduler interval={interval}s dry_run={not args.execute}", flush=True)
    while True:
        try:
            run_once(args)
        except KeyboardInterrupt:
            raise
        except Exception as exc:
            print(f"run failed: {exc}", file=sys.stderr, flush=True)
        time.sleep(interval)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Last War iPhone Mirroring automation agent")
    parser.add_argument("--config", help="optional JSON config override")
    sub = parser.add_subparsers(dest="command", required=True)

    observe = sub.add_parser("observe", help="capture the iPhone Mirroring window")
    observe.set_defaults(func=cmd_observe)

    list_skills = sub.add_parser("list-skills", help="list registered skills")
    list_skills.set_defaults(func=cmd_list_skills)

    list_routes_parser = sub.add_parser("list-routes", help="list configured Last War navigation routes")
    list_routes_parser.set_defaults(func=cmd_list_routes)

    route_calibration = sub.add_parser("route-calibration", help="print saved route calibration")
    route_calibration.set_defaults(func=cmd_route_calibration)

    set_route_point_parser = sub.add_parser("set-route-point", help="save normalized coordinates for a route step")
    set_route_point_parser.add_argument("route_name")
    set_route_point_parser.add_argument("step_id")
    set_route_point_parser.add_argument("--x", type=float, required=True)
    set_route_point_parser.add_argument("--y", type=float, required=True)
    set_route_point_parser.add_argument(
        "--calibrated",
        action="store_true",
        default=None,
        help="mark the route calibrated while saving this point",
    )
    set_route_point_parser.set_defaults(func=cmd_set_route_point)

    set_route_point_pixel_parser = sub.add_parser(
        "set-route-point-pixel",
        help="save route step coordinates from screenshot pixel coordinates",
    )
    set_route_point_pixel_parser.add_argument("route_name")
    set_route_point_pixel_parser.add_argument("step_id")
    set_route_point_pixel_parser.add_argument("--screenshot", required=True)
    set_route_point_pixel_parser.add_argument("--x-pixel", type=float, required=True)
    set_route_point_pixel_parser.add_argument("--y-pixel", type=float, required=True)
    set_route_point_pixel_parser.add_argument(
        "--calibrated",
        action="store_true",
        default=None,
        help="mark the route calibrated while saving this point",
    )
    set_route_point_pixel_parser.set_defaults(func=cmd_set_route_point_pixel)

    set_route_point_screen_parser = sub.add_parser(
        "set-route-point-screen",
        help="save route step coordinates from global screen coordinates and saved macOS manual rect",
    )
    set_route_point_screen_parser.add_argument("route_name")
    set_route_point_screen_parser.add_argument("step_id")
    set_route_point_screen_parser.add_argument("--x-screen", type=float, required=True)
    set_route_point_screen_parser.add_argument("--y-screen", type=float, required=True)
    set_route_point_screen_parser.add_argument(
        "--calibrated",
        action="store_true",
        default=None,
        help="mark the route calibrated while saving this point",
    )
    set_route_point_screen_parser.set_defaults(func=cmd_set_route_point_screen)

    set_route_calibrated_parser = sub.add_parser("set-route-calibrated", help="mark a route calibrated or uncalibrated")
    set_route_calibrated_parser.add_argument("route_name")
    set_route_calibrated_parser.add_argument("--no", action="store_true", help="mark uncalibrated")
    set_route_calibrated_parser.set_defaults(func=cmd_set_route_calibrated)

    doctor = sub.add_parser("doctor", help="diagnose local iOS automation prerequisites")
    doctor.set_defaults(func=cmd_doctor)

    direct_status = sub.add_parser("direct-control-status", help="check whether direct iPhone control is ready")
    direct_status.set_defaults(func=cmd_direct_control_status)

    set_macos_rect = sub.add_parser(
        "set-macos-manual-rect",
        help="save iPhone Mirroring content rect for coordinate-only macOS route execution",
    )
    set_macos_rect.add_argument("--x", type=int, required=True)
    set_macos_rect.add_argument("--y", type=int, required=True)
    set_macos_rect.add_argument("--width", type=int, required=True)
    set_macos_rect.add_argument("--height", type=int, required=True)
    set_macos_rect.set_defaults(func=cmd_set_macos_manual_rect)

    set_macos_rect_points = sub.add_parser(
        "set-macos-manual-rect-points",
        help="save iPhone Mirroring content rect from top-left and bottom-right screen points",
    )
    set_macos_rect_points.add_argument("--top-left-x", type=int, required=True)
    set_macos_rect_points.add_argument("--top-left-y", type=int, required=True)
    set_macos_rect_points.add_argument("--bottom-right-x", type=int, required=True)
    set_macos_rect_points.add_argument("--bottom-right-y", type=int, required=True)
    set_macos_rect_points.set_defaults(func=cmd_set_macos_manual_rect_points)

    macos_rect = sub.add_parser("macos-manual-rect", help="print saved iPhone Mirroring manual content rect")
    macos_rect.set_defaults(func=cmd_macos_manual_rect)

    macos_pointer = sub.add_parser("macos-pointer-position", help="print current global macOS pointer coordinates")
    macos_pointer.set_defaults(func=cmd_macos_pointer_position)

    macos_perms = sub.add_parser("macos-permissions", help="check macOS Accessibility and Screen Recording permissions")
    macos_perms.add_argument(
        "--prompt-accessibility",
        action="store_true",
        help="ask macOS to show the Accessibility permission prompt",
    )
    macos_perms.add_argument(
        "--prompt-screen-capture",
        action="store_true",
        help="ask macOS to show the Screen Recording permission prompt",
    )
    macos_perms.set_defaults(func=cmd_macos_permissions)

    ocr_parser = sub.add_parser("ocr-screenshot", help="run local macOS Vision OCR on a screenshot")
    ocr_parser.add_argument("image")
    ocr_parser.set_defaults(func=cmd_ocr_screenshot)

    control_report = sub.add_parser("control-report", help="summarize or ingest an Appium probe report")
    control_report.add_argument("report")
    control_report.add_argument("--ingest", action="store_true", help="write summary into memory/control_state.json")
    control_report.set_defaults(func=cmd_control_report)

    bootstrap_report = sub.add_parser("bootstrap-report", help="summarize or ingest direct-control bootstrap report")
    bootstrap_report.add_argument("report")
    bootstrap_report.add_argument("--ingest", action="store_true", help="write summary into memory/control_state.json")
    bootstrap_report.set_defaults(func=cmd_bootstrap_report)

    run = sub.add_parser("run-once", help="observe, route skills, and optionally execute")
    run.add_argument("--backend", choices=["macos_mirroring", "appium_ios"])
    run.add_argument("--planner", choices=["rules", "vision"], default="rules")
    run.add_argument("--dry-run", dest="dry_run", action="store_true", default=None)
    run.add_argument("--execute", action="store_true", help="actually click allowed low-risk actions")
    run.add_argument("--use-session", action="store_true", help="reuse saved Appium session")
    run.add_argument("--max-actions", type=int)
    run.set_defaults(func=cmd_run_once)

    run_route = sub.add_parser("run-route", help="execute a configured navigation route")
    run_route.add_argument("route_name")
    run_route.add_argument("--backend", choices=["macos_mirroring", "appium_ios"])
    run_route.add_argument("--execute", action="store_true", help="actually execute route taps")
    run_route.add_argument("--observe", action="store_true", help="capture a backend observation during dry-run")
    run_route.add_argument("--use-session", action="store_true", help="reuse saved Appium session")
    run_route.add_argument(
        "--use-manual-rect",
        action="store_true",
        help="for macos_mirroring, skip observation and use set-macos-manual-rect coordinates",
    )
    run_route.add_argument(
        "--allow-uncalibrated",
        action="store_true",
        help="allow executing a route whose calibrated flag is false",
    )
    run_route.set_defaults(func=cmd_run_route)

    capture_arms_race = sub.add_parser(
        "capture-arms-race-schedule",
        help="run the イベント -> 日程 route and record the arms race schedule attempt in memory",
    )
    capture_arms_race.add_argument("--backend", choices=["macos_mirroring", "appium_ios"])
    capture_arms_race.add_argument("--execute", action="store_true", help="actually execute route taps")
    capture_arms_race.add_argument("--observe", action="store_true", help="capture a backend observation during dry-run")
    capture_arms_race.add_argument("--use-session", action="store_true", help="reuse saved Appium session")
    capture_arms_race.add_argument(
        "--use-manual-rect",
        action="store_true",
        help="for macos_mirroring, skip observation and use set-macos-manual-rect coordinates",
    )
    capture_arms_race.add_argument(
        "--allow-uncalibrated",
        action="store_true",
        help="allow executing the route while calibrated flag is false",
    )
    capture_arms_race.set_defaults(func=cmd_capture_arms_race_schedule)

    control_once = sub.add_parser(
        "control-once",
        help="ready-gated one-shot arms race capture; skips safely and records memory when control is not ready",
    )
    control_once.add_argument("--backend", choices=["macos_mirroring", "appium_ios"])
    control_once.add_argument("--execute", action="store_true", help="actually execute route taps when ready")
    control_once.add_argument("--observe", action="store_true", help="capture a backend observation during dry-run")
    control_once.add_argument("--use-session", action="store_true", help="reuse saved Appium session")
    control_once.add_argument(
        "--use-manual-rect",
        action="store_true",
        help="for macos_mirroring, skip observation and use set-macos-manual-rect coordinates",
    )
    control_once.add_argument(
        "--allow-uncalibrated",
        action="store_true",
        help="allow executing the route while calibrated flag is false",
    )
    control_once.set_defaults(func=cmd_control_once)

    schedule = sub.add_parser("schedule", help="run forever on the configured resource interval")
    schedule.add_argument("--backend", choices=["macos_mirroring", "appium_ios"])
    schedule.add_argument("--planner", choices=["rules", "vision"], default="rules")
    schedule.add_argument("--dry-run", dest="dry_run", action="store_true", default=None)
    schedule.add_argument("--execute", action="store_true", help="actually click allowed low-risk actions")
    schedule.add_argument("--use-session", action="store_true", help="reuse saved Appium session")
    schedule.add_argument("--max-actions", type=int)
    schedule.set_defaults(func=cmd_schedule)

    appium_status = sub.add_parser("appium-status", help="check the Appium server status endpoint")
    appium_status.set_defaults(func=cmd_appium_status)

    appium_ensure = sub.add_parser("appium-ensure-server", help="start local Appium server if not already running")
    appium_ensure.set_defaults(func=cmd_appium_ensure_server)

    appium_stop = sub.add_parser("appium-stop-server", help="stop Appium server started by this project")
    appium_stop.set_defaults(func=cmd_appium_stop_server)

    bootstrap_direct = sub.add_parser(
        "bootstrap-direct-control",
        help="install/start Appium, discover Last War, start a session, and save a screenshot report",
    )
    bootstrap_direct.add_argument("--install", action="store_true", help="run local Appium install first")
    bootstrap_direct.set_defaults(func=cmd_bootstrap_direct_control)

    ios_observe = sub.add_parser("ios-observe", help="open an Appium iOS session and save a screenshot")
    ios_observe.add_argument("--use-session", action="store_true", help="reuse saved Appium session")
    ios_observe.set_defaults(func=cmd_ios_observe)

    ios_start_session = sub.add_parser("ios-start-session", help="start and save a persistent Appium iOS session")
    ios_start_session.add_argument(
        "--bootstrap",
        action="store_true",
        help="start the bootstrap app instead of Last War; useful before discovering bundle ids",
    )
    ios_start_session.set_defaults(func=cmd_ios_start_session)

    ios_stop_session = sub.add_parser("ios-stop-session", help="stop the saved persistent Appium iOS session")
    ios_stop_session.set_defaults(func=cmd_ios_stop_session)

    ios_session_screenshot = sub.add_parser(
        "ios-session-screenshot",
        help="save a screenshot from the saved persistent Appium iOS session",
    )
    ios_session_screenshot.add_argument("--tag", default="session")
    ios_session_screenshot.set_defaults(func=cmd_ios_session_screenshot)

    ios_tap = sub.add_parser("ios-tap", help="tap normalized device coordinates through Appium")
    ios_tap.add_argument("--x", type=float, required=True)
    ios_tap.add_argument("--y", type=float, required=True)
    ios_tap.add_argument("--execute", action="store_true", help="actually send the tap")
    ios_tap.add_argument("--use-session", action="store_true", help="reuse saved Appium session")
    ios_tap.set_defaults(func=cmd_ios_tap)

    ios_list_apps = sub.add_parser("ios-list-apps", help="list installed iOS apps through Appium")
    ios_list_apps.set_defaults(func=cmd_ios_list_apps)

    ios_discover = sub.add_parser("ios-discover-lastwar", help="discover and optionally save Last War bundle id")
    ios_discover.add_argument("--save", action="store_true", help="save the best match into .lastwar_agent/device_config.json")
    ios_discover.add_argument(
        "--term",
        action="append",
        help="additional search term; may be repeated. Defaults cover Last War and Japanese title variants.",
    )
    ios_discover.set_defaults(func=cmd_ios_discover_lastwar)

    device_config = sub.add_parser("device-config", help="print saved direct-control device config")
    device_config.set_defaults(func=cmd_device_config)
    return parser


def main(argv: List[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())

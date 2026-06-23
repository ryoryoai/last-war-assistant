from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

from .appium_ios import AppiumError, AppiumIosBackend
from .device_config import configured_lastwar_bundle_id
from .manual_macos import load_manual_content_rect
from .macos import (
    AutomationAccessError,
    ScreenCaptureError,
    capture_rect,
    compile_click_helper,
    get_window_rect,
    macos_permissions,
)
from .route_calibration import load_route_calibration


def macos_mirroring_status(config: Dict[str, Any], cwd: Path) -> Dict[str, Any]:
    blockers: List[str] = []
    checks: Dict[str, Any] = {}
    details: Dict[str, Any] = {}

    app_cfg = config["app"]
    process_names = list(app_cfg.get("process_names", []))
    content_rect = None
    try:
        process, window_rect = get_window_rect(process_names)
        content_rect = window_rect.inset(app_cfg.get("content_insets", {}))
        checks["window"] = True
        details["process_name"] = process
        details["window_rect"] = window_rect.to_dict()
        details["content_rect"] = content_rect.to_dict()
    except AutomationAccessError as exc:
        checks["window"] = False
        blockers.append(f"iPhone Mirroring window not accessible through System Events: {exc}")
    except Exception as exc:
        checks["window"] = False
        blockers.append(f"iPhone Mirroring window probe failed: {exc}")

    if content_rect is not None:
        probe_path = cwd / ".lastwar_agent" / "status" / "macos_mirroring_probe.png"
        try:
            capture_rect(content_rect, probe_path)
            checks["screen_capture"] = True
            details["screenshot_path"] = str(probe_path)
        except ScreenCaptureError as exc:
            checks["screen_capture"] = False
            blockers.append(f"iPhone Mirroring screenshot not available: {exc}")
        except Exception as exc:
            checks["screen_capture"] = False
            blockers.append(f"iPhone Mirroring screenshot probe failed: {exc}")
    else:
        checks["screen_capture"] = False

    try:
        permissions = macos_permissions()
        checks["accessibility_permission"] = bool(permissions.get("accessibility"))
        checks["screen_capture_permission"] = bool(permissions.get("screen_capture"))
        details["permissions"] = permissions
    except Exception as exc:
        checks["accessibility_permission"] = False
        checks["screen_capture_permission"] = False
        blockers.append(f"macOS permission probe failed: {exc}")

    try:
        helper = compile_click_helper()
        checks["click_helper"] = True
        details["click_helper_path"] = str(helper)
    except Exception as exc:
        checks["click_helper"] = False
        blockers.append(f"macOS click helper is not ready: {exc}")

    manual_rect = load_manual_content_rect(cwd)
    checks["manual_content_rect"] = manual_rect is not None
    if manual_rect is not None:
        details["manual_content_rect"] = manual_rect.to_dict()

    ready = bool(
        checks.get("window")
        and checks.get("screen_capture")
        and checks.get("click_helper")
        and checks.get("accessibility_permission")
        and checks.get("screen_capture_permission")
    )
    coordinate_only_ready = bool(
        checks.get("click_helper")
        and checks.get("manual_content_rect")
        and checks.get("accessibility_permission")
    )
    return {
        "status": "ready" if ready else "not_ready",
        "coordinate_only_status": "ready" if coordinate_only_ready else "not_ready",
        "checks": checks,
        "blockers": blockers,
        "details": details,
    }


def appium_ios_status(config: Dict[str, Any], cwd: Path) -> Dict[str, Any]:
    blockers: List[str] = []
    checks: Dict[str, Any] = {}

    try:
        AppiumIosBackend(config, cwd).status()
        checks["appium_server"] = True
    except AppiumError as exc:
        checks["appium_server"] = False
        blockers.append(f"Appium server not reachable: {exc}")

    bundle_id = configured_lastwar_bundle_id(cwd)
    checks["lastwar_bundle_id"] = bool(bundle_id)
    if not bundle_id:
        blockers.append("Last War bundle id is not configured. Run ios-discover-lastwar --save.")

    session_path = cwd / ".lastwar_agent/appium_session.json"
    checks["saved_session"] = session_path.exists()
    if not session_path.exists():
        blockers.append("No saved Appium session. Run ios-start-session.")

    ready = bool(checks.get("appium_server") and checks.get("lastwar_bundle_id") and checks.get("saved_session"))
    return {
        "status": "ready" if ready else "not_ready",
        "checks": checks,
        "blockers": blockers,
    }


def direct_control_status(config: Dict[str, Any], cwd: Path) -> Dict[str, Any]:
    blockers: List[str] = []
    checks: Dict[str, Any] = {}

    macos_status = macos_mirroring_status(config, cwd)
    appium_status = appium_ios_status(config, cwd)

    checks["macos_mirroring"] = macos_status["status"] == "ready"
    checks["macos_mirroring_coordinate_only"] = macos_status["coordinate_only_status"] == "ready"
    checks["appium_ios"] = appium_status["status"] == "ready"
    checks.update(appium_status["checks"])

    calibration = load_route_calibration(cwd)
    route = calibration.get("routes", {}).get("arms_race_schedule", {})
    checks["arms_race_schedule_calibrated"] = bool(route.get("calibrated"))

    if not checks["macos_mirroring"] and not checks["appium_ios"]:
        blockers.append("No verified direct-control backend is ready.")
        blockers.extend(f"macos_mirroring: {item}" for item in macos_status["blockers"])
        blockers.extend(f"appium_ios: {item}" for item in appium_status["blockers"])

    automation_blockers: List[str] = []
    if blockers:
        automation_blockers.extend(blockers)
    if not route.get("calibrated"):
        automation_blockers.append(
            "arms_race_schedule is not calibrated. Run set-route-point-pixel/set-route-calibrated."
        )

    control_ready = bool(checks["macos_mirroring"] or checks["appium_ios"])
    automation_ready = bool(control_ready and route.get("calibrated"))
    return {
        "status": "ready" if control_ready else "not_ready",
        "automation_status": "ready" if automation_ready else "not_ready",
        "checks": checks,
        "blockers": blockers,
        "automation_blockers": automation_blockers,
        "backends": {
            "macos_mirroring": macos_status,
            "appium_ios": appium_status,
        },
    }

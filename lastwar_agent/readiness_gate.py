from __future__ import annotations

from typing import Any, Dict, List


def arms_race_schedule_execution_gate(
    readiness: Dict[str, Any],
    *,
    backend_name: str,
    execute: bool,
    use_session: bool = False,
    use_manual_rect: bool = False,
    allow_uncalibrated: bool = False,
) -> Dict[str, Any]:
    checks = readiness.get("checks", {})
    blockers: List[str] = []
    warnings: List[str] = []

    if not execute:
        return {
            "ready": True,
            "skipped": False,
            "backend": backend_name,
            "execute": False,
            "use_session": use_session,
            "use_manual_rect": use_manual_rect,
            "allow_uncalibrated": allow_uncalibrated,
            "blockers": [],
            "warnings": [],
            "reason": "dry-run preview does not require direct-control readiness",
        }

    if backend_name == "appium_ios":
        if use_session:
            if not checks.get("appium_ios"):
                blockers.append(
                    "appium_ios saved-session backend is not ready. Run appium-ensure-server, "
                    "ios-discover-lastwar --save, and ios-start-session."
                )
        else:
            if not checks.get("appium_server"):
                blockers.append("Appium server is not reachable. Run appium-ensure-server or scripts/appium_start.sh.")
            if not checks.get("lastwar_bundle_id"):
                blockers.append("Last War bundle id is not configured. Run ios-discover-lastwar --save.")
    elif backend_name == "macos_mirroring":
        if use_manual_rect:
            if not checks.get("macos_mirroring_coordinate_only"):
                blockers.append(
                    "macos_mirroring coordinate-only backend is not ready. Configure manual rect and grant Accessibility."
                )
        elif not checks.get("macos_mirroring"):
            blockers.append(
                "macos_mirroring backend is not ready. Grant Accessibility and Screen Recording, then open iPhone Mirroring."
            )
    else:
        blockers.append(f"unsupported backend: {backend_name}")

    if allow_uncalibrated:
        warnings.append("arms_race_schedule calibration is bypassed by --allow-uncalibrated")
    elif not checks.get("arms_race_schedule_calibrated"):
        blockers.append("arms_race_schedule is not calibrated. Run set-route-point-pixel/set-route-calibrated.")

    ready = not blockers
    return {
        "ready": ready,
        "skipped": not ready,
        "backend": backend_name,
        "execute": execute,
        "use_session": use_session,
        "use_manual_rect": use_manual_rect,
        "allow_uncalibrated": allow_uncalibrated,
        "blockers": blockers,
        "warnings": warnings,
        "reason": "ready" if ready else "direct control is not ready: " + " | ".join(blockers),
    }

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from .config import write_json


def load_report(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def summarize_report(report: Dict[str, Any]) -> Dict[str, Any]:
    steps: List[Dict[str, Any]] = report.get("steps", [])
    by_name = {step.get("name"): step for step in steps}
    status = "ready"
    blockers: List[str] = []

    for required in ("doctor", "appium_status", "ios_list_apps"):
        step = by_name.get(required)
        if not step:
            status = "not_ready"
            blockers.append(f"missing step: {required}")
            continue
        if not step.get("ok"):
            status = "not_ready"
            detail = (step.get("stderr") or step.get("stdout") or "").strip()
            blockers.append(f"{required} failed: {detail[:500]}")

    discover_step = by_name.get("ios_discover_lastwar")
    if discover_step and not discover_step.get("ok"):
        detail = (discover_step.get("stderr") or discover_step.get("stdout") or "").strip()
        blockers.append(f"ios_discover_lastwar not verified: {detail[:500]}")
        if status == "ready":
            status = "partially_ready"

    observe_step = by_name.get("ios_observe")
    if observe_step and not observe_step.get("ok"):
        detail = (observe_step.get("stderr") or observe_step.get("stdout") or "").strip()
        blockers.append(f"ios_observe not verified: {detail[:500]}")
        if status == "ready":
            status = "partially_ready"

    return {
        "status": status,
        "created_at": report.get("created_at"),
        "blockers": blockers,
        "step_status": {
            str(step.get("name")): {
                "ok": bool(step.get("ok")),
                "returncode": step.get("returncode"),
            }
            for step in steps
        },
    }


def update_control_memory(report_path: Path, memory_path: Path) -> Dict[str, Any]:
    report = load_report(report_path)
    summary = summarize_report(report)
    existing: Dict[str, Any] = {}
    if memory_path.exists():
        with memory_path.open("r", encoding="utf-8") as f:
            existing = json.load(f)
    existing["updated_at"] = datetime.now().astimezone().isoformat()
    existing["appium_ios"] = {
        "summary": summary,
        "report_path": str(report_path),
    }
    write_json(memory_path, existing)
    return existing


def summarize_bootstrap_report(report: Dict[str, Any]) -> Dict[str, Any]:
    steps: List[Dict[str, Any]] = report.get("steps", [])
    blockers = [
        f"{step.get('name')} failed: {step.get('error', '')[:500]}"
        for step in steps
        if not step.get("ok")
    ]
    return {
        "status": "ready" if report.get("ok") else "not_ready",
        "created_at": report.get("created_at"),
        "blockers": blockers,
        "step_status": {
            str(step.get("name")): {"ok": bool(step.get("ok"))}
            for step in steps
        },
    }


def update_bootstrap_memory(report_path: Path, memory_path: Path) -> Dict[str, Any]:
    report = load_report(report_path)
    summary = summarize_bootstrap_report(report)
    existing: Dict[str, Any] = {}
    if memory_path.exists():
        with memory_path.open("r", encoding="utf-8") as f:
            existing = json.load(f)
    existing["updated_at"] = datetime.now().astimezone().isoformat()
    existing["direct_control_bootstrap"] = {
        "summary": summary,
        "report_path": str(report_path),
    }
    write_json(memory_path, existing)
    return existing

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


DEVICE_CONFIG_PATH = Path(".lastwar_agent/device_config.json")

LAST_WAR_TERMS = [
    "last war",
    "lastwar",
    "survival",
    "ラストウォー",
    "ラスト war",
]

BUNDLE_KEYS = ("bundleId", "bundleID", "bundleIdentifier", "CFBundleIdentifier", "id", "identifier")
NAME_KEYS = ("name", "displayName", "localizedName", "CFBundleDisplayName", "CFBundleName")


def device_config_path(cwd: Path) -> Path:
    return cwd / DEVICE_CONFIG_PATH


def load_device_config(cwd: Path) -> Dict[str, Any]:
    path = device_config_path(cwd)
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_device_config(cwd: Path, data: Dict[str, Any]) -> None:
    path = device_config_path(cwd)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")


def configured_lastwar_bundle_id(cwd: Path) -> Optional[str]:
    value = load_device_config(cwd).get("lastwar_bundle_id")
    return str(value) if value else None


def save_lastwar_bundle_id(cwd: Path, bundle_id: str, source: str, app: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    data = load_device_config(cwd)
    data["lastwar_bundle_id"] = bundle_id
    data["lastwar_bundle_id_source"] = source
    data["updated_at"] = datetime.now().astimezone().isoformat()
    if app is not None:
        data["lastwar_app"] = app
    save_device_config(cwd, data)
    return data


def _walk_apps(value: Any) -> Iterable[Dict[str, Any]]:
    if isinstance(value, dict):
        if any(key in value for key in BUNDLE_KEYS) or any(key in value for key in NAME_KEYS):
            yield value
        for child in value.values():
            yield from _walk_apps(child)
    elif isinstance(value, list):
        for child in value:
            yield from _walk_apps(child)


def _field(app: Dict[str, Any], keys: Iterable[str]) -> str:
    for key in keys:
        value = app.get(key)
        if value:
            return str(value)
    return ""


def normalize_app(app: Dict[str, Any]) -> Dict[str, Any]:
    bundle_id = _field(app, BUNDLE_KEYS)
    name = _field(app, NAME_KEYS)
    return {
        "bundle_id": bundle_id,
        "name": name,
        "raw": app,
    }


def find_lastwar_apps(apps_payload: Any, terms: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    terms = [term.lower() for term in (terms or LAST_WAR_TERMS)]
    matches: List[Dict[str, Any]] = []
    for raw_app in _walk_apps(apps_payload):
        app = normalize_app(raw_app)
        haystack = f"{app['name']} {app['bundle_id']}".lower()
        score = sum(1 for term in terms if term in haystack)
        if score > 0 and app["bundle_id"]:
            app["score"] = score
            matches.append(app)
    matches.sort(key=lambda app: (-int(app["score"]), app["name"], app["bundle_id"]))
    return matches


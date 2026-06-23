from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional


class StateStore:
    def __init__(self, path: Path):
        self.path = path
        self.data: Dict[str, Any] = {}
        self.load()

    def load(self) -> None:
        if not self.path.exists():
            self.data = {"skills": {}, "runs": []}
            return
        with self.path.open("r", encoding="utf-8") as f:
            self.data = json.load(f)

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2, sort_keys=True)
            f.write("\n")

    def last_skill_run(self, skill_name: str) -> Optional[datetime]:
        value = self.data.get("skills", {}).get(skill_name, {}).get("last_run")
        if not value:
            return None
        return datetime.fromisoformat(value)

    def mark_skill_run(self, skill_name: str, now: datetime) -> None:
        self.data.setdefault("skills", {}).setdefault(skill_name, {})["last_run"] = now.isoformat()

    def append_run(self, run: Dict[str, Any]) -> None:
        self.data.setdefault("runs", []).append(run)
        self.data["runs"] = self.data["runs"][-200:]


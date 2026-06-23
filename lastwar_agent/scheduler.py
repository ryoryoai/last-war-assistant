from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, Optional


def current_arms_race_window(now: datetime, config: Dict[str, Any]) -> Dict[str, Any]:
    scheduler = config["scheduler"]
    hours = sorted(int(h) for h in scheduler["arms_race_hours"])
    start = now.replace(minute=0, second=0, microsecond=0)
    candidates = []
    for day_offset in (-1, 0, 1):
        base = (now + timedelta(days=day_offset)).replace(hour=0, minute=0, second=0, microsecond=0)
        for hour in hours:
            candidates.append(base.replace(hour=hour))
    candidates = sorted(candidates)
    active_start = max(candidate for candidate in candidates if candidate <= now)
    active_end = min(candidate for candidate in candidates if candidate > now)
    elapsed = now - active_start
    remaining = active_end - now
    offset = timedelta(minutes=int(scheduler.get("arms_race_start_offset_minutes", 2)))
    precheck = timedelta(minutes=int(scheduler.get("arms_race_precheck_minutes_before_end", 10)))
    return {
        "active_start": active_start.isoformat(),
        "active_end": active_end.isoformat(),
        "elapsed_seconds": int(elapsed.total_seconds()),
        "remaining_seconds": int(remaining.total_seconds()),
        "is_start_window": elapsed >= offset and elapsed <= offset + timedelta(minutes=10),
        "is_precheck_window": remaining <= precheck,
    }


#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== direct-control-status =="
python3 -m lastwar_agent.cli direct-control-status || true

echo
echo "== capture-arms-race-schedule =="
python3 -m lastwar_agent.cli capture-arms-race-schedule "$@"

echo
echo "== memory/arms_race.json current_live_state =="
python3 - <<'PY'
import json
from pathlib import Path

data = json.loads(Path("memory/arms_race.json").read_text(encoding="utf-8"))
print(json.dumps(data.get("current_live_state", {}), ensure_ascii=False, indent=2, sort_keys=True))
PY

#!/usr/bin/env bash
set -u

cd "$(dirname "$0")/.."

REPORT_DIR="runs"
mkdir -p "$REPORT_DIR"
REPORT="$REPORT_DIR/appium_probe_latest.json"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/lastwar-appium-probe.XXXXXX")"

run_step() {
  local name="$1"
  shift
  local out="$TMP_DIR/${name}.out"
  local err="$TMP_DIR/${name}.err"
  local code=0
  "$@" >"$out" 2>"$err" || code=$?
  python3 - "$name" "$code" "$out" "$err" <<'PY'
import json
import sys
name, code, out, err = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
print(json.dumps({
    "name": name,
    "returncode": code,
    "ok": code == 0,
    "stdout": open(out, encoding="utf-8", errors="replace").read(),
    "stderr": open(err, encoding="utf-8", errors="replace").read(),
}, ensure_ascii=False))
PY
}

STEPS="$TMP_DIR/steps.jsonl"
: > "$STEPS"

run_step doctor python3 -m lastwar_agent.cli doctor >> "$STEPS"

if [ "${1:-}" = "--install" ]; then
  run_step install_appium bash scripts/appium_install_local.sh >> "$STEPS"
fi

run_step appium_status python3 -m lastwar_agent.cli appium-status >> "$STEPS"
run_step ios_list_apps python3 -m lastwar_agent.cli ios-list-apps >> "$STEPS"
run_step ios_discover_lastwar python3 -m lastwar_agent.cli ios-discover-lastwar --save >> "$STEPS"

if [ -n "${LASTWAR_IOS_BUNDLE_ID:-}" ]; then
  run_step ios_observe python3 -m lastwar_agent.cli ios-observe >> "$STEPS"
elif [ -f .lastwar_agent/device_config.json ] && python3 - <<'PY'
import json
try:
    data = json.load(open(".lastwar_agent/device_config.json", encoding="utf-8"))
except FileNotFoundError:
    raise SystemExit(1)
raise SystemExit(0 if data.get("lastwar_bundle_id") else 1)
PY
then
  run_step ios_observe python3 -m lastwar_agent.cli ios-observe >> "$STEPS"
else
  python3 - <<'PY' >> "$STEPS"
import json
print(json.dumps({
    "name": "ios_observe",
    "returncode": 2,
    "ok": False,
    "stdout": "",
    "stderr": "Skipped because LASTWAR_IOS_BUNDLE_ID is not set."
}, ensure_ascii=False))
PY
fi

python3 - "$STEPS" "$REPORT" <<'PY'
import json
import sys
from datetime import datetime, timezone

steps = []
for line in open(sys.argv[1], encoding="utf-8"):
    if line.strip():
        steps.append(json.loads(line))

report = {
    "created_at": datetime.now(timezone.utc).isoformat(),
    "ok": all(step["ok"] for step in steps if step["name"] not in {"ios_observe"}),
    "steps": steps,
}

with open(sys.argv[2], "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(sys.argv[2])
PY

rm -rf "$TMP_DIR"

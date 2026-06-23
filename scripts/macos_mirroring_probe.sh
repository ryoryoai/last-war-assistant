#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== direct-control-status =="
python3 -m lastwar_agent.cli direct-control-status || true

echo
echo "== manual rect =="
python3 -m lastwar_agent.cli macos-manual-rect || true

echo
echo "== observe =="
python3 -m lastwar_agent.cli observe || true

echo
echo "== dry-run route preview =="
python3 -m lastwar_agent.cli run-route arms_race_schedule --backend macos_mirroring || true

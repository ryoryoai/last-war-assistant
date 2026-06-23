#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

interval="${LASTWAR_READY_POLL_SECONDS:-10}"

echo "Waiting for direct-control readiness. Poll interval: ${interval}s"
echo "Press Ctrl-C to stop."

until python3 -m lastwar_agent.cli direct-control-status; do
  echo
  echo "Not ready yet. Grant permissions or finish backend setup, then leave this running."
  sleep "${interval}"
done

echo
echo "Direct control is ready. Running ready-gated control-once."
python3 -m lastwar_agent.cli control-once "$@"

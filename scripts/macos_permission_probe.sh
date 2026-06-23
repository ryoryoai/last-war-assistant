#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

args=()
if [[ "${1:-}" == "--prompt" ]]; then
  args+=(--prompt-accessibility --prompt-screen-capture)
fi

if [[ ${#args[@]} -gt 0 ]]; then
  python3 -m lastwar_agent.cli macos-permissions "${args[@]}"
else
  python3 -m lastwar_agent.cli macos-permissions
fi
python3 -m lastwar_agent.cli direct-control-status || true

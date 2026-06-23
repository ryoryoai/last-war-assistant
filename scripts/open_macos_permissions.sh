#!/usr/bin/env bash
set -euo pipefail

opened=false

if open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility" >/dev/null 2>&1; then
  opened=true
fi

if open "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture" >/dev/null 2>&1; then
  opened=true
fi

if [[ "$opened" == false ]]; then
  open "/System/Applications/System Settings.app" >/dev/null 2>&1 || true
fi

cat <<'EOF'
Grant permissions to the app that runs the agent:

- If using Codex: Codex, and any shell helper it launches if shown
- If using Terminal: Terminal
- If using Warp: Warp

Then restart that app and run:

python3 -m lastwar_agent.cli macos-permissions
python3 -m lastwar_agent.cli direct-control-status
python3 -m lastwar_agent.cli observe

To ask macOS to show permission prompts from the current runner:

bash scripts/macos_permission_probe.sh --prompt
EOF

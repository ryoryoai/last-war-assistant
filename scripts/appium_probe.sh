#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

python3 -m lastwar_agent.cli appium-status

if [ -z "${LASTWAR_IOS_BUNDLE_ID:-}" ]; then
  echo "Set LASTWAR_IOS_BUNDLE_ID before ios-observe. Example:" >&2
  echo "export LASTWAR_IOS_BUNDLE_ID='com.example.lastwar'" >&2
  exit 2
fi

python3 -m lastwar_agent.cli ios-observe


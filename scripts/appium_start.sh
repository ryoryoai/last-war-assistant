#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export APPIUM_HOME="$PWD/.lastwar_agent/appium-home"

exec npx --prefix .lastwar_agent/appium appium \
  --address 127.0.0.1 \
  --port 4723 \
  --base-path /

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p .lastwar_agent/appium

if [ ! -f .lastwar_agent/appium/package.json ]; then
  cat > .lastwar_agent/appium/package.json <<'JSON'
{
  "private": true,
  "type": "module",
  "dependencies": {
    "appium": "latest"
  }
}
JSON
fi

npm install --prefix .lastwar_agent/appium
export APPIUM_HOME="$PWD/.lastwar_agent/appium-home"
mkdir -p "$APPIUM_HOME"

if ! npx --prefix .lastwar_agent/appium appium driver list --installed | grep -q 'xcuitest'; then
  npx --prefix .lastwar_agent/appium appium driver install xcuitest
fi

npx --prefix .lastwar_agent/appium appium driver list --installed

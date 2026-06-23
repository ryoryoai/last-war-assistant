#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

exec python3 -m lastwar_agent.cli bootstrap-direct-control "$@"


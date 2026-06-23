#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ $# -lt 2 ]]; then
  echo "usage: scripts/sample_route_point.sh <route_name> <step_id> [--calibrated]" >&2
  exit 2
fi

route_name="$1"
step_id="$2"
shift 2

read_position() {
  python3 -m lastwar_agent.cli macos-pointer-position \
    | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data["x"], data["y"])'
}

echo "Move the pointer to route point '${route_name}/${step_id}', then press Enter."
read -r _
point="$(read_position)"
echo "point: ${point}"
read -r x_screen y_screen <<<"${point}"

python3 -m lastwar_agent.cli set-route-point-screen "${route_name}" "${step_id}" \
  --x-screen "${x_screen}" \
  --y-screen "${y_screen}" \
  "$@"

python3 -m lastwar_agent.cli route-calibration

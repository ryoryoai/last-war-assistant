#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

read_position() {
  python3 -m lastwar_agent.cli macos-pointer-position \
    | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data["x"], data["y"])'
}

echo "Move the pointer to the top-left corner of the iPhone Mirroring content area, then press Enter."
read -r _
top_left="$(read_position)"
echo "top-left: ${top_left}"

echo "Move the pointer to the bottom-right corner of the iPhone Mirroring content area, then press Enter."
read -r _
bottom_right="$(read_position)"
echo "bottom-right: ${bottom_right}"

read -r top_left_x top_left_y <<<"${top_left}"
read -r bottom_right_x bottom_right_y <<<"${bottom_right}"

python3 -m lastwar_agent.cli set-macos-manual-rect-points \
  --top-left-x "${top_left_x}" \
  --top-left-y "${top_left_y}" \
  --bottom-right-x "${bottom_right_x}" \
  --bottom-right-y "${bottom_right_y}"

python3 -m lastwar_agent.cli macos-manual-rect

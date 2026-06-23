#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

run_step() {
  echo
  echo "== $1 =="
  shift
  "$@"
}

while true; do
  cat <<'MENU'

Last War control wizard
1) Check macOS permissions
2) Prompt for macOS permissions
3) Sample iPhone Mirroring rectangle with mouse
4) Sample arms_race_schedule/open_event with mouse
5) Sample arms_race_schedule/open_schedule and mark calibrated
6) Preview arms race capture
7) Execute arms race capture through macOS manual rect
8) Ready-gated execute through macOS manual rect
9) Wait for direct control, then ready-gated execute
10) Show current arms race memory
11) Exit
MENU
  printf "Select: "
  read -r choice

  case "${choice}" in
    1)
      run_step "macOS permissions" python3 -m lastwar_agent.cli macos-permissions
      run_step "direct control status" python3 -m lastwar_agent.cli direct-control-status || true
      ;;
    2)
      run_step "permission prompt" bash scripts/macos_permission_probe.sh --prompt
      ;;
    3)
      run_step "sample manual rect" bash scripts/sample_macos_manual_rect.sh
      ;;
    4)
      run_step "sample open_event" bash scripts/sample_route_point.sh arms_race_schedule open_event
      ;;
    5)
      run_step "sample open_schedule" bash scripts/sample_route_point.sh arms_race_schedule open_schedule --calibrated
      ;;
    6)
      run_step "preview capture" bash scripts/capture_arms_race_schedule.sh --backend macos_mirroring --use-manual-rect
      ;;
    7)
      run_step "execute capture" bash scripts/capture_arms_race_schedule.sh --backend macos_mirroring --use-manual-rect --execute
      ;;
    8)
      run_step "ready-gated execute" bash scripts/control_once.sh --backend macos_mirroring --use-manual-rect --execute
      ;;
    9)
      run_step "wait and execute" bash scripts/wait_for_direct_control.sh --backend macos_mirroring --use-manual-rect --execute
      ;;
    10)
      run_step "arms race memory" python3 -m json.tool memory/arms_race.json
      ;;
    11)
      exit 0
      ;;
    *)
      echo "Unknown selection: ${choice}" >&2
      ;;
  esac
done

# Architecture

## Overview

```text
Observer
  -> VisionPlanner(optional)
  -> SkillRouter
  -> Executor
  -> StateStore / logs
```

## Observer

`Observer` finds the iPhone Mirroring window through macOS Accessibility, captures the window, and writes a screenshot under `runs/YYYYMMDD/`.

It needs macOS permissions:

- Accessibility for `System Events` and `.lastwar_agent/bin/macos_click`
- Screen Recording for `screencapture`

Codex `computer-use` can inspect the window directly when the app is approved, but the always-on local scheduler cannot call Codex's MCP tools. The local runtime therefore uses macOS APIs.

## Skill Router

The router evaluates enabled skills in priority order. Safety skills run first and can abort the whole run.

Current skills:

- `detect_dangerous_dialog`
- `return_to_home`
- `collect_base_resources`
- `open_arms_race`
- `read_arms_race_phase`

## Skill Contract

Every skill should follow this contract:

```text
input: Observation
output: SkillOutcome
side effects: none
```

Allowed output:

- `status=skipped`: no action
- `status=info`: informational result
- `status=candidate`: safe candidate actions
- `status=abort`: stop the run

Skills must not click, sleep, mutate UI, or call platform automation directly.

## Executor

Only `Executor` can mutate the UI. It rejects:

- unsupported action kinds
- coordinates outside `0..1`
- risks not listed in `config/default.json`

Default config only allows:

- `click_norm`
- `wait`
- `hotkey`
- `risk=low`

## Arms Race

The scheduler treats the configured hours as 4-hour windows:

```json
[0, 4, 8, 12, 16, 20]
```

`open_arms_race` only proposes actions during:

- start window: offset + 10 minutes
- precheck window: last 10 minutes before the next window

The actual phase names should later be read from the event screen by Vision/OCR and mapped to dedicated phase skills.

For unattended runs, use the ready-gated one-shot command instead of an infinite loop:

```bash
python3 -m lastwar_agent.cli control-once --backend macos_mirroring --use-manual-rect --execute
```

It skips without clicking when direct control or route calibration is not ready, and records the blocker in `memory/arms_race.json`.

## Adding Skills

Add a class under `lastwar_agent/skills/`, then register it in `lastwar_agent/router.py`.

Good examples:

- `claim_free_daily_reward`
- `collect_training_complete`
- `read_arms_race_phase_from_vision`
- `arms_race_training_candidate`
- `arms_race_research_candidate`

Avoid broad skills such as `play_game` or `do_best_action`.

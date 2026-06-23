# Appium iOS setup

This path controls the physical iPhone directly through Appium's XCUITest driver and WebDriverAgent.

Run these commands from a normal macOS Terminal, not from the Codex sandbox, because this Codex session currently cannot reach local network sockets or CoreDevice services.

For the combined readiness view:

```bash
python3 -m lastwar_agent.cli macos-permissions
python3 -m lastwar_agent.cli direct-control-status
```

The command reports both backends:

- `macos_mirroring`: iPhone Mirroring window, screenshot permission, and click helper readiness.
- `appium_ios`: Appium server, Last War bundle id, and saved WDA/Appium session readiness.

## 1. Prepare the iPhone

On the iPhone:

```text
Settings -> Privacy & Security -> Developer Mode -> On
Settings -> Developer -> Enable UI Automation -> On
Trust this Mac when prompted over USB
```

Keep the iPhone unlocked for the first WebDriverAgent launch.

## 2. Install Appium locally

```bash
cd /path/to/lastwar
bash scripts/appium_install_local.sh
```

## 3. Start Appium

In one Terminal window:

```bash
cd /path/to/lastwar
bash scripts/appium_start.sh
```

Expected server:

```text
http://127.0.0.1:4723
```

## 4. Set the app bundle id

The agent needs the iOS bundle id for Last War. Once Appium works, try automatic discovery first:

```bash
python3 -m lastwar_agent.cli ios-discover-lastwar --save
python3 -m lastwar_agent.cli device-config
```

If that does not find it, list apps manually:

```bash
python3 -m lastwar_agent.cli ios-list-apps
```

Search the output for Last War, then either save it through env:

```bash
export LASTWAR_IOS_BUNDLE_ID="PUT_LAST_WAR_BUNDLE_ID_HERE"
```

or write `.lastwar_agent/device_config.json`:

```json
{
  "lastwar_bundle_id": "PUT_LAST_WAR_BUNDLE_ID_HERE"
}
```

If multiple iPhones are connected, also set:

```bash
export LASTWAR_IOS_UDID="YOUR_DEVICE_UDID"
```

## 5. Probe

In another Terminal window:

```bash
cd /path/to/lastwar
bash scripts/bootstrap_direct_control.sh --install
python3 -m lastwar_agent.cli bootstrap-report runs/direct_control_bootstrap_latest.json --ingest
```

This writes:

```text
runs/direct_control_bootstrap_latest.json
```

Manual probe commands:

```bash
cd /path/to/lastwar
python3 -m lastwar_agent.cli appium-status
python3 -m lastwar_agent.cli ios-discover-lastwar --save
python3 -m lastwar_agent.cli ios-list-apps
python3 -m lastwar_agent.cli ios-observe
```

If `ios-observe` succeeds, the agent saved a screenshot under `runs/YYYYMMDD/`.

For a single command that writes a report:

```bash
cd /path/to/lastwar
bash scripts/appium_full_probe.sh
python3 -m lastwar_agent.cli control-report runs/appium_probe_latest.json --ingest
```

Use `--install` on the first run if Appium has not been installed:

```bash
bash scripts/appium_full_probe.sh --install
```

## 6. Test a safe dry-run tap

```bash
python3 -m lastwar_agent.cli ios-tap --x 0.5 --y 0.5
```

This does not tap unless `--execute` is present.

## Persistent sessions

For repeated game actions, keep one Appium/WDA session alive:

```bash
python3 -m lastwar_agent.cli ios-start-session
python3 -m lastwar_agent.cli ios-session-screenshot
python3 -m lastwar_agent.cli ios-tap --use-session --x 0.5 --y 0.5
```

Stop it when done:

```bash
python3 -m lastwar_agent.cli ios-stop-session
```

Before discovering the Last War bundle id, you can start a bootstrap session against Settings:

```bash
python3 -m lastwar_agent.cli ios-start-session --bootstrap
python3 -m lastwar_agent.cli ios-list-apps
python3 -m lastwar_agent.cli ios-stop-session
```

## 7. Run the skill router through Appium

```bash
python3 -m lastwar_agent.cli run-once --backend appium_ios --dry-run
```

With a persistent session:

```bash
python3 -m lastwar_agent.cli ios-start-session
python3 -m lastwar_agent.cli run-once --backend appium_ios --use-session --dry-run
```

Actual execution:

```bash
python3 -m lastwar_agent.cli run-once --backend appium_ios --use-session --execute --max-actions 3
```

Scheduled loop through the same session:

```bash
python3 -m lastwar_agent.cli schedule --backend appium_ios --use-session --dry-run
```

## 8. Navigate to arms race schedule

The known route is:

```text
イベント -> 日程
```

The route exists as `arms_race_schedule`, but it is marked uncalibrated until its coordinates are verified on the real device.

Preview without connecting to the device:

```bash
python3 -m lastwar_agent.cli run-route arms_race_schedule --backend appium_ios
```

Calibrate route coordinates:

```bash
python3 -m lastwar_agent.cli ios-start-session
python3 -m lastwar_agent.cli ios-session-screenshot --tag calibrate
```

Open the saved screenshot under `runs/YYYYMMDD/` and calculate normalized coordinates:

```text
x_norm = x_pixel / screenshot_width
y_norm = y_pixel / screenshot_height
```

You can either save normalized coordinates directly:

```bash
python3 -m lastwar_agent.cli set-route-point arms_race_schedule open_event --x 0.92 --y 0.36
python3 -m lastwar_agent.cli set-route-point arms_race_schedule open_schedule --x 0.50 --y 0.18
```

or give the screenshot and raw pixel coordinates:

```bash
python3 -m lastwar_agent.cli set-route-point-pixel arms_race_schedule open_event --screenshot runs/YYYYMMDD/lastwar-appium-calibrate-*.png --x-pixel 350 --y-pixel 300
python3 -m lastwar_agent.cli set-route-point-pixel arms_race_schedule open_schedule --screenshot runs/YYYYMMDD/lastwar-appium-calibrate-*.png --x-pixel 190 --y-pixel 150
```

Then mark the route calibrated:

```bash
python3 -m lastwar_agent.cli set-route-calibrated arms_race_schedule
python3 -m lastwar_agent.cli route-calibration
python3 -m lastwar_agent.cli direct-control-status
```

Execute only after calibration:

```bash
python3 -m lastwar_agent.cli ios-start-session
python3 -m lastwar_agent.cli run-route arms_race_schedule --backend appium_ios --use-session --execute
python3 -m lastwar_agent.cli capture-arms-race-schedule --backend appium_ios --use-session --execute
python3 -m lastwar_agent.cli control-once --backend appium_ios --use-session --execute
```

`capture-arms-race-schedule` runs the same `イベント -> 日程` route, saves a post-route screenshot when the backend supports it, and updates `memory/arms_race.json`.
`control-once` adds the production guard: if direct control or route calibration is not ready, it skips execution and stores the blocker in `memory/arms_race.json`.
It also runs local macOS Vision OCR on the post-route screenshot and stores extracted text in `memory/arms_race.json`.

For deliberate coordinate testing before calibration:

```bash
python3 -m lastwar_agent.cli run-route arms_race_schedule --backend appium_ios --execute --allow-uncalibrated
```

Use the last form only when watching the phone. It sends real taps.

## Current Codex-session blocker

From the current Codex tool sandbox:

```text
GET http://127.0.0.1:4723/status -> Operation not permitted
xcrun devicectl / xcdevice -> CoreDevice/CoreSimulator service errors
computer-use -> iPhone Mirroring approval denied
macos_mirroring -> click helper ready, window/screenshot access not ready
```

The project now has the backend code, but the first live Appium session must be launched from a normal Terminal or from a Codex session with local network/CoreDevice access.

## Attended fallback without Appium

If Appium is blocked but iPhone Mirroring is visible, the agent can execute a known route from a manually saved content rectangle:

```bash
bash scripts/lastwar_terminal_wizard.sh
python3 -m lastwar_agent.cli set-macos-manual-rect --x <left> --y <top> --width <w> --height <h>
python3 -m lastwar_agent.cli macos-manual-rect
python3 -m lastwar_agent.cli run-route arms_race_schedule --backend macos_mirroring --use-manual-rect --execute
```

To sample the rectangle and route points with the mouse from a normal Terminal:

```bash
bash scripts/sample_macos_manual_rect.sh
bash scripts/sample_route_point.sh arms_race_schedule open_event
bash scripts/sample_route_point.sh arms_race_schedule open_schedule --calibrated
```

This does not observe the screen. It still requires Accessibility permission for CGEvent clicks. Use it only while watching the phone, and only after the `arms_race_schedule` tap coordinates are calibrated.

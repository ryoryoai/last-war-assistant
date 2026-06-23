# iPhone control options

## Recommendation

For this project, prefer this order:

1. Appium + XCUITest/WebDriverAgent on the real iPhone
2. Local macOS agent against iPhone Mirroring
3. Android device/emulator automation, if account migration is acceptable

iPhone Mirroring is convenient for manual observation, but it is a weak base for unattended automation because every action depends on macOS window focus, Screen Recording, Accessibility, and app-level Computer Use approvals.

## Option 1: Appium + WebDriverAgent

This is the best iPhone-native route.

Architecture:

```text
Python skill agent
  -> Appium HTTP/WebDriver client
  -> XCUITest driver
  -> WebDriverAgent on iPhone
  -> screenshot / tap / swipe
```

Why it is better:

- No dependency on the iPhone Mirroring window position.
- Can take screenshots from the device session.
- Can tap by device coordinates.
- Can run while the phone is connected over USB.
- The automation boundary is explicit and scriptable.

Tradeoffs:

- Requires Xcode.
- Requires a trusted physical iPhone.
- Requires Developer Mode and UI Automation on the iPhone.
- Requires WebDriverAgent signing/provisioning.
- Game UIs rendered by Unity/Cocos usually still need image recognition because useful accessibility elements may not exist.

Useful official references:

- Appium XCUITest driver: https://appium.github.io/appium-xcuitest-driver/latest/
- Device setup: https://appium.github.io/appium-xcuitest-driver/latest/getting-started/device-setup/
- Capabilities: https://appium.github.io/appium-xcuitest-driver/latest/reference/capabilities/

Minimum setup checklist:

```text
Mac:
- Xcode installed
- Node/npm installed
- Appium installed
- appium-xcuitest-driver installed

iPhone:
- Connected by USB
- Trusted by the Mac
- Developer Mode enabled
- Settings -> Developer -> Enable UI Automation enabled
- WebDriverAgent trusted/signed
```

The project should add an `IosDeviceExecutor` that implements the same action contract as the current macOS executor:

```text
click_norm
swipe_norm
wait
screenshot
```

The skill layer should not care whether actions are executed through iPhone Mirroring or Appium.

## Option 2: iPhone Mirroring + local macOS APIs

This is the current implementation direction.

Architecture:

```text
Python skill agent
  -> osascript/System Events for window bounds
  -> screencapture for screenshot
  -> CGEvent for mouse clicks
  -> iPhone Mirroring window
```

Why it is useful:

- Fastest to bootstrap.
- No iPhone Developer Mode needed.
- Works with the exact screen the user sees.

Weak points:

- Requires macOS Accessibility and Screen Recording permissions.
- Breaks if the iPhone Mirroring window moves, is hidden, or loses focus.
- Harder to run unattended.
- Computer Use approval can block live operation.

Readiness check:

```bash
python3 -m lastwar_agent.cli macos-permissions
python3 -m lastwar_agent.cli direct-control-status
```

For `macos_mirroring`, `window`, `screen_capture`, and `click_helper` must all be true before live route execution is possible.

Helper scripts:

```bash
bash scripts/lastwar_terminal_wizard.sh
bash scripts/open_macos_permissions.sh
bash scripts/macos_permission_probe.sh
bash scripts/macos_mirroring_probe.sh
```

`LastWarControl.command` runs the same wizard from Finder/Terminal and is the preferred path when the Codex app itself does not have macOS TCC permissions.

Coordinate-only fallback:

```bash
python3 -m lastwar_agent.cli set-macos-manual-rect --x <left> --y <top> --width <w> --height <h>
python3 -m lastwar_agent.cli run-route arms_race_schedule --backend macos_mirroring --use-manual-rect --execute
```

This bypasses window discovery and screenshot capture, but it assumes the iPhone Mirroring window stays fixed. Treat it as an attended fallback, not the normal unattended backend.
It still requires Accessibility permission because the click backend posts CGEvents.

Mouse-sampled calibration from a normal Terminal:

```bash
bash scripts/sample_macos_manual_rect.sh
bash scripts/sample_route_point.sh arms_race_schedule open_event
bash scripts/sample_route_point.sh arms_race_schedule open_schedule --calibrated
```

## Option 3: Android/emulator route

If the game account can be used on Android, this is usually the most automatable route.

Why it is attractive:

- ADB gives direct screenshot/tap/swipe primitives.
- Emulators can run headlessly or in fixed resolution.
- Coordinate/image automation is simpler and repeatable.

Tradeoff:

- Requires account linking/migration and may have its own anti-automation risks.

## Project Direction

Keep the existing skill router and memory format. Add executor backends:

```text
Executor
  macos_mirroring
  appium_ios
  adb_android
```

The skills should return normalized actions only. Backends translate normalized actions into concrete platform operations.

For the current arms race schedule route, the common command is:

```bash
python3 -m lastwar_agent.cli capture-arms-race-schedule --backend appium_ios --use-session --execute
```

For unattended recurring runs, prefer the ready-gated entrypoint. It records the reason in `memory/arms_race.json` and does not tap when permissions, backend readiness, or route calibration are missing:

```bash
python3 -m lastwar_agent.cli control-once --backend appium_ios --use-session --execute
python3 -m lastwar_agent.cli control-once --backend macos_mirroring --use-manual-rect --execute
```

It records the attempt and any post-route screenshot path in `memory/arms_race.json`.
When a post-route screenshot is available, local macOS Vision OCR is run and extracted text is stored in `current_live_state.detected_text`.

OCR can also be run directly:

```bash
python3 -m lastwar_agent.cli ocr-screenshot runs/YYYYMMDD/lastwar-*.png
```

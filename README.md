# Last War Assistant

MacのiPhoneミラーリング上で動くLast War: Survival向けの、スキル型自動化MVPです。

このリポジトリは最初から完全自動でゲームを進めるためのものではありません。まずは画面を観測し、低リスクな候補アクションだけをスキルとして提案し、明示的に `--execute` を付けた場合だけクリックします。

## できること

- 星任務の今日の A / B / C と対象サーバー一覧を提供
- iPhoneミラーリングのウィンドウ位置を取得
- スクリーンショットを保存
- スキルルーターで実行候補を選択
- 4時間ごとの軍拡サイクルを認識
- 低リスク候補だけをdry-runまたは実クリック
- 実行ログとスクショを `runs/` に保存
- 任意でVisionモデルに画面判断を任せる

## Webページ

ローカルで使う補助ページは `web/` に置いています。

- 親ページ: `web/index.html`
- 今日の星任務サーバー: `web/secret-mission/index.html`

Cloudflare Pagesで公開する場合は、GitHub連携でこのリポジトリを選び、次の設定にします。

- Build command: 空欄
- Build output directory: `web`

Wranglerで直接デプロイする場合:

```bash
wrangler login
wrangler pages deploy web --project-name last-war-assistant
```

## 最初の確認

```bash
python3 -m lastwar_agent.cli direct-control-status
python3 -m lastwar_agent.cli observe
python3 -m lastwar_agent.cli list-skills
python3 -m lastwar_agent.cli run-once --dry-run
```

`direct-control-status` は `macos_mirroring` と `appium_ios` の両方を診断します。現状のCodexサンドボックスでは、クリック補助バイナリはビルド済みですが、iPhoneミラーリングの窓読み取りはComputer Use承認またはmacOS Accessibility/Screen Recording権限が必要です。

Codexに権限が付かない場合は、Terminal主体で動かすウィザードを使います。

```bash
bash scripts/lastwar_terminal_wizard.sh
```

Finderから開く場合は `LastWarControl.command` を使います。

`observe` や `run-once` が `osascript/System Events access failed` または `screencapture failed` を返す場合は、スクリプトを実行しているアプリにmacOSの権限がありません。

必要な権限:

- システム設定 > プライバシーとセキュリティ > アクセシビリティ
- システム設定 > プライバシーとセキュリティ > 画面収録

許可対象は実行方法によって変わります。ターミナルから動かすならターミナル、Codex内のシェルから動かすならCodexまたはそのシェル実行元に許可が必要です。

権限ペインを開く補助:

```bash
bash scripts/open_macos_permissions.sh
python3 -m lastwar_agent.cli macos-permissions
bash scripts/macos_permission_probe.sh
```

現在の実行主体からmacOSの許可プロンプトを出す場合:

```bash
bash scripts/macos_permission_probe.sh --prompt
```

Accessibilityは実際にクリックを送る `.lastwar_agent/bin/macos_click` への許可を確認します。Codex内から許可できない場合は `LastWarControl.command` をFinder/Terminalから起動し、表示された許可プロンプトで許可してください。

macOSミラーリング経路だけを検証:

```bash
bash scripts/macos_mirroring_probe.sh
```

軍拡の `イベント -> 日程` ルートを確認し、結果を `memory/arms_race.json` に残す:

```bash
python3 -m lastwar_agent.cli capture-arms-race-schedule
bash scripts/capture_arms_race_schedule.sh
```

定期運用では、準備不足ならクリックせず `memory/arms_race.json` にスキップ理由だけ残す `control-once` を入口にします:

```bash
python3 -m lastwar_agent.cli control-once --backend macos_mirroring --use-manual-rect --execute
bash scripts/control_once.sh --backend appium_ios --execute
```

権限を入れながら待つ場合:

```bash
bash scripts/wait_for_direct_control.sh --backend macos_mirroring --use-manual-rect --execute
```

実行後スクショが保存された場合は、ローカルmacOS Vision OCRで文字抽出し、`memory/arms_race.json` の `current_live_state.detected_text` に残します。単体で試す場合:

```bash
python3 -m lastwar_agent.cli ocr-screenshot runs/YYYYMMDD/lastwar-*.png
```

実タップして、実行後スクショまで保存する場合:

```bash
python3 -m lastwar_agent.cli capture-arms-race-schedule --backend appium_ios --use-session --execute
```

`System Events` でウィンドウ座標を取れない場合でも、iPhoneミラーリングの表示領域を手動で固定して座標だけで既知ルートを実行するフォールバックがあります。これはスクショ観測なしの最終手段なので、必ず画面を見ながら使います。
実タップにはAccessibility許可が必要です。

```bash
python3 -m lastwar_agent.cli set-macos-manual-rect --x <left> --y <top> --width <w> --height <h>
python3 -m lastwar_agent.cli macos-manual-rect
python3 -m lastwar_agent.cli run-route arms_race_schedule --backend macos_mirroring --use-manual-rect --execute
```

通常Terminalで実行できる場合は、マウス位置から矩形とルート点をサンプルできます。

```bash
bash scripts/sample_macos_manual_rect.sh
bash scripts/sample_route_point.sh arms_race_schedule open_event
bash scripts/sample_route_point.sh arms_race_schedule open_schedule --calibrated
```

実クリックする場合:

```bash
python3 -m lastwar_agent.cli run-once --execute --max-actions 3
```

`--execute` を付けない限りクリックしません。

## Vision判断を使う場合

Vision判断は任意です。使う場合は環境変数でモデルを指定します。

```bash
export OPENAI_API_KEY=...
export LASTWAR_VISION_MODEL=...
python3 -m lastwar_agent.cli run-once --planner vision --dry-run
```

VisionプランナーはJSONで候補アクションを返しますが、実行側は `risk=low` かつ許可済みの操作だけを実行します。

## スケジュール実行

常駐ループ:

```bash
python3 -m lastwar_agent.cli schedule --dry-run
```

launchd用テンプレートは `launchd/com.lastwar.agent.plist.template` にあります。パスと実行モードを確認してから `~/Library/LaunchAgents/` に配置してください。

## 安全方針

- 課金、ダイヤ消費、加速大量使用、同盟/PvP系操作は自動実行しない前提です。
- 想定外画面、購入、確認、ダイヤ等の危険語がVision判断で検出された場合は停止します。
- ゲームの利用規約に抵触する可能性があるため、運用は自己責任です。

## スキル設計

スキルは `lastwar_agent/skills/` にPythonクラスとして実装しています。追加するときは次の境界を守る方針です。

- 1スキルは1目的にする
- `evaluate()` は候補アクションを返すだけにする
- 実クリックは `Executor` だけが行う
- `risk=low` 以外は自動実行しない
- 想定外画面では候補を返さない

詳細は `docs/architecture.md` を参照してください。

## iPhone操作バックエンド

安定運用では、iPhoneミラーリングを直接GUI操作するより `Appium + XCUITest/WebDriverAgent` でiPhone本体にスクショ/タップ命令を送る方が堅いです。比較は `docs/ios-control-options.md` にまとめています。

Appium実機セットアップは `docs/appium-ios-setup.md` にあります。実装済みCLI:

```bash
python3 -m lastwar_agent.cli direct-control-status
python3 -m lastwar_agent.cli doctor
python3 -m lastwar_agent.cli appium-status
python3 -m lastwar_agent.cli ios-list-apps
python3 -m lastwar_agent.cli ios-discover-lastwar --save
python3 -m lastwar_agent.cli device-config
python3 -m lastwar_agent.cli ios-observe
python3 -m lastwar_agent.cli ios-start-session
python3 -m lastwar_agent.cli ios-session-screenshot
python3 -m lastwar_agent.cli ios-stop-session
python3 -m lastwar_agent.cli ios-tap --x 0.5 --y 0.5
python3 -m lastwar_agent.cli run-once --backend appium_ios --use-session --dry-run
python3 -m lastwar_agent.cli schedule --backend appium_ios --use-session --dry-run
python3 -m lastwar_agent.cli run-route arms_race_schedule --backend appium_ios --use-session
python3 -m lastwar_agent.cli capture-arms-race-schedule --backend appium_ios --use-session
python3 -m lastwar_agent.cli control-once --backend appium_ios --use-session --execute
python3 -m lastwar_agent.cli set-route-point arms_race_schedule open_event --x 0.92 --y 0.36
python3 -m lastwar_agent.cli set-route-point-pixel arms_race_schedule open_event --screenshot runs/YYYYMMDD/lastwar-appium-calibrate-*.png --x-pixel 350 --y-pixel 300
python3 -m lastwar_agent.cli set-route-calibrated arms_race_schedule
python3 -m lastwar_agent.cli direct-control-status
```

外部ターミナルからまとめて検証する場合:

```bash
bash scripts/bootstrap_direct_control.sh --install
python3 -m lastwar_agent.cli bootstrap-report runs/direct_control_bootstrap_latest.json --ingest
bash scripts/appium_full_probe.sh --install
python3 -m lastwar_agent.cli control-report runs/appium_probe_latest.json --ingest
```

## メモリ

軍拡の把握内容は `memory/arms_race.json` に保存します。まずは既知ルールとライブ観測結果を分け、ライブ観測ができない場合は `current_live_state.status=not_observed` のまま理由を残します。

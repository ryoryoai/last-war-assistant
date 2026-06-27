export type LocaleCode =
  | "ja"
  | "en"
  | "ko"
  | "zh-Hans"
  | "zh-Hant"
  | "es"
  | "pt"
  | "fr"
  | "de"
  | "id"
  | "vi"
  | "th"
  | "ru";

export type LocalePreference = LocaleCode | "auto";
export type InstallGuidePlatform = "android" | "desktop" | "ios";

type Translation = {
  authorPageBackLabel: string;
  authorPageDocumentTitle: string;
  authorPageGitHubProfileLabel: string;
  authorPageGreeting: string;
  authorPageGreetingTitle: string;
  authorPageIntro: string;
  authorPageLinksTitle: string;
  authorPageRepositoryLabel: string;
  authorPageTitle: string;
  authorPageXProfileLabel: string;
  calendarNextMonth: string;
  calendarPreviousMonth: string;
  calendarTitle: string;
  closeButton: string;
  closedServerAria: (number: number) => string;
  copyFailed: string;
  copyHint: string;
  copyNextServersAria: (group: string) => string;
  copyServersAria: string;
  copySuccess: string;
  countdownTitle: (time: string) => string;
  currentTargetLabel: string;
  dateLocale: string;
  exclusionSettingsTitle: string;
  githubLinkLabel: string;
  groupLegendAria: string;
  htmlLang: string;
  installAlreadyAdded: string;
  installButton: string;
  installDialogDescription: string;
  installDialogTitle: string;
  installHelp: string;
  installSteps: Record<InstallGuidePlatform, string[]>;
  languageAria: string;
  languageAuto: string;
  nextGroupLabel: string;
  noticeDialogDescription: string;
  noticeDialogTitle: string;
  noticeItems: string[];
  noticeLinkLabel: string;
  privacyCloudflareLinkLabel: string;
  privacyDialogDescription: string;
  privacyDialogTitle: string;
  privacyItems: string[];
  resetExclusionsAria: string;
  resetExclusionsLabel: string;
  selectedMissionLabel: string;
  selectedMissionSummary: (group: string, nextGroup: string) => string;
  serverDateLabel: (date: string) => string;
  serverListTabsAria: string;
  serverAria: (number: number, group: string) => string;
  settingsAboutDescription: string;
  settingsAppSectionTitle: string;
  settingsButtonLabel: string;
  settingsControlsSectionTitle: string;
  settingsDialogDescription: string;
  settingsDialogTitle: string;
  settingsDisplayDescription: string;
  settingsDisplaySectionTitle: string;
  settingsInfoSectionTitle: string;
  settingsInstallDescription: string;
  settingsLanguageDescription: string;
  settingsLanguageSectionTitle: string;
  settingsNoticeDescription: string;
  settingsRepositoryDescription: string;
  followingGroupLabel: string;
  themeAria: string;
  themeOptions: Record<"dark" | "light" | "system", string>;
  title: string;
  authorLinkLabel: string;
  updateAvailable: string;
  updateButton: string;
};

export const languageOptions: Array<{ label: string | null; value: LocalePreference }> = [
  { value: "auto", label: null },
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
  { value: "zh-Hans", label: "简体中文" },
  { value: "zh-Hant", label: "繁體中文" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "id", label: "Indonesia" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "th", label: "ไทย" },
  { value: "ru", label: "Русский" },
];

const en: Translation = {
  authorPageBackLabel: "Back to missions",
  authorPageDocumentTitle: "About | Last War Assistant",
  authorPageGitHubProfileLabel: "Maintainer GitHub profile",
  authorPageGreeting:
    "Thank you for using this tool. If you notice anything, please reach out on X or GitHub.",
  authorPageGreetingTitle: "Contact",
  authorPageIntro: "This is an independently maintained unofficial fan tool.",
  authorPageLinksTitle: "Related links",
  authorPageRepositoryLabel: "Git repository",
  authorPageTitle: "About this app",
  authorPageXProfileLabel: "X profile",
  calendarNextMonth: "Next month",
  calendarPreviousMonth: "Previous month",
  calendarTitle: "Mission Calendar",
  closeButton: "OK",
  closedServerAria: (number) => `Server ${number}, closed`,
  copyFailed: "Copy failed",
  copyHint: "Tap the list to copy",
  copyNextServersAria: (group) => `Copy next ${group} server list`,
  copyServersAria: "Copy today's server list",
  copySuccess: "copied",
  countdownTitle: (time) => `Mission switches in ${time}`,
  currentTargetLabel: "Today's group",
  dateLocale: "en-US",
  exclusionSettingsTitle: "Exclusion settings",
  githubLinkLabel: "Git repository",
  groupLegendAria: "Group legend",
  htmlLang: "en",
  installAlreadyAdded: "Already added to Home.",
  installButton: "Add to Home",
  installDialogDescription: "Follow these steps for your device.",
  installDialogTitle: "Add to Home",
  installHelp: "Use your browser menu to add this page to Home.",
  installSteps: {
    android: [
      "Open this page in Chrome.",
      "Tap the browser menu.",
      "Choose Add to Home screen or Install app.",
      "Tap Add or Install.",
    ],
    desktop: [
      "Open the browser menu.",
      "Choose Install app or Add to Home screen.",
      "Confirm the install.",
    ],
    ios: [
      "Open this page in Safari.",
      "Tap the Share button.",
      "Choose Add to Home Screen.",
      "Tap Add.",
    ],
  },
  languageAria: "Language",
  languageAuto: "Auto",
  nextGroupLabel: "Next group",
  noticeDialogDescription: "Please check these notes when using this fan tool.",
  noticeDialogTitle: "Notice",
  noticeItems: [
    "This site is an unofficial fan tool. It is not affiliated with, approved by, endorsed by, or sponsored by the developer or operator of Last War. Game names, trademarks, and related rights belong to their respective owners.",
    "Star mission groups and server information may differ from the game if the game rules or data change.",
    "The accuracy of the posted information is not guaranteed. Please prioritize the in-game display.",
  ],
  noticeLinkLabel: "Notice",
  privacyCloudflareLinkLabel: "Cloudflare Privacy Policy",
  privacyDialogDescription: "This site stores only the settings needed for the tool.",
  privacyDialogTitle: "Privacy",
  privacyItems: [
    "Excluded servers are saved in a cookie. Theme and language settings are saved in localStorage.",
    "This site does not collect personal information such as names or email addresses through forms, and does not use advertising cookies.",
    "Because this site is served on Cloudflare Pages, Cloudflare may process access logs and related data.",
  ],
  resetExclusionsAria: "Reset exclusions to default",
  resetExclusionsLabel: "default",
  selectedMissionLabel: "Selected day mission",
  selectedMissionSummary: (group, nextGroup) => `Mission: ${group} / Next: ${nextGroup}`,
  serverDateLabel: (date) => `Server day: ${date}`,
  serverListTabsAria: "Server list group",
  serverAria: (number, group) => `Server ${number}, group ${group}`,
  settingsAboutDescription: "Contact and app information.",
  settingsAppSectionTitle: "App",
  settingsButtonLabel: "Settings",
  settingsControlsSectionTitle: "Preferences",
  settingsDialogDescription: "Adjust everyday preferences and open app information.",
  settingsDialogTitle: "Settings",
  settingsDisplayDescription: "Match your device, or choose light or dark.",
  settingsDisplaySectionTitle: "Display",
  settingsInfoSectionTitle: "Information",
  settingsInstallDescription: "Open faster from your home screen.",
  settingsLanguageDescription: "Use your browser language or choose manually.",
  settingsLanguageSectionTitle: "Language",
  settingsNoticeDescription: "Rules, accuracy notes, and privacy.",
  settingsRepositoryDescription: "Open the source repository.",
  followingGroupLabel: "Next day group",
  themeAria: "Display theme",
  themeOptions: {
    dark: "Dark",
    light: "Light",
    system: "System",
  },
  title: "Today's Star Mission Servers | Last War Assistant",
  authorLinkLabel: "About",
  updateAvailable: "A new version is available.",
  updateButton: "Update",
};

export const translations: Record<LocaleCode, Translation> = {
  en,
  ja: {
    ...en,
    authorPageBackLabel: "星任務に戻る",
    authorPageDocumentTitle: "アプリ情報 | Last War Assistant",
    authorPageGitHubProfileLabel: "運営者のGitHubプロフィール",
    authorPageGreeting:
      "使ってくれてありがとうございます。気づいたことがあれば X か GitHub から送ってください。",
    authorPageGreetingTitle: "連絡先",
    authorPageIntro: "このアプリは個人運営の非公式ファンツールです。",
    authorPageLinksTitle: "関連リンク",
    authorPageRepositoryLabel: "Gitリポジトリ",
    authorPageTitle: "アプリ情報",
    authorPageXProfileLabel: "Xプロフィール",
    calendarTitle: "任務カレンダー",
    closeButton: "OK",
    closedServerAria: (number) => `サーバー ${number} 閉鎖`,
    copyFailed: "コピーできませんでした",
    copyHint: "リストをタップでコピー",
    copyNextServersAria: (group) => `次の${group}サーバーリストをコピー`,
    copyServersAria: "今日のサーバーリストをコピー",
    countdownTitle: (time) => `星任務切り替えまで ${time}`,
    currentTargetLabel: "今日のグループ",
    dateLocale: "ja-JP",
    exclusionSettingsTitle: "除外サーバー設定",
    githubLinkLabel: "Gitリポジトリ",
    groupLegendAria: "グループ凡例",
    htmlLang: "ja",
    installAlreadyAdded: "すでにホームに追加されています",
    installButton: "ホームに追加",
    installDialogDescription: "端末に合わせて次の手順で追加できます",
    installDialogTitle: "ホームに追加",
    installHelp: "ブラウザメニューからホームに追加できます",
    installSteps: {
      android: [
        "Chromeでこのページを開く",
        "右上のメニュー（︙）をタップ",
        "「ホーム画面に追加」または「アプリをインストール」を選ぶ",
        "「追加」または「インストール」をタップ",
      ],
      desktop: [
        "ブラウザのメニューを開く",
        "「アプリをインストール」または「ホーム画面に追加」を選ぶ",
        "インストールを確定する",
      ],
      ios: [
        "Safariでこのページを開く",
        "共有ボタンをタップ",
        "「ホーム画面に追加」を選ぶ",
        "右上の「追加」をタップ",
      ],
    },
    languageAria: "言語",
    languageAuto: "自動",
    nextGroupLabel: "次のグループ",
    noticeDialogDescription: "このファンツールの利用に関する注意事項です。",
    noticeDialogTitle: "注意事項",
    noticeItems: [
      "このサイトは非公式ファンツールです。Last War の開発・運営会社とは関係なく、承認・提携・後援を受けていません。ゲーム名・商標等は各権利者に帰属します。",
      "星任務グループやサーバー情報は、ゲーム側の仕様変更等により実際の表示と異なる場合があります。",
      "掲載情報の正確性は保証しません。ゲーム内表示を優先してください。",
    ],
    noticeLinkLabel: "注意事項",
    privacyCloudflareLinkLabel: "Cloudflare Privacy Policy",
    privacyDialogDescription: "このサイトで保存する設定情報について。",
    privacyDialogTitle: "プライバシー",
    privacyItems: [
      "除外サーバーは Cookie、テーマと言語設定は localStorage に保存します。これらは表示と機能に必要な設定保存です。",
      "このサイトは、入力フォーム等で氏名・メールアドレスなどの個人情報を収集しません。広告目的の Cookie は使用しません。",
      "Cloudflare Pages で配信しているため、Cloudflare 側でアクセスログ等が処理される可能性があります。",
    ],
    selectedMissionLabel: "選択日の任務",
    selectedMissionSummary: (group, nextGroup) => `任務：${group} / 次：${nextGroup}`,
    serverDateLabel: (date) => `サーバー日：${date}`,
    serverListTabsAria: "サーバーリスト切替",
    serverAria: (number, group) => `サーバー ${number} グループ ${group}`,
    settingsAboutDescription: "連絡先とアプリ情報を確認します。",
    settingsAppSectionTitle: "アプリ",
    settingsButtonLabel: "設定",
    settingsControlsSectionTitle: "よく使う設定",
    settingsDialogDescription: "よく使う設定とアプリ情報をまとめています。",
    settingsDialogTitle: "設定",
    settingsDisplayDescription: "端末設定に合わせるか、ライト/ダークを選択。",
    settingsDisplaySectionTitle: "表示",
    settingsInfoSectionTitle: "情報とリンク",
    settingsInstallDescription: "ホーム画面からすぐ開けます。",
    settingsLanguageDescription: "ブラウザに合わせるか、手動で選択。",
    settingsLanguageSectionTitle: "言語",
    settingsNoticeDescription: "注意事項、情報の精度、プライバシーを確認します。",
    settingsRepositoryDescription: "ソースリポジトリを開きます。",
    followingGroupLabel: "翌日のグループ",
    themeAria: "表示テーマ",
    themeOptions: {
      dark: "ダーク",
      light: "ライト",
      system: "システム",
    },
    title: "今日の星任務サーバー | Last War Assistant",
    authorLinkLabel: "アプリ情報",
    updateAvailable: "新しいバージョンがあります",
    updateButton: "更新",
  },
  ko: {
    ...en,
    calendarTitle: "임무 달력",
    copyHint: "목록을 탭하여 복사",
    dateLocale: "ko-KR",
    exclusionSettingsTitle: "제외 설정",
    htmlLang: "ko",
    installButton: "홈에 추가",
    languageAuto: "자동",
    title: "오늘의 별 임무 서버 | Last War Assistant",
  },
  "zh-Hans": {
    ...en,
    calendarTitle: "任务日历",
    copyHint: "点按列表复制",
    dateLocale: "zh-CN",
    exclusionSettingsTitle: "排除设置",
    htmlLang: "zh-Hans",
    installButton: "添加到主屏幕",
    languageAuto: "自动",
    title: "今日星级任务服务器 | Last War Assistant",
  },
  "zh-Hant": {
    ...en,
    calendarTitle: "任務日曆",
    copyHint: "點按清單複製",
    dateLocale: "zh-TW",
    exclusionSettingsTitle: "排除設定",
    htmlLang: "zh-Hant",
    installButton: "加入主畫面",
    languageAuto: "自動",
    title: "今日星級任務伺服器 | Last War Assistant",
  },
  es: {
    ...en,
    calendarTitle: "Calendario de misiones",
    copyHint: "Toca la lista para copiar",
    dateLocale: "es-ES",
    exclusionSettingsTitle: "Exclusiones",
    htmlLang: "es",
    installButton: "Añadir a inicio",
    languageAuto: "Automático",
    title: "Servidores de la misión estrella de hoy | Last War Assistant",
  },
  pt: {
    ...en,
    calendarTitle: "Calendário de missões",
    copyHint: "Toque na lista para copiar",
    dateLocale: "pt-BR",
    exclusionSettingsTitle: "Exclusões",
    htmlLang: "pt",
    installButton: "Adicionar à tela inicial",
    languageAuto: "Automático",
    title: "Servidores da missão estrela de hoje | Last War Assistant",
  },
  fr: {
    ...en,
    calendarTitle: "Calendrier des missions",
    copyHint: "Touchez la liste pour copier",
    dateLocale: "fr-FR",
    exclusionSettingsTitle: "Exclusions",
    htmlLang: "fr",
    installButton: "Ajouter à l'accueil",
    languageAuto: "Auto",
    title: "Serveurs de mission étoile du jour | Last War Assistant",
  },
  de: {
    ...en,
    calendarTitle: "Missionskalender",
    copyHint: "Liste antippen zum Kopieren",
    dateLocale: "de-DE",
    exclusionSettingsTitle: "Ausschlüsse",
    htmlLang: "de",
    installButton: "Zum Startbildschirm",
    languageAuto: "Automatisch",
    title: "Heutige Sternmissionsserver | Last War Assistant",
  },
  id: {
    ...en,
    calendarTitle: "Kalender misi",
    copyHint: "Ketuk daftar untuk menyalin",
    dateLocale: "id-ID",
    exclusionSettingsTitle: "Pengecualian",
    htmlLang: "id",
    installButton: "Tambahkan ke Home",
    languageAuto: "Otomatis",
    title: "Server misi bintang hari ini | Last War Assistant",
  },
  vi: {
    ...en,
    calendarTitle: "Lịch nhiệm vụ",
    copyHint: "Chạm vào danh sách để sao chép",
    dateLocale: "vi-VN",
    exclusionSettingsTitle: "Loại trừ",
    htmlLang: "vi",
    installButton: "Thêm vào màn hình chính",
    languageAuto: "Tự động",
    title: "Máy chủ nhiệm vụ sao hôm nay | Last War Assistant",
  },
  th: {
    ...en,
    calendarTitle: "ปฏิทินภารกิจ",
    copyHint: "แตะรายการเพื่อคัดลอก",
    dateLocale: "th-TH-u-ca-gregory",
    exclusionSettingsTitle: "การยกเว้น",
    htmlLang: "th",
    installButton: "เพิ่มไปยังหน้าจอหลัก",
    languageAuto: "อัตโนมัติ",
    title: "เซิร์ฟเวอร์ภารกิจดาววันนี้ | Last War Assistant",
  },
  ru: {
    ...en,
    calendarTitle: "Календарь миссий",
    copyHint: "Нажмите список, чтобы скопировать",
    dateLocale: "ru-RU",
    exclusionSettingsTitle: "Исключения",
    htmlLang: "ru",
    installButton: "Добавить на экран",
    languageAuto: "Авто",
    title: "Серверы звездной миссии сегодня | Last War Assistant",
  },
};

export function supportedLocaleFor(language: string): LocaleCode | null {
  const lowerLanguage = language.toLowerCase();

  if (lowerLanguage.startsWith("zh")) {
    return lowerLanguage.includes("hant") || /-(tw|hk|mo)\b/.test(lowerLanguage)
      ? "zh-Hant"
      : "zh-Hans";
  }

  const baseLanguage = lowerLanguage.split("-")[0] as LocaleCode;
  return translations[baseLanguage] ? baseLanguage : null;
}

export function resolveLocale(preference: LocalePreference, languages: readonly string[]): LocaleCode {
  if (preference !== "auto" && translations[preference]) {
    return preference;
  }

  for (const language of languages) {
    const locale = supportedLocaleFor(language);

    if (locale) {
      return locale;
    }
  }

  return "en";
}

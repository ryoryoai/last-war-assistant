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
  missionLabel: string;
  nextGroupLabel: string;
  resetExclusionsAria: string;
  resetExclusionsLabel: string;
  serverDateLabel: (date: string) => string;
  serverListTabsAria: string;
  serverAria: (number: number, group: string) => string;
  themeAria: string;
  themeOptions: Record<"dark" | "light" | "system", string>;
  title: string;
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
  missionLabel: "Star Mission Servers",
  nextGroupLabel: "Next group",
  resetExclusionsAria: "Reset exclusions to default",
  resetExclusionsLabel: "default",
  serverDateLabel: (date) => `Server day: ${date}`,
  serverListTabsAria: "Server list group",
  serverAria: (number, group) => `Server ${number}, group ${group}`,
  themeAria: "Display theme",
  themeOptions: {
    dark: "Dark",
    light: "Light",
    system: "System",
  },
  title: "Today's Star Mission Servers | Last War Assistant",
  updateAvailable: "A new version is available.",
  updateButton: "Update",
};

export const translations: Record<LocaleCode, Translation> = {
  en,
  ja: {
    ...en,
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
    missionLabel: "星任務サーバー",
    nextGroupLabel: "次のグループ",
    serverDateLabel: (date) => `サーバー日：${date}`,
    serverListTabsAria: "サーバーリスト切替",
    serverAria: (number, group) => `サーバー ${number} グループ ${group}`,
    themeAria: "表示テーマ",
    themeOptions: {
      dark: "ダーク",
      light: "ライト",
      system: "システム",
    },
    title: "今日の星任務サーバー | Last War Assistant",
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

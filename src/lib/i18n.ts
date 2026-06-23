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

type Translation = {
  calendarNextMonth: string;
  calendarPreviousMonth: string;
  calendarTitle: string;
  closedServerAria: (number: number) => string;
  copyFailed: string;
  copyHint: string;
  copyServersAria: string;
  copySuccess: string;
  dateLocale: string;
  exclusionSettingsTitle: string;
  groupLegendAria: string;
  htmlLang: string;
  installButton: string;
  installHelp: string;
  languageAria: string;
  languageAuto: string;
  resetExclusionsAria: string;
  resetExclusionsLabel: string;
  serverAria: (number: number, group: string) => string;
  settingsTitle: string;
  themeAria: string;
  themeOptions: Record<"dark" | "light" | "system", string>;
  timeDisplayAria: string;
  timeDisplayOptions: Record<"local" | "server", string>;
  timeSummary: (mode: string, current: string, nextReset: string) => string;
  title: string;
  todayTitle: string;
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
  closedServerAria: (number) => `Server ${number}, closed`,
  copyFailed: "Copy failed",
  copyHint: "Tap the list to copy",
  copyServersAria: "Copy today's server list",
  copySuccess: "copied",
  dateLocale: "en-US",
  exclusionSettingsTitle: "Exclusion settings",
  groupLegendAria: "Group legend",
  htmlLang: "en",
  installButton: "Add to Home",
  installHelp: "Use your browser menu to add this page to Home.",
  languageAria: "Language",
  languageAuto: "Auto",
  resetExclusionsAria: "Reset exclusions to default",
  resetExclusionsLabel: "default",
  serverAria: (number, group) => `Server ${number}, group ${group}`,
  settingsTitle: "Settings",
  themeAria: "Display theme",
  themeOptions: {
    dark: "Dark",
    light: "Light",
    system: "System",
  },
  timeDisplayAria: "Time display",
  timeDisplayOptions: {
    local: "Local",
    server: "Server",
  },
  timeSummary: (mode, current, nextReset) => `${mode} time ${current} / Next update ${nextReset}`,
  title: "Today's Star Mission Servers | Last War Assistant",
  todayTitle: "Today's Star Mission Servers",
  updateAvailable: "A new version is available.",
  updateButton: "Update",
};

export const translations: Record<LocaleCode, Translation> = {
  en,
  ja: {
    ...en,
    calendarTitle: "任務カレンダー",
    closedServerAria: (number) => `サーバー ${number} 閉鎖`,
    copyFailed: "コピーできませんでした",
    copyHint: "リストをタップでコピー",
    copyServersAria: "今日のサーバーリストをコピー",
    dateLocale: "ja-JP",
    exclusionSettingsTitle: "除外設定",
    groupLegendAria: "グループ凡例",
    htmlLang: "ja",
    installButton: "ホームに追加",
    installHelp: "ブラウザメニューからホームに追加できます",
    languageAria: "言語",
    languageAuto: "自動",
    serverAria: (number, group) => `サーバー ${number} グループ ${group}`,
    settingsTitle: "設定",
    themeAria: "表示テーマ",
    themeOptions: {
      dark: "ダーク",
      light: "ライト",
      system: "システム",
    },
    timeDisplayAria: "時間表示",
    timeDisplayOptions: {
      local: "現地",
      server: "サーバー",
    },
    timeSummary: (mode, current, nextReset) => `${mode}時間 ${current} / 次回更新 ${nextReset}`,
    title: "今日の星任務サーバー | Last War Assistant",
    todayTitle: "今日の星任務サーバー",
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
    settingsTitle: "설정",
    todayTitle: "오늘의 별 임무 서버",
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
    settingsTitle: "设置",
    todayTitle: "今日星级任务服务器",
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
    settingsTitle: "設定",
    todayTitle: "今日星級任務伺服器",
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
    settingsTitle: "Ajustes",
    todayTitle: "Servidores de la misión estrella de hoy",
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
    settingsTitle: "Configurações",
    todayTitle: "Servidores da missão estrela de hoje",
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
    settingsTitle: "Réglages",
    todayTitle: "Serveurs de mission étoile du jour",
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
    settingsTitle: "Einstellungen",
    todayTitle: "Heutige Sternmissionsserver",
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
    settingsTitle: "Pengaturan",
    todayTitle: "Server misi bintang hari ini",
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
    settingsTitle: "Cài đặt",
    todayTitle: "Máy chủ nhiệm vụ sao hôm nay",
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
    settingsTitle: "การตั้งค่า",
    todayTitle: "เซิร์ฟเวอร์ภารกิจดาววันนี้",
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
    settingsTitle: "Настройки",
    todayTitle: "Серверы звездной миссии сегодня",
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

const serverGroups = {
  A: [
    69, 75, 81, 82, 88, 89, 90, 98, 99, 100, 110, 111, 112, 113, 122, 123, 124, 125, 134,
    135, 145, 146, 147, 155, 156, 157, 158, 169, 170, 171, 172, 182, 183, 184, 185, 186,
    187, 196,
  ],
  B: [
    70, 71, 78, 83, 84, 85, 91, 92, 93, 101, 102, 103, 104, 105, 114, 115, 116, 117, 118,
    126, 127, 128, 129, 136, 137, 140, 141, 148, 149, 151, 152, 160, 161, 162, 163, 164,
    165, 173, 174, 175, 176, 178, 188, 189, 190,
  ],
  C: [
    72, 73, 74, 79, 80, 86, 87, 94, 95, 96, 97, 106, 107, 108, 109, 119, 120, 121, 130,
    131, 132, 138, 142, 143, 144, 150, 153, 154, 166, 167, 168, 179, 180, 181, 191, 192,
    193, 194,
  ],
};

const groupOrder = ["A", "B", "C"];
const hourInMilliseconds = 60 * 60 * 1000;
const dayInMilliseconds = 24 * 60 * 60 * 1000;
const serverUtcOffsetHours = -2;
const appVersion = "2026-06-24-03";
const rotationAnchor = {
  date: "2026-06-23",
  group: "A",
};
const themeSymbols = {
  dark: "☾",
  light: "☀",
  system: "◐",
};
const languageOptions = [
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

const translations = {
  en: {
    dateLocale: "en-US",
    htmlLang: "en",
    groupLegendAria: "Group legend",
    languageAria: "Language",
    languageAuto: "Auto",
    calendarCurrent: "Current",
    calendarItemAria: (date, group) => `${date}, group ${group}`,
    calendarNextMonth: "Next month",
    calendarPreviousMonth: "Previous month",
    calendarTitle: "This Month's Mission Calendar",
    copyFailed: "Copy failed",
    copyHint: "Tap the list to copy",
    copyServersAria: "Copy today's server list",
    copySuccess: () => "copied",
    exclusionSettingsTitle: "Exclusion settings",
    installButton: "Add to Home",
    installHelp: "Use your browser menu to add this page to Home.",
    resetExclusionsAria: "Reset exclusions to default",
    resetExclusionsLabel: "default",
    settingsTitle: "Settings",
    timeDisplayAria: "Time display",
    timeDisplayOptions: {
      local: "Local",
      server: "Server",
    },
    updateAvailable: "A new version is available.",
    updateButton: "Update",
    timeSummary: (mode, current, nextReset) => `${mode} time ${current} / Next update ${nextReset}`,
    missionCalendarAria: "Mission calendar",
    resetNote: "Updates at server time 00:00 (11:00 Japan time)",
    closedServerAria: (number) => `Server ${number}, closed`,
    serverAria: (number, group) => `Server ${number}, group ${group}`,
    serverRangeAria: "Server exclusions",
    themeAria: "Display theme",
    themeOptions: {
      dark: "Dark",
      light: "Light",
      system: "System",
    },
    title: "Today's Star Mission Servers | Last War Assistant",
    todayTitle: "Today's Star Mission Servers",
  },
  ja: {
    dateLocale: "ja-JP",
    htmlLang: "ja",
    groupLegendAria: "グループ凡例",
    languageAria: "言語",
    languageAuto: "自動",
    calendarCurrent: "現在",
    calendarItemAria: (date, group) => `${date} グループ ${group}`,
    calendarNextMonth: "翌月",
    calendarPreviousMonth: "前月",
    calendarTitle: "今月の任務カレンダー",
    copyFailed: "コピーできませんでした",
    copyHint: "リストをタップでコピー",
    copyServersAria: "今日のサーバーリストをコピー",
    copySuccess: () => "copied",
    exclusionSettingsTitle: "除外設定",
    installButton: "ホームに追加",
    installHelp: "ブラウザメニューからホームに追加できます",
    resetExclusionsAria: "除外設定をデフォルトに戻す",
    resetExclusionsLabel: "default",
    settingsTitle: "設定",
    timeDisplayAria: "時間表示",
    timeDisplayOptions: {
      local: "現地",
      server: "サーバー",
    },
    updateAvailable: "新しいバージョンがあります",
    updateButton: "更新",
    timeSummary: (mode, current, nextReset) => `${mode}時間 ${current} / 次回更新 ${nextReset}`,
    missionCalendarAria: "任務カレンダー",
    resetNote: "サーバー時間0:00更新（日本時間11:00）",
    closedServerAria: (number) => `サーバー ${number} 閉鎖`,
    serverAria: (number, group) => `サーバー ${number} グループ ${group}`,
    serverRangeAria: "除外サーバー設定",
    themeAria: "表示テーマ",
    themeOptions: {
      dark: "ダーク",
      light: "ライト",
      system: "システム",
    },
    title: "今日の星任務サーバー | Last War Assistant",
    todayTitle: "今日の星任務サーバー",
  },
  ko: {
    dateLocale: "ko-KR",
    htmlLang: "ko",
    groupLegendAria: "그룹 범례",
    languageAria: "언어",
    languageAuto: "자동",
    calendarCurrent: "현재",
    calendarItemAria: (date, group) => `${date}, 그룹 ${group}`,
    calendarTitle: "이번 달 임무 달력",
    exclusionSettingsTitle: "제외 설정",
    localTimeSummary: (current, nextReset) => `현지 시간 ${current} / 다음 갱신 ${nextReset}`,
    missionCalendarAria: "임무 달력",
    resetNote: "일본 시간 11:00에 갱신",
    closedServerAria: (number) => `서버 ${number}, 폐쇄됨`,
    serverAria: (number, group) => `서버 ${number}, 그룹 ${group}`,
    serverRangeAria: "제외할 서버 범위 선택",
    themeAria: "표시 테마",
    themeOptions: {
      dark: "다크",
      light: "라이트",
      system: "시스템",
    },
    title: "오늘의 별 임무 서버 | Last War Assistant",
    todayTitle: "오늘의 별 임무 서버",
  },
  "zh-Hans": {
    dateLocale: "zh-CN",
    htmlLang: "zh-Hans",
    groupLegendAria: "分组图例",
    languageAria: "语言",
    languageAuto: "自动",
    calendarCurrent: "当前",
    calendarItemAria: (date, group) => `${date}，分组 ${group}`,
    calendarTitle: "本月任务日历",
    exclusionSettingsTitle: "排除设置",
    localTimeSummary: (current, nextReset) => `当地时间 ${current} / 下次更新 ${nextReset}`,
    missionCalendarAria: "任务日历",
    resetNote: "日本时间 11:00 更新",
    closedServerAria: (number) => `服务器 ${number}，已关闭`,
    serverAria: (number, group) => `服务器 ${number}，分组 ${group}`,
    serverRangeAria: "排除服务器范围选择",
    themeAria: "显示主题",
    themeOptions: {
      dark: "深色",
      light: "浅色",
      system: "系统",
    },
    title: "今日星级任务服务器 | Last War Assistant",
    todayTitle: "今日星级任务服务器",
  },
  "zh-Hant": {
    dateLocale: "zh-TW",
    htmlLang: "zh-Hant",
    groupLegendAria: "分組圖例",
    languageAria: "語言",
    languageAuto: "自動",
    calendarCurrent: "目前",
    calendarItemAria: (date, group) => `${date}，分組 ${group}`,
    calendarTitle: "本月任務日曆",
    exclusionSettingsTitle: "排除設定",
    localTimeSummary: (current, nextReset) => `當地時間 ${current} / 下次更新 ${nextReset}`,
    missionCalendarAria: "任務日曆",
    resetNote: "日本時間 11:00 更新",
    closedServerAria: (number) => `伺服器 ${number}，已關閉`,
    serverAria: (number, group) => `伺服器 ${number}，分組 ${group}`,
    serverRangeAria: "排除伺服器範圍選擇",
    themeAria: "顯示主題",
    themeOptions: {
      dark: "深色",
      light: "淺色",
      system: "系統",
    },
    title: "今日星級任務伺服器 | Last War Assistant",
    todayTitle: "今日星級任務伺服器",
  },
  es: {
    dateLocale: "es-ES",
    htmlLang: "es",
    groupLegendAria: "Leyenda de grupos",
    languageAria: "Idioma",
    languageAuto: "Automático",
    calendarCurrent: "Actual",
    calendarItemAria: (date, group) => `${date}, grupo ${group}`,
    calendarTitle: "Calendario de misiones de este mes",
    exclusionSettingsTitle: "Ajustes de exclusión",
    localTimeSummary: (current, nextReset) => `Hora local ${current} / Próxima actualización ${nextReset}`,
    missionCalendarAria: "Calendario de misiones",
    resetNote: "Se actualiza a las 11:00, hora de Japón",
    closedServerAria: (number) => `Servidor ${number}, cerrado`,
    serverAria: (number, group) => `Servidor ${number}, grupo ${group}`,
    serverRangeAria: "Rango de servidores excluidos",
    themeAria: "Tema de visualización",
    themeOptions: {
      dark: "Oscuro",
      light: "Claro",
      system: "Sistema",
    },
    title: "Servidores de la misión estrella de hoy | Last War Assistant",
    todayTitle: "Servidores de la misión estrella de hoy",
  },
  pt: {
    dateLocale: "pt-BR",
    htmlLang: "pt",
    groupLegendAria: "Legenda de grupos",
    languageAria: "Idioma",
    languageAuto: "Automático",
    calendarCurrent: "Atual",
    calendarItemAria: (date, group) => `${date}, grupo ${group}`,
    calendarTitle: "Calendário de missões deste mês",
    exclusionSettingsTitle: "Configurações de exclusão",
    localTimeSummary: (current, nextReset) => `Hora local ${current} / Próxima atualização ${nextReset}`,
    missionCalendarAria: "Calendário de missões",
    resetNote: "Atualiza às 11:00 no horário do Japão",
    closedServerAria: (number) => `Servidor ${number}, fechado`,
    serverAria: (number, group) => `Servidor ${number}, grupo ${group}`,
    serverRangeAria: "Intervalo de servidores excluidos",
    themeAria: "Tema de exibição",
    themeOptions: {
      dark: "Escuro",
      light: "Claro",
      system: "Sistema",
    },
    title: "Servidores da missão estrela de hoje | Last War Assistant",
    todayTitle: "Servidores da missão estrela de hoje",
  },
  fr: {
    dateLocale: "fr-FR",
    htmlLang: "fr",
    groupLegendAria: "Légende des groupes",
    languageAria: "Langue",
    languageAuto: "Auto",
    calendarCurrent: "Actuel",
    calendarItemAria: (date, group) => `${date}, groupe ${group}`,
    calendarTitle: "Calendrier des missions du mois",
    exclusionSettingsTitle: "Paramètres d'exclusion",
    localTimeSummary: (current, nextReset) => `Heure locale ${current} / Prochaine mise à jour ${nextReset}`,
    missionCalendarAria: "Calendrier des missions",
    resetNote: "Mise à jour à 11:00, heure du Japon",
    closedServerAria: (number) => `Serveur ${number}, fermé`,
    serverAria: (number, group) => `Serveur ${number}, groupe ${group}`,
    serverRangeAria: "Plage de serveurs exclus",
    themeAria: "Thème d'affichage",
    themeOptions: {
      dark: "Sombre",
      light: "Clair",
      system: "Système",
    },
    title: "Serveurs de mission étoile du jour | Last War Assistant",
    todayTitle: "Serveurs de mission étoile du jour",
  },
  de: {
    dateLocale: "de-DE",
    htmlLang: "de",
    groupLegendAria: "Gruppenlegende",
    languageAria: "Sprache",
    languageAuto: "Automatisch",
    calendarCurrent: "Aktuell",
    calendarItemAria: (date, group) => `${date}, Gruppe ${group}`,
    calendarTitle: "Missionskalender dieses Monats",
    exclusionSettingsTitle: "Ausschlusseinstellungen",
    localTimeSummary: (current, nextReset) => `Ortszeit ${current} / Nächste Aktualisierung ${nextReset}`,
    missionCalendarAria: "Missionskalender",
    resetNote: "Aktualisierung um 11:00 Uhr japanischer Zeit",
    closedServerAria: (number) => `Server ${number}, geschlossen`,
    serverAria: (number, group) => `Server ${number}, Gruppe ${group}`,
    serverRangeAria: "Ausgeschlossener Serverbereich",
    themeAria: "Anzeigethema",
    themeOptions: {
      dark: "Dunkel",
      light: "Hell",
      system: "System",
    },
    title: "Heutige Sternmissionsserver | Last War Assistant",
    todayTitle: "Heutige Sternmissionsserver",
  },
  id: {
    dateLocale: "id-ID",
    htmlLang: "id",
    groupLegendAria: "Legenda grup",
    languageAria: "Bahasa",
    languageAuto: "Otomatis",
    calendarCurrent: "Saat ini",
    calendarItemAria: (date, group) => `${date}, grup ${group}`,
    calendarTitle: "Kalender misi bulan ini",
    exclusionSettingsTitle: "Pengaturan pengecualian",
    localTimeSummary: (current, nextReset) => `Waktu lokal ${current} / Pembaruan berikutnya ${nextReset}`,
    missionCalendarAria: "Kalender misi",
    resetNote: "Diperbarui pukul 11:00 waktu Jepang",
    closedServerAria: (number) => `Server ${number}, ditutup`,
    serverAria: (number, group) => `Server ${number}, grup ${group}`,
    serverRangeAria: "Rentang server yang dikecualikan",
    themeAria: "Tema tampilan",
    themeOptions: {
      dark: "Gelap",
      light: "Terang",
      system: "Sistem",
    },
    title: "Server misi bintang hari ini | Last War Assistant",
    todayTitle: "Server misi bintang hari ini",
  },
  vi: {
    dateLocale: "vi-VN",
    htmlLang: "vi",
    groupLegendAria: "Chú giải nhóm",
    languageAria: "Ngôn ngữ",
    languageAuto: "Tự động",
    calendarCurrent: "Hiện tại",
    calendarItemAria: (date, group) => `${date}, nhóm ${group}`,
    calendarTitle: "Lịch nhiệm vụ tháng này",
    exclusionSettingsTitle: "Cài đặt loại trừ",
    localTimeSummary: (current, nextReset) => `Giờ địa phương ${current} / Cập nhật tiếp theo ${nextReset}`,
    missionCalendarAria: "Lịch nhiệm vụ",
    resetNote: "Cập nhật lúc 11:00 giờ Nhật Bản",
    closedServerAria: (number) => `Máy chủ ${number}, đã đóng`,
    serverAria: (number, group) => `Máy chủ ${number}, nhóm ${group}`,
    serverRangeAria: "Chọn phạm vi máy chủ bị loại trừ",
    themeAria: "Giao diện hiển thị",
    themeOptions: {
      dark: "Tối",
      light: "Sáng",
      system: "Hệ thống",
    },
    title: "Máy chủ nhiệm vụ sao hôm nay | Last War Assistant",
    todayTitle: "Máy chủ nhiệm vụ sao hôm nay",
  },
  th: {
    dateLocale: "th-TH-u-ca-gregory",
    htmlLang: "th",
    groupLegendAria: "คำอธิบายกลุ่ม",
    languageAria: "ภาษา",
    languageAuto: "อัตโนมัติ",
    calendarCurrent: "ปัจจุบัน",
    calendarItemAria: (date, group) => `${date} กลุ่ม ${group}`,
    calendarTitle: "ปฏิทินภารกิจเดือนนี้",
    exclusionSettingsTitle: "ตั้งค่าการยกเว้น",
    localTimeSummary: (current, nextReset) => `เวลาท้องถิ่น ${current} / อัปเดตถัดไป ${nextReset}`,
    missionCalendarAria: "ปฏิทินภารกิจ",
    resetNote: "อัปเดตเวลา 11:00 ตามเวลาญี่ปุ่น",
    closedServerAria: (number) => `เซิร์ฟเวอร์ ${number} ปิดแล้ว`,
    serverAria: (number, group) => `เซิร์ฟเวอร์ ${number} กลุ่ม ${group}`,
    serverRangeAria: "เลือกช่วงเซิร์ฟเวอร์ที่ยกเว้น",
    themeAria: "ธีมการแสดงผล",
    themeOptions: {
      dark: "มืด",
      light: "สว่าง",
      system: "ระบบ",
    },
    title: "เซิร์ฟเวอร์ภารกิจดาววันนี้ | Last War Assistant",
    todayTitle: "เซิร์ฟเวอร์ภารกิจดาววันนี้",
  },
  ru: {
    dateLocale: "ru-RU",
    htmlLang: "ru",
    groupLegendAria: "Обозначения групп",
    languageAria: "Язык",
    languageAuto: "Авто",
    calendarCurrent: "Текущая",
    calendarItemAria: (date, group) => `${date}, группа ${group}`,
    calendarTitle: "Календарь миссий на месяц",
    exclusionSettingsTitle: "Настройки исключений",
    localTimeSummary: (current, nextReset) => `Местное время ${current} / Следующее обновление ${nextReset}`,
    missionCalendarAria: "Календарь миссий",
    resetNote: "Обновление в 11:00 по японскому времени",
    closedServerAria: (number) => `Сервер ${number}, закрыт`,
    serverAria: (number, group) => `Сервер ${number}, группа ${group}`,
    serverRangeAria: "Диапазон исключенных серверов",
    themeAria: "Тема отображения",
    themeOptions: {
      dark: "Темная",
      light: "Светлая",
      system: "Система",
    },
    title: "Серверы сегодняшней звездной миссии | Last War Assistant",
    todayTitle: "Серверы звездной миссии сегодня",
  },
};

const todayCard = document.querySelector("#today-card");
const todayGroupBadge = document.querySelector("#today-group-badge");
const todayTitle = document.querySelector("#today-title");
const todayDate = document.querySelector("#today-date");
const copyHint = document.querySelector("#copy-hint");
const todayServerList = document.querySelector("#today-server-list");
const copyStatus = document.querySelector("#copy-status");
const missionCalendarTitle = document.querySelector("#mission-calendar-title");
const calendarPrevMonthButton = document.querySelector("#calendar-prev-month");
const calendarNextMonthButton = document.querySelector("#calendar-next-month");
const calendarMonthLabel = document.querySelector("#calendar-month-label");
const missionCalendar = document.querySelector("#mission-calendar");
const themeToggle = document.querySelector(".theme-toggle");
const themeButtons = document.querySelectorAll("[data-theme-option]");
const timeToggle = document.querySelector(".time-toggle");
const timeButtons = document.querySelectorAll("[data-time-display]");
const languageSelect = document.querySelector("#language-select");
const filterSection = document.querySelector(".filter-section");
const exclusionSettingsTitle = document.querySelector("#exclusion-settings-title");
const groupLegend = document.querySelector(".legend");
const resetExclusionsButton = document.querySelector("#reset-exclusions-button");
const allServerList = document.querySelector("#all-server-list");
const settingsTitle = document.querySelector("#settings-title");
const installButton = document.querySelector("#install-button");
const updateDialog = document.querySelector("#update-dialog");
const updateDialogMessage = document.querySelector("#update-dialog-message");
const updateButton = document.querySelector("#update-button");

const serverRecords = buildServerRecords();
const serverGroupByNumber = new Map(serverRecords.map((record) => [record.number, record.group]));
const minServerNumber = serverRecords[0].number;
const maxServerNumber = serverRecords[serverRecords.length - 1].number;
const allServerRecords = buildAllServerRecords();
const anchorSerial = serialFromDateString(rotationAnchor.date);
const excludedServersCookieName = "lastwar-secret-mission-excluded-servers";
let currentTime = new Date();
let missionDay = getServerMissionDay(currentTime);
let todayGroup = getGroupForSerial(missionDay.serial);
let displayedCalendarMonthSerial = getServerMonthRange(missionDay.serial).firstSerial;
let todayServerNumbers = [];
let localePreference = storedLocalePreference();
let locale = resolveLocale(localePreference);
let copy = translations[locale];
let timeDisplayMode = storedTimeDisplayPreference();
const excludedServers = new Set();
let copyStatusTimer = null;
let deferredInstallPrompt = null;
let waitingServiceWorker = null;
const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");

function storedLocalePreference() {
  try {
    const preference = localStorage.getItem("lastwar-locale") || "auto";
    return preference === "auto" || translations[preference] ? preference : "auto";
  } catch (_error) {
    return "auto";
  }
}

function localized(key, ...args) {
  const value = copy[key] ?? translations.en[key];

  return typeof value === "function" ? value(...args) : value;
}

function saveLocalePreference(preference) {
  localePreference = preference === "auto" || translations[preference] ? preference : "auto";

  try {
    localStorage.setItem("lastwar-locale", localePreference);
  } catch (_error) {
    // Ignore storage errors and still apply the selected language.
  }

  locale = resolveLocale(localePreference);
  copy = translations[locale];
  applyLocale();
  renderToday();
  renderMissionCalendar();
  renderServerRange();
}

function storedTimeDisplayPreference() {
  try {
    const preference = localStorage.getItem("lastwar-time-display") || "local";
    return preference === "server" ? "server" : "local";
  } catch (_error) {
    return "local";
  }
}

function saveTimeDisplayPreference(preference) {
  timeDisplayMode = preference === "server" ? "server" : "local";

  try {
    localStorage.setItem("lastwar-time-display", timeDisplayMode);
  } catch (_error) {
    // Ignore storage errors and still apply the current selection.
  }

  applyTimeDisplayPreference();
  renderToday();
  renderMissionCalendar();
}

function resolveLocale(preference = "auto") {
  if (preference !== "auto" && translations[preference]) {
    return preference;
  }

  const languages = [
    ...(navigator.languages || []),
    navigator.language,
    navigator.userLanguage,
  ].filter(Boolean);

  for (const language of languages) {
    const localeCode = supportedLocaleFor(language);

    if (localeCode) {
      return localeCode;
    }
  }

  return "en";
}

function supportedLocaleFor(language) {
  const lowerLanguage = language.toLowerCase();

  if (lowerLanguage.startsWith("zh")) {
    return lowerLanguage.includes("hant") || /-(tw|hk|mo)\b/.test(lowerLanguage) ? "zh-Hant" : "zh-Hans";
  }

  const baseLanguage = lowerLanguage.split("-")[0];
  return translations[baseLanguage] ? baseLanguage : null;
}

function buildServerRecords() {
  return Object.entries(serverGroups)
    .flatMap(([group, servers]) => servers.map((number) => ({ number, group })))
    .sort((a, b) => a.number - b.number);
}

function buildAllServerRecords() {
  const records = [];

  for (let number = minServerNumber; number <= maxServerNumber; number += 1) {
    const group = serverGroupByNumber.get(number) || null;
    records.push({
      closed: group === null,
      group,
      number,
    });
  }

  return records;
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function serialFromDateString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / dayInMilliseconds;
}

function getServerMissionDay(now = new Date()) {
  const serverNow = toServerDate(now);
  const serial = Date.UTC(serverNow.getUTCFullYear(), serverNow.getUTCMonth(), serverNow.getUTCDate()) / dayInMilliseconds;

  return {
    date: serialToDate(serial),
    nextResetDate: serialToServerResetDate(serial + 1),
    serial,
  };
}

function toServerDate(date) {
  return new Date(date.getTime() + serverUtcOffsetHours * hourInMilliseconds);
}

function serialToDate(serial) {
  return new Date(serial * dayInMilliseconds);
}

function serialToServerResetDate(serial) {
  return new Date(serial * dayInMilliseconds - serverUtcOffsetHours * hourInMilliseconds);
}

function getServerMonthRange(serial) {
  const date = serialToDate(serial);
  const firstSerial = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1) / dayInMilliseconds;
  const nextMonthSerial = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) / dayInMilliseconds;

  return { firstSerial, nextMonthSerial };
}

function addMonthsToServerMonth(firstSerial, monthOffset) {
  const date = serialToDate(firstSerial);

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + monthOffset, 1) / dayInMilliseconds;
}

function getGroupForSerial(serial) {
  const anchorIndex = groupOrder.indexOf(rotationAnchor.group);
  const offset = positiveModulo(serial - anchorSerial, groupOrder.length);
  return groupOrder[positiveModulo(anchorIndex + offset, groupOrder.length)];
}

function applyLocale() {
  document.documentElement.lang = copy.htmlLang;
  document.documentElement.dataset.locale = locale;
  document.documentElement.dataset.localePreference = localePreference;
  document.title = copy.title;
  todayTitle.textContent = copy.todayTitle;
  copyHint.textContent = localized("copyHint");
  missionCalendarTitle.textContent = copy.calendarTitle;
  missionCalendar.setAttribute("aria-label", copy.missionCalendarAria);
  calendarPrevMonthButton.setAttribute("aria-label", localized("calendarPreviousMonth"));
  calendarNextMonthButton.setAttribute("aria-label", localized("calendarNextMonth"));
  themeToggle.setAttribute("aria-label", copy.themeAria);
  timeToggle.setAttribute("aria-label", localized("timeDisplayAria"));
  todayServerList.setAttribute("aria-label", localized("copyServersAria"));
  todayServerList.title = localized("copyServersAria");
  languageSelect.setAttribute("aria-label", copy.languageAria);
  filterSection.setAttribute("aria-label", copy.serverRangeAria);
  exclusionSettingsTitle.textContent = copy.exclusionSettingsTitle;
  groupLegend.setAttribute("aria-label", copy.groupLegendAria);
  resetExclusionsButton.textContent = localized("resetExclusionsLabel");
  resetExclusionsButton.setAttribute("aria-label", localized("resetExclusionsAria"));
  resetExclusionsButton.title = localized("resetExclusionsAria");
  settingsTitle.textContent = localized("settingsTitle");
  installButton.textContent = localized("installButton");
  updateDialogMessage.textContent = localized("updateAvailable");
  updateButton.textContent = localized("updateButton");
  renderLanguageOptions();

  themeButtons.forEach((button) => {
    const label = copy.themeOptions[button.dataset.themeOption];
    button.textContent = themeSymbols[button.dataset.themeOption];
    button.setAttribute("aria-label", label);
    button.title = label;
  });

  timeButtons.forEach((button) => {
    const label = localized("timeDisplayOptions")[button.dataset.timeDisplay];
    button.textContent = label;
    button.setAttribute("aria-label", label);
    button.title = label;
  });

  applyTimeDisplayPreference();
}

function renderLanguageOptions() {
  languageSelect.innerHTML = "";

  languageOptions.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.value === "auto" ? copy.languageAuto : option.label;
    languageSelect.append(optionElement);
  });

  languageSelect.value = localePreference;
}

function formatServerDate(date) {
  return new Intl.DateTimeFormat(copy.dateLocale, {
    timeZone: "UTC",
    weekday: "short",
    month: "long",
    day: "numeric",
  }).format(toServerDate(date));
}

function formatLocalDateTime(date) {
  return new Intl.DateTimeFormat(copy.dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatServerDateTime(date) {
  return new Intl.DateTimeFormat(copy.dateLocale, {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(toServerDate(date));
}

function formatDisplayDateTime(date) {
  return timeDisplayMode === "server" ? formatServerDateTime(date) : formatLocalDateTime(date);
}

function formatCalendarDate(serial) {
  const startDate = serialToServerResetDate(serial);

  return formatServerDate(startDate);
}

function formatCalendarMonth(firstSerial) {
  return new Intl.DateTimeFormat(copy.dateLocale, {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
  }).format(serialToDate(firstSerial));
}

function weekdayLabels() {
  const baseSunday = Date.UTC(2026, 5, 7);

  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(copy.dateLocale, {
      timeZone: "UTC",
      weekday: "short",
    }).format(new Date(baseSunday + index * dayInMilliseconds)),
  );
}

function createServerChip(record, options = {}) {
  const chip = document.createElement(options.interactive ? "button" : "span");
  const groupClass = record.closed ? "group-closed" : `group-${record.group.toLowerCase()}`;
  chip.className = `server-chip ${groupClass}`;
  chip.dataset.server = String(record.number);
  chip.setAttribute(
    "aria-label",
    record.closed ? copy.closedServerAria(record.number) : copy.serverAria(record.number, record.group),
  );

  const number = document.createElement("span");
  number.textContent = String(record.number);
  chip.append(number);

  if (options.interactive) {
    chip.type = "button";
    chip.addEventListener("click", () => toggleServerExclusion(record.number));
  }

  return chip;
}

function renderToday() {
  const todayServers = serverGroups[todayGroup].filter((number) => !isServerExcluded(number));
  const timeLabel = localized("timeDisplayOptions")[timeDisplayMode];

  todayServerNumbers = todayServers;
  todayCard.dataset.group = todayGroup;
  todayGroupBadge.textContent = todayGroup;
  todayDate.textContent = localized("timeSummary", timeLabel, formatDisplayDateTime(currentTime), formatDisplayDateTime(missionDay.nextResetDate));
  todayServerList.innerHTML = "";

  todayServers.forEach((number) => {
    todayServerList.append(createServerChip({ number, group: todayGroup }));
  });
}

function renderMissionCalendar() {
  const { nextMonthSerial } = getServerMonthRange(displayedCalendarMonthSerial);
  const firstDayOfWeek = serialToDate(displayedCalendarMonthSerial).getUTCDay();

  calendarMonthLabel.textContent = formatCalendarMonth(displayedCalendarMonthSerial);
  missionCalendar.innerHTML = "";

  weekdayLabels().forEach((label) => {
    const weekday = document.createElement("div");
    weekday.className = "calendar-weekday";
    weekday.textContent = label;
    missionCalendar.append(weekday);
  });

  for (let index = 0; index < firstDayOfWeek; index += 1) {
    const blank = document.createElement("div");
    blank.className = "calendar-day is-blank";
    blank.setAttribute("aria-hidden", "true");
    missionCalendar.append(blank);
  }

  for (let serial = displayedCalendarMonthSerial; serial < nextMonthSerial; serial += 1) {
    const group = getGroupForSerial(serial);
    const dateLabel = formatCalendarDate(serial);
    const dateNumber = serialToDate(serial).getUTCDate();
    const item = document.createElement("div");
    const isCurrent = serial === missionDay.serial;

    item.className = `calendar-day group-${group.toLowerCase()}`;
    item.classList.toggle("is-current", isCurrent);
    item.setAttribute("aria-label", copy.calendarItemAria(dateLabel, group));

    const date = document.createElement("span");
    date.className = "calendar-date";
    date.textContent = String(dateNumber);

    const badge = document.createElement("span");
    badge.className = "calendar-group";
    badge.textContent = group;

    item.append(date, badge);

    missionCalendar.append(item);
  }
}

async function copyTodayServerList() {
  const text = todayServerNumbers.join(",");

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else if (!copyTextFallback(text)) {
      throw new Error("Clipboard unavailable");
    }

    showCopyStatus(localized("copySuccess", todayServerNumbers.length));
  } catch (_error) {
    if (copyTextFallback(text)) {
      showCopyStatus(localized("copySuccess", todayServerNumbers.length));
      return;
    }

    showCopyStatus(localized("copyFailed"), true);
  }
}

function copyTextFallback(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "-1000px";
  document.body.append(textArea);
  textArea.select();

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch (_error) {
    copied = false;
  }

  textArea.remove();
  return copied;
}

function showCopyStatus(message, isError = false) {
  window.clearTimeout(copyStatusTimer);
  copyStatus.textContent = message;
  copyStatus.hidden = false;
  copyStatus.classList.toggle("is-error", isError);
  copyStatusTimer = window.setTimeout(() => {
    copyStatus.hidden = true;
  }, 1800);
}

async function handleInstallButtonClick() {
  if (!deferredInstallPrompt) {
    showCopyStatus(localized("installHelp"));
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
}

function showUpdateDialog(worker) {
  waitingServiceWorker = worker || null;
  updateDialogMessage.textContent = localized("updateAvailable");
  updateButton.textContent = localized("updateButton");

  if (typeof updateDialog.showModal === "function" && !updateDialog.open) {
    updateDialog.showModal();
    return;
  }

  updateDialog.setAttribute("open", "");
}

async function checkForAppUpdate() {
  try {
    const response = await fetch(`./version.json?time=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const { version } = await response.json();

    if (version && version !== appVersion) {
      showUpdateDialog(null);
    }
  } catch (_error) {
    // Ignore update check failures; the next interval will retry.
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.register("./sw.js").then((registration) => {
    if (registration.waiting) {
      showUpdateDialog(registration.waiting);
    }

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;

      if (!newWorker) {
        return;
      }

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateDialog(newWorker);
        }
      });
    });

    window.setInterval(() => registration.update(), 60 * 60 * 1000);
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

function storedThemePreference() {
  try {
    return localStorage.getItem("lastwar-theme") || "system";
  } catch (_error) {
    return "system";
  }
}

function applyThemePreference(preference) {
  const resolved = preference === "system" ? (themeMedia.matches ? "dark" : "light") : preference;

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.style.colorScheme = resolved;

  themeButtons.forEach((button) => {
    const selected = button.dataset.themeOption === preference;
    button.setAttribute("aria-pressed", String(selected));
  });
}

function saveThemePreference(preference) {
  try {
    localStorage.setItem("lastwar-theme", preference);
  } catch (_error) {
    // Ignore storage errors and still apply the current selection.
  }

  applyThemePreference(preference);
}

function applyTimeDisplayPreference() {
  document.documentElement.dataset.timeDisplayMode = timeDisplayMode;

  timeButtons.forEach((button) => {
    const selected = button.dataset.timeDisplay === timeDisplayMode;
    button.setAttribute("aria-pressed", String(selected));
  });
}

function getCookieValue(name) {
  return (document.cookie || "")
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function saveExcludedServersPreference() {
  if (excludedServers.size === 0) {
    document.cookie = `${excludedServersCookieName}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  const value = encodeURIComponent([...excludedServers].sort((a, b) => a - b).join(","));
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${excludedServersCookieName}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

function initializeExcludedServers() {
  const savedServers = getCookieValue(excludedServersCookieName);

  if (!savedServers) {
    return;
  }

  try {
    decodeURIComponent(savedServers)
      .split(",")
      .map(Number)
      .filter((number) => serverGroupByNumber.has(number))
      .forEach((number) => excludedServers.add(number));
  } catch (_error) {
    excludedServers.clear();
    saveExcludedServersPreference();
  }
}

function isServerExcluded(number) {
  return excludedServers.has(number);
}

function renderServerRange() {
  allServerList.innerHTML = "";
  allServerRecords.forEach((record) => {
    const chip = createServerChip(record, { interactive: !record.closed });
    const excluded = isServerExcluded(record.number);

    chip.classList.toggle("is-closed", record.closed);
    chip.classList.toggle("is-excluded", excluded && !record.closed);

    if (record.closed) {
      chip.setAttribute("aria-disabled", "true");
    } else {
      chip.setAttribute("aria-pressed", String(excluded));
    }

    allServerList.append(chip);
  });
}

function updateExcludedServers() {
  saveExcludedServersPreference();
  renderToday();
  renderServerRange();
}

function refreshMissionState() {
  currentTime = new Date();
  missionDay = getServerMissionDay(currentTime);
  todayGroup = getGroupForSerial(missionDay.serial);
  renderToday();
  renderMissionCalendar();
}

function moveCalendarMonth(monthOffset) {
  displayedCalendarMonthSerial = addMonthsToServerMonth(displayedCalendarMonthSerial, monthOffset);
  renderMissionCalendar();
}

function toggleServerExclusion(serverNumber) {
  if (!serverGroupByNumber.has(serverNumber)) {
    return;
  }

  if (excludedServers.has(serverNumber)) {
    excludedServers.delete(serverNumber);
  } else {
    excludedServers.add(serverNumber);
  }

  updateExcludedServers();
}

function resetExclusionsToDefault() {
  if (excludedServers.size === 0) {
    return;
  }

  excludedServers.clear();
  updateExcludedServers();
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => saveThemePreference(button.dataset.themeOption));
});
timeButtons.forEach((button) => {
  button.addEventListener("click", () => saveTimeDisplayPreference(button.dataset.timeDisplay));
});
resetExclusionsButton.addEventListener("click", resetExclusionsToDefault);
calendarPrevMonthButton.addEventListener("click", () => moveCalendarMonth(-1));
calendarNextMonthButton.addEventListener("click", () => moveCalendarMonth(1));
installButton.addEventListener("click", handleInstallButtonClick);
updateButton.addEventListener("click", () => {
  if (waitingServiceWorker) {
    waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    return;
  }

  window.location.reload();
});
todayServerList.addEventListener("click", copyTodayServerList);
todayServerList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  copyTodayServerList();
});
languageSelect.addEventListener("change", () => saveLocalePreference(languageSelect.value));
themeMedia.addEventListener("change", () => {
  if (storedThemePreference() === "system") {
    applyThemePreference("system");
  }
});
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

applyLocale();
applyThemePreference(storedThemePreference());
applyTimeDisplayPreference();
initializeExcludedServers();
renderToday();
renderMissionCalendar();
renderServerRange();
registerServiceWorker();
checkForAppUpdate();
window.setInterval(refreshMissionState, 60 * 1000);
window.setInterval(checkForAppUpdate, 30 * 60 * 1000);

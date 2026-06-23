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
const dayInMilliseconds = 24 * 60 * 60 * 1000;
const resetHourJst = 11;
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
    serverAria: (number, group) => `Server ${number}, group ${group}`,
    serverCount: (count) => `${count} ${count === 1 ? "server" : "servers"}`,
    serverRangeAria: "Server range selection",
    targetGroup: (group) => `Target group ${group}`,
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
    serverAria: (number, group) => `サーバー ${number} グループ ${group}`,
    serverCount: (count) => `${count}サーバー`,
    serverRangeAria: "サーバー範囲設定",
    targetGroup: (group) => `対象グループ ${group}`,
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
    serverAria: (number, group) => `서버 ${number}, 그룹 ${group}`,
    serverCount: (count) => `${count}개 서버`,
    serverRangeAria: "서버 범위 선택",
    targetGroup: (group) => `대상 그룹 ${group}`,
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
    serverAria: (number, group) => `服务器 ${number}，分组 ${group}`,
    serverCount: (count) => `${count} 个服务器`,
    serverRangeAria: "服务器范围选择",
    targetGroup: (group) => `目标分组 ${group}`,
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
    serverAria: (number, group) => `伺服器 ${number}，分組 ${group}`,
    serverCount: (count) => `${count} 個伺服器`,
    serverRangeAria: "伺服器範圍選擇",
    targetGroup: (group) => `目標分組 ${group}`,
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
    serverAria: (number, group) => `Servidor ${number}, grupo ${group}`,
    serverCount: (count) => `${count} ${count === 1 ? "servidor" : "servidores"}`,
    serverRangeAria: "Selección de rango de servidores",
    targetGroup: (group) => `Grupo objetivo ${group}`,
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
    serverAria: (number, group) => `Servidor ${number}, grupo ${group}`,
    serverCount: (count) => `${count} ${count === 1 ? "servidor" : "servidores"}`,
    serverRangeAria: "Seleção de intervalo de servidores",
    targetGroup: (group) => `Grupo alvo ${group}`,
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
    serverAria: (number, group) => `Serveur ${number}, groupe ${group}`,
    serverCount: (count) => `${count} ${count === 1 ? "serveur" : "serveurs"}`,
    serverRangeAria: "Sélection de plage de serveurs",
    targetGroup: (group) => `Groupe cible ${group}`,
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
    serverAria: (number, group) => `Server ${number}, Gruppe ${group}`,
    serverCount: (count) => `${count} Server`,
    serverRangeAria: "Serverbereich auswählen",
    targetGroup: (group) => `Zielgruppe ${group}`,
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
    serverAria: (number, group) => `Server ${number}, grup ${group}`,
    serverCount: (count) => `${count} server`,
    serverRangeAria: "Pilihan rentang server",
    targetGroup: (group) => `Grup target ${group}`,
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
    serverAria: (number, group) => `Máy chủ ${number}, nhóm ${group}`,
    serverCount: (count) => `${count} máy chủ`,
    serverRangeAria: "Chọn phạm vi máy chủ",
    targetGroup: (group) => `Nhóm mục tiêu ${group}`,
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
    serverAria: (number, group) => `เซิร์ฟเวอร์ ${number} กลุ่ม ${group}`,
    serverCount: (count) => `${count} เซิร์ฟเวอร์`,
    serverRangeAria: "เลือกช่วงเซิร์ฟเวอร์",
    targetGroup: (group) => `กลุ่มเป้าหมาย ${group}`,
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
    serverAria: (number, group) => `Сервер ${number}, группа ${group}`,
    serverCount: (count) => `${count} ${russianServerWord(count)}`,
    serverRangeAria: "Выбор диапазона серверов",
    targetGroup: (group) => `Целевая группа ${group}`,
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
const todayCycle = document.querySelector("#today-cycle");
const todayCount = document.querySelector("#today-count");
const todayServerList = document.querySelector("#today-server-list");
const themeToggle = document.querySelector(".theme-toggle");
const themeButtons = document.querySelectorAll("[data-theme-option]");
const languageSelect = document.querySelector("#language-select");
const filterSection = document.querySelector(".filter-section");
const groupLegend = document.querySelector(".legend");
const allServerList = document.querySelector("#all-server-list");

const serverRecords = buildServerRecords();
const serverNumberSet = new Set(serverRecords.map((record) => record.number));
const minServerNumber = serverRecords[0].number;
const maxServerNumber = serverRecords[serverRecords.length - 1].number;
const anchorSerial = serialFromDateString(rotationAnchor.date);
const gameDay = getJstGameDay();
const todayGroup = getGroupForSerial(gameDay.serial);
const rangeCookieName = "lastwar-secret-mission-range";
let localePreference = storedLocalePreference();
let locale = resolveLocale(localePreference);
let copy = translations[locale];
let nextRangePick = "start";
let selectedRangeStart = minServerNumber;
let selectedRangeEnd = maxServerNumber;
let suppressNextClick = false;
const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
const dragSelection = {
  active: false,
  currentServer: null,
  moved: false,
  originX: 0,
  originY: 0,
  pointerId: null,
  startServer: null,
};

function russianServerWord(count) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "серверов";
  }

  if (lastDigit === 1) {
    return "сервер";
  }

  return lastDigit >= 2 && lastDigit <= 4 ? "сервера" : "серверов";
}

function storedLocalePreference() {
  try {
    const preference = localStorage.getItem("lastwar-locale") || "auto";
    return preference === "auto" || translations[preference] ? preference : "auto";
  } catch (_error) {
    return "auto";
  }
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
  renderServerRange();
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

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function serialFromDateString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / dayInMilliseconds;
}

function getJstGameDay(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
  let serial = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / dayInMilliseconds;

  if (Number(parts.hour) < resetHourJst) {
    serial -= 1;
  }

  return {
    date: new Date(serial * dayInMilliseconds),
    serial,
  };
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
  themeToggle.setAttribute("aria-label", copy.themeAria);
  languageSelect.setAttribute("aria-label", copy.languageAria);
  filterSection.setAttribute("aria-label", copy.serverRangeAria);
  groupLegend.setAttribute("aria-label", copy.groupLegendAria);
  renderLanguageOptions();

  themeButtons.forEach((button) => {
    const label = copy.themeOptions[button.dataset.themeOption];
    button.textContent = themeSymbols[button.dataset.themeOption];
    button.setAttribute("aria-label", label);
    button.title = label;
  });
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

function formatGameDate(date) {
  return new Intl.DateTimeFormat(copy.dateLocale, {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function createServerChip(record, options = {}) {
  const chip = document.createElement(options.interactive ? "button" : "span");
  chip.className = `server-chip group-${record.group.toLowerCase()}`;
  chip.setAttribute("aria-label", copy.serverAria(record.number, record.group));

  const number = document.createElement("span");
  number.textContent = String(record.number);
  chip.append(number);

  if (options.interactive) {
    chip.type = "button";
    chip.dataset.server = String(record.number);
    chip.addEventListener("pointerdown", (event) => startRangeDrag(record.number, event));
    chip.addEventListener("click", (event) => handleServerChipClick(record.number, event));
  }

  return chip;
}

function renderToday() {
  const { minValue, maxValue } = currentRangeBounds();
  const todayServers = serverGroups[todayGroup].filter((number) => number >= minValue && number <= maxValue);

  todayCard.dataset.group = todayGroup;
  todayGroupBadge.textContent = todayGroup;
  todayDate.textContent = formatGameDate(gameDay.date);
  todayCycle.textContent = copy.targetGroup(todayGroup);
  todayCount.textContent = copy.serverCount(todayServers.length);
  todayServerList.innerHTML = "";

  todayServers.forEach((number) => {
    todayServerList.append(createServerChip({ number, group: todayGroup }));
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

function getCookieValue(name) {
  return (document.cookie || "")
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function saveRangePreference() {
  const value = encodeURIComponent(`${selectedRangeStart}-${selectedRangeEnd}`);
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${rangeCookieName}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

function initializeRangeSelection() {
  const savedRange = getCookieValue(rangeCookieName);

  if (!savedRange) {
    saveRangePreference();
    return;
  }

  let start;
  let end;

  try {
    [start, end] = decodeURIComponent(savedRange).split("-").map(Number);
  } catch (_error) {
    start = Number.NaN;
    end = Number.NaN;
  }

  const isValidRange = serverNumberSet.has(start) && serverNumberSet.has(end);

  if (!isValidRange) {
    selectedRangeStart = minServerNumber;
    selectedRangeEnd = maxServerNumber;
    saveRangePreference();
    return;
  }

  selectedRangeStart = start;
  selectedRangeEnd = end;
}

function currentRangeBounds() {
  return {
    minValue: Math.min(selectedRangeStart, selectedRangeEnd),
    maxValue: Math.max(selectedRangeStart, selectedRangeEnd),
  };
}

function renderServerRange() {
  const { minValue, maxValue } = currentRangeBounds();

  allServerList.innerHTML = "";
  serverRecords.forEach((record) => {
    const chip = createServerChip(record, { interactive: true });
    const inRange = record.number >= minValue && record.number <= maxValue;

    chip.classList.toggle("is-in-range", inRange);
    chip.classList.toggle("is-outside-range", !inRange);
    chip.classList.toggle("is-range-start", record.number === minValue);
    chip.classList.toggle("is-range-end", record.number === maxValue);
    chip.setAttribute("aria-pressed", String(inRange));

    allServerList.append(chip);
  });
}

function updateSelectedRange(startServer, endServer) {
  selectedRangeStart = startServer;
  selectedRangeEnd = endServer;
  saveRangePreference();
  renderToday();
  renderServerRange();
}

function handleServerChipClick(serverNumber, event) {
  if (suppressNextClick) {
    event.preventDefault();
    suppressNextClick = false;
    return;
  }

  selectRangeFromCard(serverNumber);
}

function selectRangeFromCard(serverNumber) {
  if (nextRangePick === "start") {
    selectedRangeStart = serverNumber;
    selectedRangeEnd = serverNumber;
    nextRangePick = "end";
  } else {
    selectedRangeEnd = serverNumber;
    nextRangePick = "start";
  }

  updateSelectedRange(selectedRangeStart, selectedRangeEnd);
}

function findDraggedServerNumber(event) {
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const chip = target?.closest?.("#all-server-list [data-server]");
  const serverNumber = Number(chip?.dataset.server);

  return serverNumberSet.has(serverNumber) ? serverNumber : null;
}

function startRangeDrag(serverNumber, event) {
  if (event.button !== 0) {
    return;
  }

  dragSelection.active = true;
  dragSelection.currentServer = serverNumber;
  dragSelection.moved = false;
  dragSelection.originX = event.clientX;
  dragSelection.originY = event.clientY;
  dragSelection.pointerId = event.pointerId;
  dragSelection.startServer = serverNumber;
  allServerList.classList.add("is-dragging");

  document.addEventListener("pointermove", updateRangeDrag);
  document.addEventListener("pointerup", finishRangeDrag);
  document.addEventListener("pointercancel", finishRangeDrag);
}

function updateRangeDrag(event) {
  if (!dragSelection.active || event.pointerId !== dragSelection.pointerId) {
    return;
  }

  const nextServer = findDraggedServerNumber(event);
  const dragDistance = Math.hypot(event.clientX - dragSelection.originX, event.clientY - dragSelection.originY);
  const hasDragIntent = nextServer !== null && (nextServer !== dragSelection.startServer || dragDistance > 6);

  if (!dragSelection.moved && !hasDragIntent) {
    return;
  }

  if (!dragSelection.moved) {
    dragSelection.moved = true;
    suppressNextClick = true;
  }

  event.preventDefault();

  if (nextServer !== null && nextServer !== dragSelection.currentServer) {
    dragSelection.currentServer = nextServer;
    updateSelectedRange(dragSelection.startServer, nextServer);
  }
}

function finishRangeDrag(event) {
  if (!dragSelection.active || event.pointerId !== dragSelection.pointerId) {
    return;
  }

  if (dragSelection.moved) {
    suppressNextClick = true;
    nextRangePick = "start";
    updateSelectedRange(dragSelection.startServer, dragSelection.currentServer);
    window.setTimeout(() => {
      suppressNextClick = false;
    }, 0);
  }

  dragSelection.active = false;
  dragSelection.currentServer = null;
  dragSelection.moved = false;
  dragSelection.pointerId = null;
  dragSelection.startServer = null;
  allServerList.classList.remove("is-dragging");

  document.removeEventListener("pointermove", updateRangeDrag);
  document.removeEventListener("pointerup", finishRangeDrag);
  document.removeEventListener("pointercancel", finishRangeDrag);
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => saveThemePreference(button.dataset.themeOption));
});
languageSelect.addEventListener("change", () => saveLocalePreference(languageSelect.value));
themeMedia.addEventListener("change", () => {
  if (storedThemePreference() === "system") {
    applyThemePreference("system");
  }
});

applyLocale();
applyThemePreference(storedThemePreference());
initializeRangeSelection();
renderToday();
renderServerRange();

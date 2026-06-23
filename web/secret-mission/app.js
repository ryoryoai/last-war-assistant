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

const todayCard = document.querySelector("#today-card");
const todayGroupBadge = document.querySelector("#today-group-badge");
const todayDate = document.querySelector("#today-date");
const todayCycle = document.querySelector("#today-cycle");
const todayCount = document.querySelector("#today-count");
const todayServerList = document.querySelector("#today-server-list");
const themeButtons = document.querySelectorAll("[data-theme-option]");
const allServerList = document.querySelector("#all-server-list");

const serverRecords = buildServerRecords();
const anchorSerial = serialFromDateString(rotationAnchor.date);
const gameDay = getJstGameDay();
const todayGroup = getGroupForSerial(gameDay.serial);
let nextRangePick = "start";
let selectedRangeStart = null;
let selectedRangeEnd = null;
const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");

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

  const gameDate = new Date(serial * dayInMilliseconds);
  const label = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(gameDate);

  return { label, serial };
}

function getGroupForSerial(serial) {
  const anchorIndex = groupOrder.indexOf(rotationAnchor.group);
  const offset = positiveModulo(serial - anchorSerial, groupOrder.length);
  return groupOrder[positiveModulo(anchorIndex + offset, groupOrder.length)];
}

function createServerChip(record, options = {}) {
  const chip = document.createElement(options.interactive ? "button" : "span");
  chip.className = `server-chip group-${record.group.toLowerCase()}`;
  chip.setAttribute("aria-label", `サーバー ${record.number} グループ ${record.group}`);

  const number = document.createElement("span");
  number.textContent = String(record.number);
  chip.append(number);

  if (options.interactive) {
    chip.type = "button";
    chip.dataset.server = String(record.number);
    chip.addEventListener("click", () => selectRangeFromCard(record.number));
  }

  return chip;
}

function renderToday() {
  todayCard.dataset.group = todayGroup;
  todayGroupBadge.textContent = todayGroup;
  todayDate.textContent = gameDay.label;
  todayCycle.textContent = `対象グループ ${todayGroup}`;
  todayCount.textContent = `${serverGroups[todayGroup].length}サーバー`;
  todayServerList.innerHTML = "";

  serverGroups[todayGroup].forEach((number) => {
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

function currentRangeBounds() {
  if (selectedRangeStart === null) {
    return { minValue: null, maxValue: null };
  }

  if (selectedRangeEnd === null) {
    return { minValue: selectedRangeStart, maxValue: selectedRangeStart };
  }

  return {
    minValue: Math.min(selectedRangeStart, selectedRangeEnd),
    maxValue: Math.max(selectedRangeStart, selectedRangeEnd),
  };
}

function renderServerRange() {
  const { minValue, maxValue } = currentRangeBounds();
  const hasSelection = minValue !== null && maxValue !== null;

  allServerList.innerHTML = "";
  serverRecords.forEach((record) => {
    const chip = createServerChip(record, { interactive: true });
    const inRange = hasSelection && record.number >= minValue && record.number <= maxValue;

    chip.classList.toggle("is-in-range", inRange);
    chip.classList.toggle("is-outside-range", hasSelection && !inRange);
    chip.classList.toggle("is-range-start", hasSelection && record.number === minValue);
    chip.classList.toggle("is-range-end", hasSelection && record.number === maxValue);
    chip.setAttribute("aria-pressed", String(inRange));

    allServerList.append(chip);
  });
}

function selectRangeFromCard(serverNumber) {
  if (nextRangePick === "start") {
    selectedRangeStart = serverNumber;
    selectedRangeEnd = null;
    nextRangePick = "end";
  } else {
    selectedRangeEnd = serverNumber;
    nextRangePick = "start";
  }

  renderServerRange();
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => saveThemePreference(button.dataset.themeOption));
});
themeMedia.addEventListener("change", () => {
  if (storedThemePreference() === "system") {
    applyThemePreference("system");
  }
});

applyThemePreference(storedThemePreference());
renderToday();
renderServerRange();

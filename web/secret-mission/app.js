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
const serverNumberSet = new Set(serverRecords.map((record) => record.number));
const minServerNumber = serverRecords[0].number;
const maxServerNumber = serverRecords[serverRecords.length - 1].number;
const anchorSerial = serialFromDateString(rotationAnchor.date);
const gameDay = getJstGameDay();
const todayGroup = getGroupForSerial(gameDay.serial);
const rangeCookieName = "lastwar-secret-mission-range";
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
  todayDate.textContent = gameDay.label;
  todayCycle.textContent = `対象グループ ${todayGroup}`;
  todayCount.textContent = `${todayServers.length}サーバー`;
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
themeMedia.addEventListener("change", () => {
  if (storedThemePreference() === "system") {
    applyThemePreference("system");
  }
});

applyThemePreference(storedThemePreference());
initializeRangeSelection();
renderToday();
renderServerRange();

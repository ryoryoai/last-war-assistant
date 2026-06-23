const serverGroups = {
  A: [
    [69, 75, 81, 82, 85, 89, 90],
    [99, 100, 102, 110, 111, 112, 113],
    [122, 123, 124, 125, 134, 135, 145],
    [146, 147, 148, 155, 157, 158, 169],
    [170, 171, 172, 182, 183, 184, 185],
    [186, 187, 196, null, null, null, null],
  ],
  B: [
    [70, 71, 78, 83, 84, 85, 91],
    [92, 93, 101, 102, 103, 104, 105],
    [114, 115, 116, 117, 118, 126, 127],
    [128, 129, 136, 137, 140, 141, 148],
    [149, 151, 152, 160, 161, 162, 163],
    [164, 165, 173, 174, 175, 176, 178],
    [188, 189, 190, null, null, null, null],
  ],
  C: [
    [72, 73, 74, 79, 80, 86, 87],
    [94, 95, 96, 97, 106, 107, 108],
    [109, 119, 120, 121, 130, 131, 132],
    [138, 142, 143, 144, 150, 153, 154],
    [166, 167, 168, 179, 180, 181, 191],
    [192, 193, 194, null, null, null, null],
  ],
};

const groupOrder = ["A", "B", "C"];
const dayInMilliseconds = 24 * 60 * 60 * 1000;
const resetHourJst = 11;
const rotationAnchor = {
  date: "2026-06-23",
  group: "A",
};

const form = document.querySelector("#lookup-form");
const input = document.querySelector("#server-input");
const result = document.querySelector("#lookup-result");
const todayCard = document.querySelector("#today-card");
const todayGroupBadge = document.querySelector("#today-group-badge");
const todayDate = document.querySelector("#today-date");
const todayServerList = document.querySelector("#today-server-list");
const todayGroupControl = document.querySelector("#today-group-control");
const allServerList = document.querySelector("#all-server-list");
const minRange = document.querySelector("#server-min-range");
const maxRange = document.querySelector("#server-max-range");
const minOutput = document.querySelector("#server-min-output");
const maxOutput = document.querySelector("#server-max-output");
const rangeCount = document.querySelector("#range-count");
const groupsRoot = document.querySelector("#server-groups");
const clearButton = document.querySelector("#clear-button");

const serverRecords = buildServerRecords();
const minServerNumber = serverRecords[0].number;
const maxServerNumber = serverRecords[serverRecords.length - 1].number;
const gameDay = getJstGameDay();
const anchorSerial = serialFromDateString(rotationAnchor.date);

let activeServer = null;
let activeTodayGroup = getGroupForSerial(gameDay.serial);

function findServer(serverNumber) {
  return Object.entries(serverGroups).flatMap(([group, rows]) =>
    rows.flatMap((row, rowIndex) =>
      row
        .map((value, columnIndex) => ({ group, rowIndex, columnIndex, value }))
        .filter((entry) => entry.value === serverNumber),
    ),
  );
}

function buildServerRecords() {
  const recordsByNumber = new Map();

  Object.entries(serverGroups).forEach(([group, rows]) => {
    rows.flat().forEach((value) => {
      if (value === null) return;

      if (!recordsByNumber.has(value)) {
        recordsByNumber.set(value, { number: value, groups: [] });
      }

      const record = recordsByNumber.get(value);
      if (!record.groups.includes(group)) record.groups.push(group);
    });
  });

  return [...recordsByNumber.values()].sort((a, b) => a.number - b.number);
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
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(gameDate);

  return { label, serial };
}

function getGroupForSerial(serial) {
  const anchorIndex = groupOrder.indexOf(rotationAnchor.group);
  const offset = positiveModulo(serial - anchorSerial, groupOrder.length);
  return groupOrder[positiveModulo(anchorIndex + offset, groupOrder.length)];
}

function getGroupServers(group) {
  return serverGroups[group].flat().filter((value) => value !== null);
}

function getServerRecord(serverNumber) {
  return serverRecords.find((record) => record.number === serverNumber);
}

function createServerChip(record) {
  const button = document.createElement("button");
  const groupClass = record.groups.length === 1 ? `group-${record.groups[0].toLowerCase()}` : "multi";
  button.className = `server-chip ${groupClass}`;
  button.type = "button";
  button.dataset.server = String(record.number);
  button.dataset.groups = record.groups.join("/");
  button.setAttribute("aria-label", `サーバー ${record.number} グループ ${record.groups.join("/")}`);

  const number = document.createElement("span");
  number.textContent = `#${record.number}`;
  button.append(number);

  record.groups.forEach((group) => {
    const badge = document.createElement("span");
    badge.className = "chip-group";
    badge.textContent = group;
    button.append(badge);
  });

  button.addEventListener("click", () => {
    input.value = String(record.number);
    lookupServer(input.value);
    input.focus();
  });

  return button;
}

function renderToday() {
  todayCard.dataset.group = activeTodayGroup;
  todayGroupBadge.textContent = activeTodayGroup;
  todayDate.textContent = `${gameDay.label} / グループ ${activeTodayGroup}`;
  todayServerList.innerHTML = "";

  todayGroupControl.querySelectorAll("button").forEach((button) => {
    const isActive = button.dataset.group === activeTodayGroup;
    button.setAttribute("aria-pressed", String(isActive));
  });

  getGroupServers(activeTodayGroup).forEach((serverNumber) => {
    todayServerList.append(createServerChip(getServerRecord(serverNumber)));
  });
}

function initializeRangeControls() {
  [minRange, maxRange].forEach((range) => {
    range.min = String(minServerNumber);
    range.max = String(maxServerNumber);
    range.step = "1";
  });

  minRange.value = String(minServerNumber);
  maxRange.value = String(maxServerNumber);
  renderFilteredServers();
}

function renderFilteredServers(changedRange = null) {
  let minValue = Number(minRange.value);
  let maxValue = Number(maxRange.value);

  if (minValue > maxValue) {
    if (changedRange === minRange) {
      maxValue = minValue;
      maxRange.value = String(maxValue);
    } else {
      minValue = maxValue;
      minRange.value = String(minValue);
    }
  }

  minOutput.textContent = `#${minValue}`;
  maxOutput.textContent = `#${maxValue}`;

  const visibleServers = serverRecords.filter((record) => record.number >= minValue && record.number <= maxValue);
  rangeCount.textContent = `${visibleServers.length}件 / #${minValue}-#${maxValue}`;
  allServerList.innerHTML = "";
  visibleServers.forEach((record) => allServerList.append(createServerChip(record)));
}

function renderGroups() {
  groupsRoot.innerHTML = "";

  Object.entries(serverGroups).forEach(([group, rows]) => {
    const section = document.createElement("article");
    section.className = "server-group";
    section.dataset.group = group;

    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = group;
    section.append(title);

    const grid = document.createElement("div");
    grid.className = "server-grid";

    rows.flat().forEach((value) => {
      const cell = document.createElement("span");
      cell.className = "server-cell";

      if (value === null) {
        cell.classList.add("empty");
        cell.setAttribute("aria-hidden", "true");
      } else {
        cell.classList.add(`group-${group.toLowerCase()}`);
        cell.textContent = String(value);
        cell.dataset.server = String(value);
        if (value === activeServer) cell.classList.add("match");
      }

      grid.append(cell);
    });

    section.append(grid);
    groupsRoot.append(section);
  });
}

function setResultEmpty() {
  result.dataset.state = "";
  result.innerHTML = `
    <span class="result-label">未入力</span>
    <strong>番号を入力</strong>
  `;
}

function lookupServer(rawValue) {
  const normalizedValue = rawValue.replace(/[^\d]/g, "");

  if (!normalizedValue) {
    activeServer = null;
    setResultEmpty();
    renderGroups();
    return;
  }

  const serverNumber = Number(normalizedValue);
  const matches = findServer(serverNumber);
  activeServer = serverNumber;

  if (matches.length === 0) {
    result.dataset.state = "missing";
    result.innerHTML = `
      <span class="result-label">#${serverNumber}</span>
      <strong>未登録</strong>
    `;
    renderGroups();
    return;
  }

  const groups = [...new Set(matches.map((match) => match.group))];
  result.dataset.state = groups.length > 1 ? "multi" : "found";
  result.innerHTML = `
    <span class="result-label">#${serverNumber}</span>
    <strong>${groups.join(" / ")}</strong>
  `;
  renderGroups();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  lookupServer(input.value);
});

input.addEventListener("input", () => {
  lookupServer(input.value);
});

clearButton.addEventListener("click", () => {
  input.value = "";
  input.focus();
  activeServer = null;
  setResultEmpty();
  renderGroups();
});

todayGroupControl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-group]");
  if (!button) return;

  activeTodayGroup = button.dataset.group;
  renderToday();
});

minRange.addEventListener("input", () => renderFilteredServers(minRange));
maxRange.addEventListener("input", () => renderFilteredServers(maxRange));

renderToday();
initializeRangeControls();
renderGroups();

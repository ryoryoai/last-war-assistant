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
const allServerList = document.querySelector("#all-server-list");
const minRange = document.querySelector("#server-min-range");
const maxRange = document.querySelector("#server-max-range");
const minOutput = document.querySelector("#server-min-output");
const maxOutput = document.querySelector("#server-max-output");
const rangeCount = document.querySelector("#range-count");

const serverRecords = buildServerRecords();
const minServerNumber = serverRecords[0].number;
const maxServerNumber = serverRecords[serverRecords.length - 1].number;
const anchorSerial = serialFromDateString(rotationAnchor.date);
const gameDay = getJstGameDay();
const todayGroup = getGroupForSerial(gameDay.serial);

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

function createServerChip(record) {
  const chip = document.createElement("span");
  chip.className = `server-chip group-${record.group.toLowerCase()}`;
  chip.textContent = `#${record.number}`;
  chip.setAttribute("aria-label", `サーバー ${record.number} グループ ${record.group}`);
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

  const visibleServers = serverRecords.filter((record) => record.number >= minValue && record.number <= maxValue);

  minOutput.textContent = `#${minValue}`;
  maxOutput.textContent = `#${maxValue}`;
  rangeCount.textContent = `${visibleServers.length}件`;
  allServerList.innerHTML = "";
  visibleServers.forEach((record) => allServerList.append(createServerChip(record)));
}

minRange.addEventListener("input", () => renderFilteredServers(minRange));
maxRange.addEventListener("input", () => renderFilteredServers(maxRange));

renderToday();
initializeRangeControls();

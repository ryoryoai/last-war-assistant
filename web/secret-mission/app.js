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

const form = document.querySelector("#lookup-form");
const input = document.querySelector("#server-input");
const result = document.querySelector("#lookup-result");
const groupsRoot = document.querySelector("#server-groups");
const clearButton = document.querySelector("#clear-button");

let activeServer = null;

function findServer(serverNumber) {
  return Object.entries(serverGroups).flatMap(([group, rows]) =>
    rows.flatMap((row, rowIndex) =>
      row
        .map((value, columnIndex) => ({ group, rowIndex, columnIndex, value }))
        .filter((entry) => entry.value === serverNumber),
    ),
  );
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

renderGroups();

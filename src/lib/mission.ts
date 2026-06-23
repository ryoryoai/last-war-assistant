export type MissionGroup = "A" | "B" | "C";

export type ServerRecord = {
  closed: boolean;
  group: MissionGroup | null;
  number: number;
};

export const serverGroups: Record<MissionGroup, number[]> = {
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

export const groupOrder: MissionGroup[] = ["A", "B", "C"];
export const hourInMilliseconds = 60 * 60 * 1000;
export const dayInMilliseconds = 24 * hourInMilliseconds;
export const serverUtcOffsetHours = -2;

const rotationAnchor = {
  date: "2026-06-23",
  group: "A" as MissionGroup,
};

export const serverRecords = Object.entries(serverGroups)
  .flatMap(([group, servers]) =>
    servers.map((number) => ({
      closed: false,
      group: group as MissionGroup,
      number,
    })),
  )
  .sort((a, b) => a.number - b.number);

export const serverGroupByNumber = new Map(
  serverRecords.map((record) => [record.number, record.group] as const),
);

export const minServerNumber = serverRecords[0].number;
export const maxServerNumber = serverRecords[serverRecords.length - 1].number;

export const allServerRecords: ServerRecord[] = Array.from(
  { length: maxServerNumber - minServerNumber + 1 },
  (_, index) => {
    const number = minServerNumber + index;
    const group = serverGroupByNumber.get(number) ?? null;

    return {
      closed: group === null,
      group,
      number,
    };
  },
);

const anchorSerial = serialFromDateString(rotationAnchor.date);

export function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function serialFromDateString(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / dayInMilliseconds;
}

export function toServerDate(date: Date) {
  return new Date(date.getTime() + serverUtcOffsetHours * hourInMilliseconds);
}

export function serialToDate(serial: number) {
  return new Date(serial * dayInMilliseconds);
}

export function serialToLocalCalendarDate(serial: number) {
  const date = serialToDate(serial);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function localCalendarDateToSerial(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / dayInMilliseconds;
}

export function serialToServerResetDate(serial: number) {
  return new Date(serial * dayInMilliseconds - serverUtcOffsetHours * hourInMilliseconds);
}

export function getServerMissionDay(now = new Date()) {
  const serverNow = toServerDate(now);
  const serial =
    Date.UTC(serverNow.getUTCFullYear(), serverNow.getUTCMonth(), serverNow.getUTCDate()) /
    dayInMilliseconds;

  return {
    date: serialToDate(serial),
    nextResetDate: serialToServerResetDate(serial + 1),
    serial,
  };
}

export function getServerMonthRange(serial: number) {
  const date = serialToDate(serial);
  const firstSerial = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1) / dayInMilliseconds;
  const nextMonthSerial =
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) / dayInMilliseconds;

  return { firstSerial, nextMonthSerial };
}

export function getGroupForSerial(serial: number): MissionGroup {
  const anchorIndex = groupOrder.indexOf(rotationAnchor.group);
  const offset = positiveModulo(serial - anchorSerial, groupOrder.length);
  return groupOrder[positiveModulo(anchorIndex + offset, groupOrder.length)];
}

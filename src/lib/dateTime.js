const LOCAL_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const pad = (value) => String(value).padStart(2, "0");
const padYear = (value) => String(value).padStart(4, "0");

export function utcIsoToLocalInput(utcIso) {
  if (!utcIso) return "";
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) return "";
  return `${padYear(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function hasMalformedUtcYear(utcIso) {
  const match = /^(\d{4})-/.exec(utcIso || "");
  return Boolean(match && Number(match[1]) < 1000);
}

export function localInputToUtcIso(localInput) {
  const match = LOCAL_INPUT_PATTERN.exec(localInput || "");
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day ||
    date.getHours() !== hour || date.getMinutes() !== minute
  ) return null;
  return date.toISOString();
}

export function addDaysToLocalInput(localInput, days) {
  const utcIso = localInputToUtcIso(localInput);
  if (!utcIso) return "";
  const date = new Date(utcIso);
  date.setDate(date.getDate() + days);
  return utcIsoToLocalInput(date.toISOString());
}

export function addCalendarMonthsToLocalInput(localInput, months) {
  const utcIso = localInputToUtcIso(localInput);
  if (!utcIso) return "";
  const start = new Date(utcIso);
  const targetMonth = start.getMonth() + months;
  const lastDay = new Date(start.getFullYear(), targetMonth + 1, 0).getDate();
  const date = new Date(start.getFullYear(), targetMonth, Math.min(start.getDate(), lastDay), start.getHours(), start.getMinutes(), 0, 0);
  return utcIsoToLocalInput(date.toISOString());
}

export function inferScheduleDuration(startUtcIso, endUtcIso) {
  const start = utcIsoToLocalInput(startUtcIso);
  const end = utcIsoToLocalInput(endUtcIso);
  if (!start || !end) return "custom";
  if (addDaysToLocalInput(start, 7) === end) return "week";
  if (addCalendarMonthsToLocalInput(start, 1) === end) return "month";
  return "custom";
}

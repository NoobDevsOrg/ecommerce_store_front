const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const localIsoDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

export const isIsoDate = (value) => {
  if (!ISO_DATE.test(String(value || ""))) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export const expectedDeliveryMinimum = ({ today = localIsoDate(), dispatchedAt } = {}) => {
  const dispatchedDate = dispatchedAt ? localIsoDate(dispatchedAt) : "";
  return dispatchedDate && dispatchedDate > today ? dispatchedDate : today;
};

export const validateExpectedDeliveryDate = ({ expectedDeliveryDate, today = localIsoDate(), dispatchedAt } = {}) => {
  if (!expectedDeliveryDate) return "";
  if (!isIsoDate(expectedDeliveryDate)) return "Enter the expected delivery date as YYYY-MM-DD.";
  if (expectedDeliveryDate < today) return "Expected delivery cannot be before today.";
  const dispatchedDate = dispatchedAt ? localIsoDate(dispatchedAt) : "";
  if (dispatchedDate && expectedDeliveryDate < dispatchedDate) return "Expected delivery cannot be before the dispatch date.";
  return "";
};

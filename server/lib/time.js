// Time and date helpers shared by the routes.
// Generated with Claude (Anthropic). Prompt: "write helpers to convert HH:MM times
// to minutes and get the weekday key from a YYYY-MM-DD date".

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// "09:30" -> 570
export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// 570 -> "09:30"
export function toHHMM(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// "2026-10-10" -> "sat". Parsed as local time so the day never shifts.
export function dayKey(dateStr) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return DAY_KEYS[new Date(y, mo - 1, d).getDay()];
}

export function isWeekendKey(key) {
  return key === 'sat' || key === 'sun';
}

// Local date as "YYYY-MM-DD"
export function todayStr(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isValidDateStr(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// Whole days between today and dateStr (negative = past)
export function daysFromToday(dateStr, now = new Date()) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

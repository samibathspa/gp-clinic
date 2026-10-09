// Formatting helpers for prices, dates and doctor details.

export const formatPrice = (pounds) => `£${pounds}`;

// "2026-10-10" -> Date (local time, avoids timezone shifts)
export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// "Sat 10 Oct"
export const formatShortDate = (dateStr) =>
  parseDate(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

// "Saturday 10 October 2026"
export const formatLongDate = (dateStr) =>
  parseDate(dateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

// "Dr Aisha Khan" -> "AK"
export const initials = (name) =>
  name.replace(/^Dr\.?\s+/, '').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export const worksWeekends = (gp) => Boolean(gp.schedule.sat || gp.schedule.sun);

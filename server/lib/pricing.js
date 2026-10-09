// Pricing rules: the price depends on WHEN the appointment is.
// Prompt: "write a pricing function where weekday
// standard hours are base price, weekday out-of-hours costs more, weekends cost most".
// Prices are always calculated on the server so users can't change them in the browser.
import { toMinutes, dayKey, isWeekendKey } from './time.js';

// Standard (sociable) hours on weekdays: 08:00 to 18:00
export const STANDARD_START = '08:00';
export const STANDARD_END = '18:00';

export const BANDS = {
  standard: { label: 'Weekday', multiplier: 1, description: 'Mon–Fri, 08:00–18:00' },
  outOfHours: { label: 'Out of hours', multiplier: 1.25, description: 'Mon–Fri, before 08:00 or after 18:00' },
  weekend: { label: 'Weekend', multiplier: 1.4, description: 'Saturday and Sunday, any time' },
};

// Work out which price band an appointment falls into
export function getBand(dateStr, time, durationMins) {
  if (isWeekendKey(dayKey(dateStr))) return 'weekend';
  const start = toMinutes(time);
  const end = start + durationMins;
  if (start < toMinutes(STANDARD_START) || end > toMinutes(STANDARD_END)) return 'outOfHours';
  return 'standard';
}

// Final price in whole pounds
export function calculatePrice(appointmentType, dateStr, time) {
  const band = getBand(dateStr, time, appointmentType.durationMins);
  const price = Math.round(appointmentType.basePrice * BANDS[band].multiplier);
  return { band, bandLabel: BANDS[band].label, price };
}

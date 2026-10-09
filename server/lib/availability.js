// Works out which appointment slots are free.
// Prompt: "generate free time slots from each doctor's
// working hours, removing booked and past slots, supporting 'any doctor' and gender filters".
import { toMinutes, toHHMM, dayKey } from './time.js';
import { calculatePrice } from './pricing.js';

export const SLOT_STEP_MINS = 15; // a new slot can start every 15 minutes

// All possible start times inside working hours that fit the appointment length
export function generateSlots(hours, durationMins, step = SLOT_STEP_MINS) {
  if (!hours) return [];
  const start = toMinutes(hours[0]);
  const end = toMinutes(hours[1]);
  const slots = [];
  for (let t = start; t + durationMins <= end; t += step) slots.push(toHHMM(t));
  return slots;
}

// Two time ranges overlap if each starts before the other ends
export function overlaps(startA, durA, startB, durB) {
  const a = toMinutes(startA);
  const b = toMinutes(startB);
  return a < b + durB && b < a + durA;
}

// Free slots for ONE doctor on ONE date
export function freeSlotsForGp(gp, dateStr, durationMins, bookings, now = new Date()) {
  const hours = gp.schedule[dayKey(dateStr)];
  const taken = bookings.filter(
    (b) => b.gpId === gp.id && b.date === dateStr && b.status === 'confirmed'
  );
  const isToday = dateStr === localDate(now);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  return generateSlots(hours, durationMins).filter((time) => {
    if (isToday && toMinutes(time) <= nowMins) return false; // already passed
    return !taken.some((b) => overlaps(time, durationMins, b.time, b.durationMins));
  });
}

// Free slots across doctors. gpId = 'any' merges doctors: each time shows the first free GP.
export function getAvailability({ gps, bookings, type, dateStr, gpId = 'any', gender = 'any', now }) {
  let candidates = gps;
  if (gpId !== 'any') candidates = candidates.filter((gp) => gp.id === gpId);
  if (gender !== 'any') candidates = candidates.filter((gp) => gp.gender === gender);

  const byTime = new Map();
  for (const gp of candidates) {
    for (const time of freeSlotsForGp(gp, dateStr, type.durationMins, bookings, now)) {
      if (!byTime.has(time)) byTime.set(time, { time, gpId: gp.id, gpName: gp.name });
    }
  }

  return [...byTime.values()]
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
    .map((slot) => ({ ...slot, ...calculatePrice(type, dateStr, slot.time) }));
}

function localDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

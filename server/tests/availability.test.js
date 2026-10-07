// Unit tests for slot generation and double-booking prevention (run with: npm test).
// Generated with Claude (Anthropic). Prompt: "node:test tests for free slot logic".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSlots, overlaps, freeSlotsForGp, getAvailability } from '../lib/availability.js';

const past = new Date(2026, 0, 1); // a date before the test dates, so no slot counts as "passed"
const gpA = { id: 'a', name: 'Dr A', gender: 'female', schedule: { wed: ['09:00', '10:00'] } };
const gpB = { id: 'b', name: 'Dr B', gender: 'male', schedule: { wed: ['09:00', '10:00'] } };
const WED = '2026-10-07';

test('slots fit inside working hours', () => {
  assert.deepEqual(generateSlots(['09:00', '10:00'], 30), ['09:00', '09:15', '09:30']);
});

test('day off gives no slots', () => {
  assert.deepEqual(generateSlots(null, 15), []);
});

test('overlapping appointments are detected', () => {
  assert.equal(overlaps('09:00', 30, '09:15', 15), true);
  assert.equal(overlaps('09:00', 15, '09:15', 15), false);
});

test('a booked slot cannot be booked again', () => {
  const bookings = [{ gpId: 'a', date: WED, time: '09:00', durationMins: 15, status: 'confirmed' }];
  const free = freeSlotsForGp(gpA, WED, 15, bookings, past);
  assert.equal(free.includes('09:00'), false);
  assert.equal(free.includes('09:15'), true);
});

test('cancelled bookings free the slot', () => {
  const bookings = [{ gpId: 'a', date: WED, time: '09:00', durationMins: 15, status: 'cancelled' }];
  assert.equal(freeSlotsForGp(gpA, WED, 15, bookings, past).includes('09:00'), true);
});

test('"any doctor" falls back to another GP when one is booked', () => {
  const bookings = [{ gpId: 'a', date: WED, time: '09:00', durationMins: 15, status: 'confirmed' }];
  const type = { durationMins: 15, basePrice: 70 };
  const slots = getAvailability({ gps: [gpA, gpB], bookings, type, dateStr: WED, now: past });
  assert.equal(slots.find((s) => s.time === '09:00').gpId, 'b');
});

test('gender filter only returns matching doctors', () => {
  const type = { durationMins: 15, basePrice: 70 };
  const slots = getAvailability({ gps: [gpA, gpB], bookings: [], type, dateStr: WED, gender: 'male', now: past });
  assert.ok(slots.every((s) => s.gpId === 'b'));
});

// Routes that return free appointment slots.
// Generated with Claude (Anthropic). Prompt: "GET routes for free slots on a date and
// a count of free slots for each of the next 14 days".
import { Router } from 'express';
import { loadGps, loadAppointmentTypes, loadBookings } from '../lib/data.js';
import { getAvailability } from '../lib/availability.js';
import { isValidDateStr, daysFromToday, dayKey, isWeekendKey, todayStr } from '../lib/time.js';

const router = Router();
const MAX_DAYS_AHEAD = 28;

// Shared query checks. Returns { error } or the parsed values.
function parseQuery(query) {
  const type = loadAppointmentTypes().find((t) => t.id === query.type);
  if (!type) return { error: 'Unknown appointment type' };
  const gpId = query.gp || 'any';
  const gender = query.gender || 'any';
  if (!['any', 'female', 'male'].includes(gender)) return { error: 'Invalid gender' };
  return { type, gpId, gender };
}

// GET /api/availability?date=2026-10-10&type=standard&gp=any&gender=female
router.get('/', (req, res) => {
  const parsed = parseQuery(req.query);
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  const { date } = req.query;
  if (!isValidDateStr(date)) return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
  const ahead = daysFromToday(date);
  if (ahead < 0 || ahead > MAX_DAYS_AHEAD) {
    return res.status(400).json({ error: `Choose a date within the next ${MAX_DAYS_AHEAD} days` });
  }

  const slots = getAvailability({
    gps: loadGps(),
    bookings: loadBookings(),
    type: parsed.type,
    dateStr: date,
    gpId: parsed.gpId,
    gender: parsed.gender,
  });
  res.json({ date, isWeekend: isWeekendKey(dayKey(date)), slots });
});

// GET /api/availability/days?type=standard&gp=any&gender=any&days=14
// -> [{ date, isWeekend, freeSlots, fromPrice }] so the calendar can grey out full days
router.get('/days', (req, res) => {
  const parsed = parseQuery(req.query);
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  const count = Math.min(Number(req.query.days) || 14, MAX_DAYS_AHEAD);
  const gps = loadGps();
  const bookings = loadBookings();
  const start = new Date();
  const days = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const date = todayStr(d);
    const slots = getAvailability({ gps, bookings, type: parsed.type, dateStr: date, gpId: parsed.gpId, gender: parsed.gender });
    days.push({
      date,
      isWeekend: isWeekendKey(dayKey(date)),
      freeSlots: slots.length,
      fromPrice: slots.length ? Math.min(...slots.map((s) => s.price)) : null,
    });
  }
  res.json(days);
});

export default router;

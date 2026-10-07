// Routes for creating, viewing and cancelling bookings.
// Generated with Claude (Anthropic). Prompt: "POST route to create a booking that
// validates input, recalculates the price and rejects double bookings; GET and DELETE
// by reference number checked against the patient's email".
import { Router } from 'express';
import { randomBytes } from 'crypto';
import { loadGps, loadAppointmentTypes, loadBookings, saveBookings } from '../lib/data.js';
import { freeSlotsForGp } from '../lib/availability.js';
import { calculatePrice } from '../lib/pricing.js';
import { isValidDateStr, daysFromToday } from '../lib/time.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9 +()-]{7,20}$/;

// Short, readable reference such as "GP-7K2QXA"
function makeReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  return 'GP-' + [...bytes].map((b) => chars[b % chars.length]).join('');
}

// Check the request body. Returns an object of field -> message.
function validate(body) {
  const errors = {};
  const p = body.patient || {};
  if (!body.typeId) errors.typeId = 'Choose an appointment type';
  if (!body.gpId) errors.gpId = 'Choose a doctor';
  if (!isValidDateStr(body.date || '')) errors.date = 'Choose a valid date';
  if (!/^\d{2}:\d{2}$/.test(body.time || '')) errors.time = 'Choose a time';
  if (!p.name || p.name.trim().length < 2) errors.name = 'Enter your full name';
  if (!EMAIL_RE.test(p.email || '')) errors.email = 'Enter a valid email address';
  if (!PHONE_RE.test(p.phone || '')) errors.phone = 'Enter a valid phone number';
  if (body.notes && body.notes.length > 500) errors.notes = 'Keep notes under 500 characters';
  return errors;
}

// Hide nothing sensitive here, but keep the response shape consistent
const publicBooking = (b) => ({ ...b });

// POST /api/bookings -> create a booking
router.post('/', (req, res) => {
  const errors = validate(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check your details', fields: errors });

  const { typeId, gpId, date, time, patient, notes = '' } = req.body;
  const type = loadAppointmentTypes().find((t) => t.id === typeId);
  const gp = loadGps().find((g) => g.id === gpId);
  if (!type || !gp) return res.status(400).json({ error: 'Unknown appointment type or doctor' });
  if (daysFromToday(date) < 0) return res.status(400).json({ error: 'That date has passed' });

  // Re-check availability on the server: the slot may have been taken since the page loaded
  const bookings = loadBookings();
  const free = freeSlotsForGp(gp, date, type.durationMins, bookings);
  if (!free.includes(time)) {
    return res.status(409).json({ error: 'Sorry, that time has just been booked. Please choose another slot.' });
  }

  const { band, bandLabel, price } = calculatePrice(type, date, time);
  const booking = {
    reference: makeReference(),
    status: 'confirmed',
    typeId: type.id,
    typeName: type.name,
    durationMins: type.durationMins,
    gpId: gp.id,
    gpName: gp.name,
    date,
    time,
    band,
    bandLabel,
    price,
    patient: { name: patient.name.trim(), email: patient.email.trim().toLowerCase(), phone: patient.phone.trim() },
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  saveBookings(bookings);
  res.status(201).json(publicBooking(booking));
});

// Find a booking by reference + email (email acts as a simple security check)
function findBooking(reference, email) {
  const bookings = loadBookings();
  const index = bookings.findIndex(
    (b) => b.reference === String(reference).toUpperCase() &&
      b.patient.email === String(email || '').trim().toLowerCase()
  );
  return { bookings, index };
}

// GET /api/bookings/:reference?email=...
router.get('/:reference', (req, res) => {
  const { bookings, index } = findBooking(req.params.reference, req.query.email);
  if (index === -1) return res.status(404).json({ error: 'No booking found with that reference and email' });
  res.json(publicBooking(bookings[index]));
});

// DELETE /api/bookings/:reference  body: { email }
// Marks the booking cancelled so the slot becomes free again.
router.delete('/:reference', (req, res) => {
  const { bookings, index } = findBooking(req.params.reference, req.body?.email);
  if (index === -1) return res.status(404).json({ error: 'No booking found with that reference and email' });
  if (bookings[index].status === 'cancelled') return res.status(400).json({ error: 'This booking is already cancelled' });

  bookings[index].status = 'cancelled';
  bookings[index].cancelledAt = new Date().toISOString();
  saveBookings(bookings);
  res.json(publicBooking(bookings[index]));
});

export default router;

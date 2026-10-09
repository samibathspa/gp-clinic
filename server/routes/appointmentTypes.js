// Routes for appointment types and the pricing rules.
// Prompt: "GET routes returning appointment types
// and a price table for each pricing band".
import { Router } from 'express';
import { loadAppointmentTypes } from '../lib/data.js';
import { BANDS } from '../lib/pricing.js';

const router = Router();

// GET /api/appointment-types
router.get('/appointment-types', (req, res) => {
  res.json(loadAppointmentTypes());
});

// GET /api/pricing -> bands plus the price of every type in every band
router.get('/pricing', (req, res) => {
  const types = loadAppointmentTypes();
  const bands = Object.entries(BANDS).map(([id, band]) => ({ id, ...band }));
  const table = types.map((type) => ({
    typeId: type.id,
    name: type.name,
    durationMins: type.durationMins,
    prices: Object.fromEntries(
      bands.map((b) => [b.id, Math.round(type.basePrice * b.multiplier)])
    ),
  }));
  res.json({ bands, table });
});

export default router;

// Routes for GP (doctor) data.
// Generated with Claude (Anthropic). Prompt: "GET route for doctors with optional
// gender and weekday/weekend query filters".
import { Router } from 'express';
import { loadGps } from '../lib/data.js';

const router = Router();
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
const WEEKEND = ['sat', 'sun'];

// GET /api/gps?gender=female|male&day=weekday|weekend
router.get('/', (req, res) => {
  let gps = loadGps();
  const { gender, day } = req.query;

  if (gender && gender !== 'any') {
    gps = gps.filter((gp) => gp.gender === gender);
  }
  if (day === 'weekday') {
    gps = gps.filter((gp) => WEEKDAYS.some((d) => gp.schedule[d]));
  } else if (day === 'weekend') {
    gps = gps.filter((gp) => WEEKEND.some((d) => gp.schedule[d]));
  }

  res.json(gps);
});

// GET /api/gps/:id -> one doctor
router.get('/:id', (req, res) => {
  const gp = loadGps().find((g) => g.id === req.params.id);
  if (!gp) return res.status(404).json({ error: 'Doctor not found' });
  res.json(gp);
});

export default router;

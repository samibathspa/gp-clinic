// Routes for GP (doctor) data.
// Scaffold generated with Claude (Anthropic) as an example route pattern.
import { Router } from 'express';
import { readFile } from 'fs/promises';

const router = Router();
const dataUrl = new URL('../data/gps.json', import.meta.url);

// GET /api/gps -> list all GPs
// TODO (you): support ?gender=female|male and ?day=weekday|weekend filters
router.get('/', async (req, res) => {
  const gps = JSON.parse(await readFile(dataUrl, 'utf8'));
  res.json(gps);
});

export default router;

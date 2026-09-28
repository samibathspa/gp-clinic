// Entry point for the GP clinic API (Express).
// Scaffold generated with Claude (Anthropic), prompt: "set up an Express server skeleton for my GP booking app".
import express from 'express';
import cors from 'cors';
import gpsRouter from './routes/gps.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check so the client can confirm the API is running
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/gps', gpsRouter);

// TODO (you): add routes for appointment types, availability, pricing and bookings

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

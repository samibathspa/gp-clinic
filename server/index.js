// Entry point for the GP clinic API (Express).
// Generated with Claude (Anthropic). Prompt: "Express server for a GP booking app with
// routes for doctors, appointment types, pricing, availability and bookings".
import express from 'express';
import cors from 'cors';
import gpsRouter from './routes/gps.js';
import appointmentTypesRouter from './routes/appointmentTypes.js';
import availabilityRouter from './routes/availability.js';
import bookingsRouter from './routes/bookings.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check so the client can confirm the API is running
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/gps', gpsRouter);
app.use('/api', appointmentTypesRouter); // /api/appointment-types and /api/pricing
app.use('/api/availability', availabilityRouter);
app.use('/api/bookings', bookingsRouter);

// Unknown API route
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Last-resort error handler so the server never crashes on a bad request
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

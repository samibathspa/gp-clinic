# Riverside Private GP – Multi-Device Booking App

A single-page app for booking private GP appointments, built with **React (Vite)** and **Express**.
Web Dev II – Assessment 2.

## Features
- **Choose a male or female GP**, a specific doctor, or "first available"
- **Weekday, evening and weekend availability** shown per doctor and per day
- **Variable pricing**: weekday (08:00–18:00), out-of-hours (+25%) and weekend (+40%), calculated on the server
- **No double bookings**: the server re-checks every slot before saving, including overlapping appointment lengths
- **Manage booking**: look up by reference + email and cancel (the slot becomes free again)
- **Responsive, mobile-first design** with breakpoints at 720px and 1024px

## Run locally
Two terminals:
```bash
cd server && npm install && npm run dev     # API on http://localhost:3001
cd client && npm install && npm run dev     # App on http://localhost:5173
```
Run the server tests with `cd server && npm test`.

## API routes
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/gps?gender=female&day=weekend` | Doctors, with optional filters |
| GET | `/api/appointment-types` | Appointment types, lengths and base prices |
| GET | `/api/pricing` | Price bands and full price table |
| GET | `/api/availability/days?type=standard&gp=any&gender=any` | Free slots per day for the next 14 days |
| GET | `/api/availability?date=YYYY-MM-DD&type=standard&gp=any&gender=any` | Free slots on one day |
| POST | `/api/bookings` | Create a booking (409 if the slot was taken) |
| GET | `/api/bookings/:reference?email=` | View a booking |
| DELETE | `/api/bookings/:reference` | Cancel a booking (body: `{ email }`) |

## Structure
```
client/src
  api.js            reusable fetch helpers (sendGETRequest / sendRequest)
  components/       Header, DoctorCard, ChoiceGroup, StepIndicator, BookingSummary...
  pages/            Home, Doctors, Book, ManageBooking
  index.css         mobile-first styles, media queries, grid-template-areas
server
  index.js          Express app
  routes/           gps, appointmentTypes, availability, bookings
  lib/              time, pricing, availability (slot logic), data (JSON files)
  data/             gps.json, appointment-types.json (bookings.json is created at runtime)
  tests/            node:test unit tests
```

## Notes
All doctors and data are fictional. Do not enter real personal or health information.

## Credits
Code generated with the help of Claude (Anthropic); each file states this in its header comment.
Font: Inter via @fontsource/inter.

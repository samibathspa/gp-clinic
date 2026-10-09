// Loads JSON data files and reads/writes bookings.
// Prompt: "store bookings in a JSON file and load
// doctors and appointment types from JSON".
// Synchronous file access is used on purpose: Node runs one request at a time, so
// read -> check -> write cannot be interrupted by another booking (prevents double booking).
import { readFileSync, writeFileSync, existsSync } from 'fs';

const dataPath = (file) => new URL(`../data/${file}`, import.meta.url);

export function loadGps() {
  return JSON.parse(readFileSync(dataPath('gps.json'), 'utf8'));
}

export function loadAppointmentTypes() {
  return JSON.parse(readFileSync(dataPath('appointment-types.json'), 'utf8'));
}

export function loadBookings() {
  const file = dataPath('bookings.json');
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function saveBookings(bookings) {
  writeFileSync(dataPath('bookings.json'), JSON.stringify(bookings, null, 2));
}

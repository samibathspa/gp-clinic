// Same UK phone rule as the server (server/lib/validate.js), for instant form feedback.
// Generated with Claude (Anthropic).
export function isValidUkPhone(phone) {
  if (typeof phone !== 'string' || !/^[0-9 +()-]+$/.test(phone.trim())) return false;
  const digits = phone.replace(/[\s()-]/g, '');
  return /^0\d{9,10}$/.test(digits) || /^\+44\d{9,10}$/.test(digits);
}

// Input validation helpers.
// Prompt: "validate UK phone numbers: 10-11 digits
// starting with 0, or +44 followed by 9-10 digits; allow spaces, brackets and dashes".

// "07700 900123", "01225 000000", "+44 7700 900123" -> true; "1234567" -> false
export function isValidUkPhone(phone) {
  if (typeof phone !== 'string' || !/^[0-9 +()-]+$/.test(phone.trim())) return false;
  const digits = phone.replace(/[\s()-]/g, '');
  return /^0\d{9,10}$/.test(digits) || /^\+44\d{9,10}$/.test(digits);
}

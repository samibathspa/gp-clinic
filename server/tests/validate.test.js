// Unit tests for phone validation (run with: npm test).
// Generated with Claude (Anthropic).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidUkPhone } from '../lib/validate.js';

test('accepts UK mobile and landline numbers', () => {
  assert.equal(isValidUkPhone('07700 900123'), true);
  assert.equal(isValidUkPhone('01225 000000'), true);
  assert.equal(isValidUkPhone('(01225) 000-000'), true);
  assert.equal(isValidUkPhone('+44 7700 900123'), true);
});

test('rejects numbers that are too short, too long or malformed', () => {
  assert.equal(isValidUkPhone('1234567'), false);
  assert.equal(isValidUkPhone('0770090012'.slice(0, 9)), false);
  assert.equal(isValidUkPhone('077009001234'), false);
  assert.equal(isValidUkPhone('7700900123'), false);
  assert.equal(isValidUkPhone('07700 9OO123'), false);
  assert.equal(isValidUkPhone(''), false);
});

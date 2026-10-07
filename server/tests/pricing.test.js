// Unit tests for pricing (run with: npm test).
// Generated with Claude (Anthropic). Prompt: "node:test tests for the pricing bands".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBand, calculatePrice } from '../lib/pricing.js';

const standard = { durationMins: 15, basePrice: 70 };

// 2026-10-07 is a Wednesday, 2026-10-10 is a Saturday
test('weekday daytime is the standard band', () => {
  assert.equal(getBand('2026-10-07', '10:00', 15), 'standard');
});

test('weekday before 08:00 is out of hours', () => {
  assert.equal(getBand('2026-10-07', '07:30', 15), 'outOfHours');
});

test('appointment running past 18:00 is out of hours', () => {
  assert.equal(getBand('2026-10-07', '17:45', 30), 'outOfHours');
});

test('saturday is the weekend band', () => {
  assert.equal(getBand('2026-10-10', '10:00', 15), 'weekend');
});

test('prices use the band multiplier', () => {
  assert.equal(calculatePrice(standard, '2026-10-07', '10:00').price, 70);
  assert.equal(calculatePrice(standard, '2026-10-07', '19:00').price, 88);
  assert.equal(calculatePrice(standard, '2026-10-10', '10:00').price, 98);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { hoursBetween } from '../src/journey.js';

test('calcula las horas transcurridas de una jornada', () => {
  const start = new Date('2026-09-08T09:00:00-03:00');
  const now = new Date('2026-09-08T11:30:00-03:00');
  assert.equal(hoursBetween(start, now), 2.5);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateDay } from '../src/finance.js';

test('calcula ganancia neta y progreso del objetivo', () => {
  const result = calculateDay({
    gross: 85000,
    fuel: 18000,
    maintenance: 4000,
    depreciation: 7500,
    other: 2000,
    target: 60000
  });

  assert.equal(result.totalCosts, 31500);
  assert.equal(result.net, 53500);
  assert.equal(result.remaining, 6500);
  assert.ok(Math.abs(result.progress - 89.16666666666667) < 1e-12);
});

test('no permite progreso negativo ni superior a 100%', () => {
  assert.equal(calculateDay({gross: 0, fuel: 0, maintenance: 0, depreciation: 0, other: 0, target: 60000}).progress, 0);
  assert.equal(calculateDay({gross: 100000, fuel: 0, maintenance: 0, depreciation: 0, other: 0, target: 60000}).progress, 100);
});

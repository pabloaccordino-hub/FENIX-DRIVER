import assert from 'node:assert/strict';
import test from 'node:test';
import { planObjective } from '../src/objective.js';

test('calcula cuánto falta y estima tiempo, facturación y kilómetros', () => {
  const result = planObjective({
    targetNet: 60000,
    currentNet: 30000,
    currentGross: 50000,
    currentHours: 4,
    currentKm: 100,
    costPerKm: 120
  });

  assert.equal(result.remainingNet, 30000);
  assert.equal(result.currentNetPerHour, 7500);
  assert.equal(result.estimatedHoursRemaining, 4);
  assert.ok(Math.abs(result.estimatedKmRemaining - 78.94736842105263) < 1e-12);
  assert.ok(Math.abs(result.estimatedGrossRemaining - 39473.68421052631) < 1e-12);
});

test('no estima tiempo ni kilómetros cuando todavía no hay ritmo', () => {
  const result = planObjective({targetNet: 60000, currentNet: 0, currentGross: 0, currentHours: 0, currentKm: 0, costPerKm: 120});
  assert.equal(result.remainingNet, 60000);
  assert.equal(result.estimatedHoursRemaining, null);
  assert.equal(result.estimatedKmRemaining, null);
  assert.equal(result.estimatedGrossRemaining, null);
});

test('objetivo alcanzado devuelve cero pendiente', () => {
  const result = planObjective({targetNet: 60000, currentNet: 65000, currentGross: 100000, currentHours: 5, currentKm: 150, costPerKm: 120});
  assert.equal(result.remainingNet, 0);
  assert.equal(result.estimatedHoursRemaining, 0);
  assert.equal(result.estimatedKmRemaining, 0);
  assert.equal(result.estimatedGrossRemaining, 0);
});

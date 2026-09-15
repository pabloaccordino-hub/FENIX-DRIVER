import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLiveJourney } from '../src/journey-intelligence.js';

test('marca RITMO BAJO cuando el rendimiento actual cae mucho frente al histórico', () => {
  const result = evaluateLiveJourney({ currentNet: 12000, hours: 2, historicalHourlyNet: 9000, targetNet: 60000, samples: 5 });
  assert.equal(result.status, 'RITMO BAJO');
  assert.equal(result.currentHourlyNet, 6000);
});

test('marca OBJETIVO ALCANZADO cuando el neto supera el objetivo', () => {
  const result = evaluateLiveJourney({ currentNet: 62000, hours: 6, historicalHourlyNet: 9000, targetNet: 60000, samples: 5 });
  assert.equal(result.status, 'OBJETIVO ALCANZADO');
  assert.equal(result.remainingNet, 0);
});

test('proyecta tiempo restante usando una referencia robusta entre ritmo actual e histórico', () => {
  const result = evaluateLiveJourney({ currentNet: 30000, hours: 4, historicalHourlyNet: 8000, targetNet: 60000, samples: 5 });
  assert.equal(result.status, 'EN MARCHA');
  assert.equal(result.remainingNet, 30000);
  assert.equal(result.projectedHoursRemaining, 3.75);
});

test('no emite una recomendación fuerte sin historial suficiente', () => {
  const result = evaluateLiveJourney({ currentNet: 5000, hours: 1, historicalHourlyNet: 0, targetNet: 60000, samples: 0 });
  assert.equal(result.status, 'APRENDIENDO');
  assert.equal(result.projectedHoursRemaining, null);
});

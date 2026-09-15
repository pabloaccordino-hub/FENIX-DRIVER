import test from 'node:test';
import assert from 'node:assert/strict';
import { decideNextAction } from '../src/decision.js';

test('recomienda SALÍ cuando hay evidencia de buen rendimiento y el objetivo aún no está cubierto', () => {
  const result = decideNextAction({
    targetNet: 60000,
    currentNet: 10000,
    active: false,
    historicalHourlyNet: 10000,
    radarRate: 11000,
    predictiveHours: 4,
    samples: 5,
  });
  assert.equal(result.action, 'SALÍ');
  assert.match(result.reason, /objetivo/i);
});

test('recomienda TERMINÁ cuando el objetivo neto ya fue alcanzado', () => {
  const result = decideNextAction({ targetNet: 60000, currentNet: 62000, active: true, historicalHourlyNet: 9000, radarRate: 9000, predictiveHours: 0, samples: 5 });
  assert.equal(result.action, 'TERMINÁ');
});

test('recomienda ESPERÁ cuando el rendimiento observado es muy bajo y hay evidencia suficiente', () => {
  const result = decideNextAction({ targetNet: 60000, currentNet: 10000, active: true, historicalHourlyNet: 10000, radarRate: 3500, currentHourlyNet: 3500, predictiveHours: 15, samples: 5 });
  assert.equal(result.action, 'ESPERÁ');
});

test('recomienda CAMBIÁ DE PLATAFORMA cuando existe una alternativa claramente superior', () => {
  const result = decideNextAction({
    targetNet: 60000,
    currentNet: 20000,
    active: true,
    historicalHourlyNet: 8000,
    radarRate: 8000,
    currentPlatform: 'Uber',
    bestPlatform: 'Cabify',
    currentPlatformHourlyNet: 6000,
    bestPlatformHourlyNet: 10500,
    predictiveHours: 5,
    samples: 6,
  });
  assert.equal(result.action, 'CAMBIÁ DE PLATAFORMA');
});

test('recomienda CONTINUÁ cuando la jornada activa rinde bien y no hay cambio claro de plataforma', () => {
  const result = decideNextAction({ targetNet: 60000, currentNet: 30000, active: true, historicalHourlyNet: 8000, radarRate: 9000, predictiveHours: 3.3, samples: 6 });
  assert.equal(result.action, 'CONTINUÁ');
});

test('no da una decisión tajante cuando no existe evidencia suficiente', () => {
  const result = decideNextAction({ targetNet: 60000, currentNet: 0, active: false, historicalHourlyNet: 0, radarRate: 0, predictiveHours: null, samples: 0 });
  assert.equal(result.action, 'APRENDIENDO');
});

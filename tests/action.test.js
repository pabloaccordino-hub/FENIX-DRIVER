import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendAction } from '../src/action.js';

test('objetivo alcanzado siempre produce TERMINÁ', () => {
  const result = recommendAction({
    targetNet: 60000,
    currentNet: 61000,
    active: true,
    score: 92,
    strategy: { action: 'CONTINUÁ', zone: 'Centro', platform: 'Cabify', startHour: 18, expectedHourlyNet: 10000 }
  });
  assert.equal(result.action, 'TERMINÁ');
  assert.equal(result.tone, 'fire');
});

test('jornada activa con ritmo bajo produce ESPERÁ y explica por qué', () => {
  const result = recommendAction({
    targetNet: 60000,
    currentNet: 20000,
    active: true,
    score: 38,
    live: { status: 'RITMO BAJO', currentHourlyNet: 4500 },
    strategy: { action: 'SALÍ', zone: 'Centro', platform: 'Uber', startHour: 18, expectedHourlyNet: 10000 }
  });
  assert.equal(result.action, 'ESPERÁ');
  assert.equal(result.tone, 'amber');
  assert.match(result.reason, /ritmo/i);
});

test('jornada activa puede recomendar cambiar de plataforma', () => {
  const result = recommendAction({
    targetNet: 60000,
    currentNet: 25000,
    active: true,
    score: 74,
    strategy: { action: 'CAMBIÁ DE PLATAFORMA', zone: 'Centro', platform: 'Cabify', startHour: 18, expectedHourlyNet: 11000 },
    currentPlatform: 'Uber'
  });
  assert.equal(result.action, 'CAMBIÁ DE PLATAFORMA');
  assert.equal(result.platform, 'Cabify');
});

test('jornada activa en buen ritmo produce CONTINUÁ con lo que falta', () => {
  const result = recommendAction({
    targetNet: 60000,
    currentNet: 30000,
    active: true,
    score: 82,
    live: { status: 'EN MARCHA', currentHourlyNet: 9000, projectedHoursRemaining: 3.33 },
    strategy: { action: 'CONTINUÁ', zone: 'Centro', platform: 'Cabify', startHour: 18, expectedHourlyNet: 9000 }
  });
  assert.equal(result.action, 'CONTINUÁ');
  assert.match(result.nextStep, /30\.000/);
});

test('jornada inactiva con score alto produce SALÍ con zona, plataforma y hora', () => {
  const result = recommendAction({
    targetNet: 60000,
    currentNet: 0,
    active: false,
    score: 86,
    strategy: { action: 'SALÍ', zone: 'Centro', platform: 'Cabify', startHour: 18, expectedHourlyNet: 10800, estimatedHours: 5.56, confidence: 'alta' }
  });
  assert.equal(result.action, 'SALÍ');
  assert.equal(result.zone, 'Centro');
  assert.equal(result.platform, 'Cabify');
  assert.equal(result.startHour, 18);
});

test('jornada inactiva con oportunidad débil produce ESPERÁ sin inventar una ventana', () => {
  const result = recommendAction({
    targetNet: 60000,
    currentNet: 0,
    active: false,
    score: 32,
    strategy: { action: 'APRENDIENDO', zone: null, platform: null, startHour: 10, confidence: 'baja' }
  });
  assert.equal(result.action, 'ESPERÁ');
  assert.equal(result.tone, 'amber');
  assert.equal(result.zone, null);
});

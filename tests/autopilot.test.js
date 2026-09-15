import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAutopilot } from '../src/autopilot.js';

test('starts quietly without an active journey', () => {
  const result = evaluateAutopilot({ active: false, action: 'SALÍ', previousAction: null });
  assert.equal(result.status, 'INACTIVO');
  assert.equal(result.changed, false);
  assert.equal(result.alert, false);
});

test('detects a meaningful action change during an active journey', () => {
  const result = evaluateAutopilot({
    active: true,
    action: 'CAMBIÁ DE PLATAFORMA',
    previousAction: 'CONTINUÁ',
    score: 52,
    liveStatus: 'RITMO BAJO'
  });
  assert.equal(result.status, 'ALERTA');
  assert.equal(result.changed, true);
  assert.equal(result.alert, true);
  assert.match(result.message, /CAMBIÁ DE PLATAFORMA/);
});

test('does not repeat the same alert on unchanged decisions', () => {
  const result = evaluateAutopilot({ active: true, action: 'CONTINUÁ', previousAction: 'CONTINUÁ', score: 74 });
  assert.equal(result.status, 'EN MARCHA');
  assert.equal(result.changed, false);
  assert.equal(result.alert, false);
});

test('prioritizes objective completion as a high-priority alert', () => {
  const result = evaluateAutopilot({ active: true, action: 'TERMINÁ', previousAction: 'CONTINUÁ', score: 88 });
  assert.equal(result.priority, 'alta');
  assert.equal(result.tone, 'fire');
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { getCopilotInsight } from '../src/copilot.js';

test('recomienda continuar cuando falta objetivo y el ritmo permite alcanzarlo pronto', () => {
  const result = getCopilotInsight({ net: 42300, target: 60000, hours: 3.2, historicalHourlyNet: 6800 });
  assert.equal(result.tone, 'positive');
  assert.match(result.title, /Vas bien/i);
  assert.match(result.message, /1 h 20 min/);
});

test('indica objetivo alcanzado cuando el neto supera la meta', () => {
  const result = getCopilotInsight({ net: 62000, target: 60000, hours: 6, historicalHourlyNet: 7000 });
  assert.equal(result.tone, 'success');
  assert.match(result.title, /Objetivo alcanzado/i);
});

test('advierte cuando el ritmo actual cae significativamente respecto del histórico', () => {
  const result = getCopilotInsight({ net: 20000, target: 60000, hours: 4, historicalHourlyNet: 8000 });
  assert.equal(result.tone, 'warning');
  assert.match(result.title, /rendimiento bajó/i);
});

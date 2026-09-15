import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFenixScore, scoreLabel } from '../src/fenix-score.js';

test('Fénix Score combina señales y limita el resultado entre 0 y 100', () => {
  const result = calculateFenixScore({
    historicalHourlyNet: 12000,
    expectedHourlyNet: 13500,
    currentHourlyNet: 13000,
    contextScore: 3,
    contextMaxScore: 4,
    platformAdvantage: 0.12,
    targetProgress: 0.4,
    vehicleCostPerKm: 35,
    benchmarkCostPerKm: 45,
    evidenceSamples: 8
  });
  assert.equal(result.score, 84);
  assert.equal(result.confidence, 'Alta');
  assert.equal(scoreLabel(result.score), 'OPORTUNIDAD FUERTE');
});

test('sin evidencia suficiente no presenta un score como recomendación confiable', () => {
  const result = calculateFenixScore({ evidenceSamples: 0 });
  assert.equal(result.score, null);
  assert.equal(result.confidence, 'Aprendiendo');
  assert.equal(scoreLabel(result.score), 'APRENDIENDO');
});

test('un contexto desfavorable reduce el score pero nunca lo lleva fuera de rango', () => {
  const result = calculateFenixScore({
    historicalHourlyNet: 5000,
    expectedHourlyNet: 4500,
    currentHourlyNet: 3000,
    contextScore: 0,
    contextMaxScore: 4,
    platformAdvantage: -0.2,
    targetProgress: 0,
    vehicleCostPerKm: 70,
    benchmarkCostPerKm: 40,
    evidenceSamples: 5
  });
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.score < 50);
  assert.equal(result.confidence, 'Media');
});

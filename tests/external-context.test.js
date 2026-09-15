import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeExternalContext, contextMessage } from '../src/external-context.js';

test('detecta una ventana pico de Uber en Mendoza para martes 18:00', () => {
  const r = analyzeExternalContext({ city:'Mendoza', platform:'Uber', weekday:2, hour:18 });
  assert.equal(r.peak, true);
  assert.ok(r.score > 0);
  assert.match(r.message, /pico/i);
});

test('marca contexto insuficiente si no hay señales aplicables', () => {
  const r = analyzeExternalContext({ city:'Otra', platform:'Otra', weekday:2, hour:13 });
  assert.equal(r.confidence, 'baja');
  assert.equal(r.peak, false);
});

test('combina señal de plataforma y costo de combustible configurado', () => {
  const r = analyzeExternalContext({ city:'Mendoza', platform:'Cabify', weekday:4, hour:19, fuelPrice:1600, baselineFuelPrice:1500 });
  assert.equal(r.platformSignal, 'corporativo');
  assert.equal(r.fuelPressure, 'alta');
  assert.ok(contextMessage(r).length > 20);
});

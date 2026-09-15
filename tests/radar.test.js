import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRadar, radarMessage } from '../src/radar.js';

test('encuentra la mejor ventana del día de semana', () => {
  const history = [
    { date: '2026-09-01', net: 30000, hours: 4, km: 100, startHour: 10 }, // martes
    { date: '2026-09-08', net: 52000, hours: 4, km: 100, startHour: 18 }, // martes
    { date: '2026-09-15', net: 48000, hours: 4, km: 100, startHour: 18 }, // martes
    { date: '2026-09-03', net: 20000, hours: 4, km: 100, startHour: 18 }, // jueves
  ];
  const radar = analyzeRadar(history, new Date('2026-09-22T12:00:00'));
  assert.equal(radar.weekday, 'martes');
  assert.equal(radar.bestStartHour, 18);
  assert.equal(Math.round(radar.bestHourlyNet), 12500);
  assert.equal(radar.samples, 2);
  assert.equal(radar.confidence, 'media');
});

test('prioriza una ventana con mejor rendimiento neto por hora y suficiente muestra', () => {
  const history = [
    { date: '2026-09-02', net: 20000, hours: 4, km: 80, startHour: 18 }, // miércoles
    { date: '2026-09-09', net: 24000, hours: 4, km: 90, startHour: 18 },
    { date: '2026-09-16', net: 22000, hours: 4, km: 90, startHour: 18 },
    { date: '2026-09-23', net: 16000, hours: 4, km: 80, startHour: 10 },
  ];
  const radar = analyzeRadar(history, new Date('2026-09-30T12:00:00'));
  assert.equal(radar.bestStartHour, 18);
  assert.equal(radar.confidence, 'media');
});

test('devuelve aprendizaje insuficiente cuando no hay datos del día', () => {
  const radar = analyzeRadar([{ date: '2026-09-01', net: 30000, hours: 4, startHour: 18 }], new Date('2026-09-07T12:00:00'));
  assert.equal(radar.bestStartHour, null);
  assert.equal(radar.confidence, 'baja');
  assert.match(radarMessage(radar), /datos/i);
});

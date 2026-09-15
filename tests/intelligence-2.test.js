import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendStrategy, strategyMessage } from '../src/intelligence-2.js';

const history = [
  { date:'2026-09-08', startHour:18, zone:'Centro', platform:'Cabify', net:12000, gross:18000, hours:2, km:70 },
  { date:'2026-09-15', startHour:18, zone:'Centro', platform:'Cabify', net:11000, gross:17000, hours:2, km:65 },
  { date:'2026-09-01', startHour:19, zone:'Centro', platform:'Cabify', net:10000, gross:16000, hours:2, km:60 },
  { date:'2026-09-08', startHour:18, zone:'Godoy Cruz', platform:'Uber', net:7000, gross:12000, hours:2, km:70 },
];

test('combina día, hora, zona y plataforma para elegir una estrategia', () => {
  const r = recommendStrategy({
    history,
    referenceDate: new Date('2026-09-15T18:00:00'),
    targetNet: 60000,
    currentNet: 20000,
    currentZone: 'Centro',
    currentPlatform: 'Cabify',
    vehicleCostPerKm: 10,
  });
  assert.equal(r.action, 'SALÍ');
  assert.equal(r.zone, 'Centro');
  assert.equal(r.platform, 'Cabify');
  assert.equal(r.startHour, 18);
  assert.ok(r.expectedHourlyNet > 0);
  assert.ok(r.confidence === 'media' || r.confidence === 'alta');
});

test('no recomienda cambiar de plataforma por una diferencia débil', () => {
  const r = recommendStrategy({
    history,
    referenceDate: new Date('2026-09-15T18:00:00'),
    targetNet: 60000,
    currentNet: 10000,
    currentZone: 'Centro',
    currentPlatform: 'Uber',
    vehicleCostPerKm: 10,
  });
  assert.notEqual(r.action, 'CAMBIÁ DE PLATAFORMA');
});

test('prioriza terminar cuando el objetivo ya está cubierto', () => {
  const r = recommendStrategy({ history, targetNet: 60000, currentNet: 60000 });
  assert.equal(r.action, 'TERMINÁ');
});

test('explica cuando todavía no hay evidencia suficiente', () => {
  const r = recommendStrategy({ history: [], targetNet: 60000, currentNet: 0 });
  assert.equal(r.action, 'APRENDIENDO');
  assert.match(strategyMessage(r), /datos|evidencia/i);
});

test('integra la recomendación después de calcular el costo económico de la jornada', async () => {
  const fs = await import('node:fs/promises');
  const app = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
  assert.ok(app.indexOf('const economic=') < app.indexOf('const strategy=recommendStrategy('));
});

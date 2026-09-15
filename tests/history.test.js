import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeHistory, recommendWorkWindow, recordJourney, recommendPlatform } from '../src/history.js';

test('resume jornadas y calcula rendimiento neto por hora', () => {
  const history = [
    { date: '2026-09-01', platform: 'Uber', net: 42000, hours: 5, km: 120 },
    { date: '2026-09-02', platform: 'Cabify', net: 36000, hours: 4, km: 100 },
  ];
  const summary = summarizeHistory(history);
  assert.equal(summary.journeys, 2);
  assert.equal(summary.totalNet, 78000);
  assert.equal(Math.round(summary.averageHourlyNet), 8667);
  assert.equal(Math.round(summary.averageKmPerHour * 100) / 100, 24.44);
});

test('recomienda una ventana según el mejor rendimiento histórico', () => {
  const history = [
    { date: '2026-09-01', platform: 'Uber', net: 50000, hours: 5, km: 100, startHour: 18 },
    { date: '2026-09-02', platform: 'Uber', net: 24000, hours: 4, km: 120, startHour: 10 },
    { date: '2026-09-03', platform: 'Cabify', net: 32000, hours: 4, km: 100, startHour: 18 },
  ];
  const rec = recommendWorkWindow(history);
  assert.equal(rec.bestStartHour, 18);
  assert.equal(Math.round(rec.bestHourlyNet), 9111);
  assert.equal(rec.confidence, 'media');
});

test('registra una jornada finalizada sin perder sus datos', () => {
  const history = [];
  const next = recordJourney(history, {
    date: '2026-09-08', platform: 'Uber', net: 30000, hours: 3, km: 75, startHour: 17
  });
  assert.equal(next.length, 1);
  assert.equal(next[0].net, 30000);
  assert.equal(next[0].platform, 'Uber');
});


test('detecta la plataforma con mejor rendimiento neto por hora', () => {
  const history = [
    { platform: 'Uber', net: 50000, hours: 5 },
    { platform: 'Uber', net: 45000, hours: 5 },
    { platform: 'Cabify', net: 50000, hours: 4 },
  ];
  const rec = recommendPlatform(history);
  assert.equal(rec.platform, 'Cabify');
  assert.equal(rec.hourlyNet, 12500);
});

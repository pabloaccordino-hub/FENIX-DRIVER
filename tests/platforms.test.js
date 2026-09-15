import test from 'node:test';
import assert from 'node:assert/strict';
import { PLATFORM_NAMES, summarizePlatforms, platformMessage } from '../src/platforms.js';

test('resume una jornada mezclando varias plataformas sin perder el total', () => {
  const rows = [
    { platform: 'Uber', net: 20000, gross: 30000, hours: 2, km: 40 },
    { platform: 'Cabify', net: 18000, gross: 26000, hours: 1.5, km: 25 },
    { platform: 'Uber', net: 12000, gross: 18000, hours: 1, km: 20 },
  ];
  const result = summarizePlatforms(rows);
  assert.equal(result.total.net, 50000);
  assert.equal(result.total.gross, 74000);
  assert.equal(result.total.hours, 4.5);
  assert.equal(result.total.km, 85);
  assert.equal(result.platforms.Uber.net, 32000);
  assert.equal(result.platforms.Cabify.net, 18000);
});

test('calcula rendimiento por hora y plataforma ganadora', () => {
  const result = summarizePlatforms([
    { platform: 'Uber', net: 20000, hours: 2, km: 40 },
    { platform: 'Cabify', net: 24000, hours: 1.5, km: 20 },
    { platform: 'DiDi', net: 9000, hours: 1.5, km: 30 },
  ]);
  assert.equal(Math.round(result.platforms.Cabify.hourlyNet), 16000);
  assert.equal(result.bestPlatform, 'Cabify');
});

test('usa plataforma válida por defecto y mensaje honesto sin viajes', () => {
  const result = summarizePlatforms([]);
  assert.deepEqual(Object.keys(result.platforms), PLATFORM_NAMES);
  assert.equal(result.bestPlatform, null);
  assert.match(platformMessage(result), /registrá viajes/i);
});

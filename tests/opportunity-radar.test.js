import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeOpportunityRadar, opportunityMessage } from '../src/opportunity-radar.js';

test('recomienda la zona con mejor rendimiento para el día y hora actuales', () => {
  const history = [
    { date:'2026-09-08', startHour:18, zone:'Centro', net:50000, hours:4, km:100 },
    { date:'2026-09-15', startHour:18, zone:'Centro', net:52000, hours:4, km:105 },
    { date:'2026-09-08', startHour:18, zone:'Maipú', net:32000, hours:4, km:100 },
    { date:'2026-09-15', startHour:18, zone:'Maipú', net:34000, hours:4, km:100 },
  ];
  const result = analyzeOpportunityRadar(history, { date:new Date('2026-09-22T18:00:00'), hour:18 });
  assert.equal(result.bestZone, 'Centro');
  assert.equal(Math.round(result.bestHourlyNet), 12750);
  assert.equal(result.samples, 2);
});

test('combina proximidad horaria cuando no existe una muestra exacta', () => {
  const history = [
    { date:'2026-09-01', startHour:17, zone:'Centro', net:45000, hours:4, km:90 },
    { date:'2026-09-08', startHour:17, zone:'Centro', net:44000, hours:4, km:90 },
  ];
  const result = analyzeOpportunityRadar(history, { date:new Date('2026-09-15T18:00:00'), hour:18 });
  assert.equal(result.bestZone, 'Centro');
  assert.equal(result.source, 'nearby-hour');
});

test('no inventa una oportunidad sin evidencia', () => {
  const result = analyzeOpportunityRadar([], { date:new Date('2026-09-15T18:00:00'), hour:18 });
  assert.equal(result.bestZone, null);
  assert.equal(result.confidence, 'baja');
  assert.match(opportunityMessage(result), /suficientes datos/i);
});

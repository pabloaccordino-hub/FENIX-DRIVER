import test from 'node:test';
import assert from 'node:assert/strict';
import { predictWorkday, predictiveMessage } from '../src/predictive.js';

const history = [
  { date:'2026-09-01', startHour:18, net:60000, gross:90000, hours:4, km:120 },
  { date:'2026-09-08', startHour:18, net:75000, gross:105000, hours:5, km:150 },
  { date:'2026-09-03', startHour:10, net:30000, gross:50000, hours:4, km:100 }
];

test('projects time, gross and km for the target using matching weekday history', () => {
  const result = predictWorkday({ history, targetNet: 60000, referenceDate: new Date('2026-09-08T12:00:00'), startHour:18 });
  assert.equal(result.source, 'weekday');
  assert.equal(result.ratePerHour, 15000);
  assert.equal(result.estimatedHours, 4);
  assert.equal(result.netPerKm, 500);
  assert.equal(result.estimatedKm, 120);
  assert.equal(Math.round(result.estimatedGross), 86667);
  assert.equal(result.confidence, 'media');
});

test('uses overall history when there is no matching weekday data', () => {
  const result = predictWorkday({ history, targetNet: 60000, referenceDate: new Date('2026-09-06T12:00:00'), startHour:18 });
  assert.equal(result.source, 'overall');
  assert.ok(result.ratePerHour > 0);
  assert.ok(result.estimatedHours > 0);
});

test('predicts zero remaining work when target is already reached', () => {
  const result = predictWorkday({ history, targetNet: 60000, currentNet: 65000, referenceDate: new Date('2026-09-08T12:00:00') });
  assert.equal(result.remainingNet, 0);
  assert.equal(result.estimatedHours, 0);
  assert.equal(result.estimatedGross, 0);
});

test('message is explicit when there is insufficient evidence', () => {
  const result = predictWorkday({ history: [], targetNet: 60000, referenceDate: new Date('2026-09-08T12:00:00') });
  assert.match(predictiveMessage(result), /suficientes datos/i);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('V2.9.1 hub cards have real internal navigation', () => {
  assert.match(html, /class="hub-card" data-screen="opportunity"/);
  assert.match(html, /class="hub-card" data-screen="vehicle"/);
  assert.match(js, /querySelectorAll\('\.hub-card\[data-screen\]'\)/);
  assert.match(js, /showScreen\(screen\)/);
});

test('V2.9.1 journey controls use one shared toggle action', () => {
  assert.match(html, /id="startBtn"/);
  assert.match(html, /id="journeyStartBtn"/);
  assert.match(js, /function fenixToggleJourney\(\)/);
  assert.match(js, /fenixStartBtn\.addEventListener\('click',fenixToggleJourney\)/);
  assert.match(js, /fenixJourneyBtn\.addEventListener\('click',fenixToggleJourney\)/);
});

test('V2.9.1 journey toggle persists and rerenders state', () => {
  assert.match(js, /state\.active=true/);
  assert.match(js, /state\.active=false/);
  assert.match(js, /save\(\)/);
  assert.match(js, /render\(\)/);
});

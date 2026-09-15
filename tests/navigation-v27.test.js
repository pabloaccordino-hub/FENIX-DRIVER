import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('V2.7 exposes exactly five primary navigation destinations', () => {
  const nav = html.match(/<nav class="bottom-nav">([\s\S]*?)<\/nav>/)?.[1] ?? '';
  const buttons = [...nav.matchAll(/<button class="nav[^>]*data-screen="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
  assert.equal(buttons.length, 5);
  assert.deepEqual(buttons.map(([, id]) => id), ['home', 'journey', 'radar', 'money', 'more']);
  assert.deepEqual(buttons.map(([, , content]) => content.replace(/<small>|<\/small>/g, '').trim()), ['⌂Inicio', '◷Jornada', '📡Radar', '$Dinero', '☰Más']);
});

test('V2.7 keeps advanced modules accessible through Radar and Más hubs', () => {
  assert.match(html, /<section id="radar" class="screen">/);
  assert.match(html, /data-screen="learn"/);
  assert.match(html, /data-screen="predict"/);
  assert.match(html, /data-screen="opportunity"/);
  assert.match(html, /data-screen="strategy"/);
  assert.match(html, /data-screen="context"/);
  assert.match(html, /<section id="more" class="screen">/);
  assert.match(html, /data-screen="vehicle"/);
  assert.match(html, /data-screen="stats"/);
  assert.match(html, /data-screen="score"/);
  assert.match(html, /data-screen="action"/);
  assert.match(html, /data-screen="autopilot"/);
});

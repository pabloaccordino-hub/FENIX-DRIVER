import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('V2.9.1 mobile entry modal isolates fixed controls while open', () => {
  assert.match(html, /class="driver-dock"/);
  assert.match(html, /class="bottom-nav"/);
  assert.match(html, /id="entryForm"/);
  assert.match(css, /body:has\(\.modal:not\(\.hidden\)\) \.driver-dock/);
  assert.match(css, /body:has\(\.modal:not\(\.hidden\)\) \.bottom-nav/);
});

test('V2.9.1 mobile entry modal is keyboard-safe and internally scrollable', () => {
  assert.match(css, /\.modal\s*\{[^}]*overflow-y:auto/);
  assert.match(css, /\.modal-card\s*\{[^}]*max-height:\s*min\(.*100dvh/);
  assert.match(css, /\.modal-card\s*\{[^}]*overflow-y:auto/);
  assert.match(css, /\.modal-card\s+form\s*\{[^}]*padding-bottom/);
  assert.match(css, /@media\(max-width:430px\)[\s\S]*\.modal-card/);
});

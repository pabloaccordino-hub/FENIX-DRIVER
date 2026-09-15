import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');

test('manifest is installable with app icons', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.short_name, 'Fénix Driver');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512'));
  for (const icon of manifest.icons) assert.ok(icon.src && icon.type);
});

test('service worker precaches the application modules for first offline launch', () => {
  const sw = read('sw.js');
  const required = [
    './index.html', './styles.css', './app.js', './manifest.webmanifest',
    './src/finance.js', './src/journey.js', './src/vehicle.js', './src/objective.js',
    './src/history.js', './src/radar.js', './src/predictive.js', './src/platforms.js',
    './src/decision.js', './src/journey-intelligence.js', './src/opportunity-radar.js',
    './src/intelligence-2.js', './src/external-context.js', './src/fenix-score.js',
    './src/action.js', './src/autopilot.js', './src/copilot.js'
  ];
  for (const asset of required) assert.match(sw, new RegExp(asset.replaceAll('.', '\\.'), 'g'));
});

test('mobile shell exposes safe-area and install metadata', () => {
  const html = read('index.html');
  const css = read('styles.css');
  assert.match(html, /name="theme-color"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /mobile-web-app-capable/);
  assert.match(html, /rel="apple-touch-icon"/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /touch-action:\s*manipulation/);
});

test('quick driver controls exist for one-hand use', () => {
  const html = read('index.html');
  assert.match(html, /class="driver-dock"/);
  assert.match(html, /id="dockTripBtn"/);
  assert.match(html, /id="dockExpenseBtn"/);
  assert.match(html, /id="dockActionBtn"/);
});

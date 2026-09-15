import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function homeMarkup() {
  return html.slice(
    html.indexOf('<section id="home"'),
    html.indexOf('<section id="journey"')
  );
}

test('V2.8 home uses a clear driver dashboard hierarchy', () => {
  const home = homeMarkup();

  assert.match(home, /class="home-header"/);
  assert.match(home, /class="net-card home-net-card"/);
  assert.match(home, /class="home-progress"/);
  assert.match(home, /class="recommendation-card tone-muted"/);
  assert.match(home, /id="homeAction"/);
  assert.match(home, /id="homeActionReason"/);
  assert.match(home, /id="homeActionNext"/);
  assert.match(home, /class="home-metrics"/);
});

test('V2.8 home keeps the journey controls prominent', () => {
  const home = homeMarkup();

  assert.match(
    home,
    /id="startBtn"[^>]*class="primary-btn home-start-btn"/
  );

  assert.match(
    home,
    /class="quick-actions home-quick-actions"/
  );
});

test('V2.8 render feeds the new recommendation card from the existing action engine', () => {
  assert.match(app, /#homeAction/);
  assert.match(app, /#homeActionReason/);
  assert.match(app, /#homeActionNext/);
  assert.match(app, /#homeAction[^;]*\.textContent=action\.action/);
});

test('V2.8 mobile design provides a compact dashboard and touch-safe controls', () => {
  assert.match(css, /\.home-header\{/);
  assert.match(css, /\.recommendation-card\{/);
  assert.match(css, /\.home-metrics\{/);
  assert.match(css, /\.home-start-btn\{/);
  assert.match(css, /@media\(max-width:430px\)/);
});

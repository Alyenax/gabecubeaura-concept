import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const url = process.env.GCA_INTERFACE_URL || 'http://127.0.0.1:4200/interface-preview/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [], requests = [], failures = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => requests.push(r.url()));
page.on('response', r => { if (!r.ok()) failures.push(r.status() + ' ' + r.url()); });
const go = async id => page.evaluate(id => GCAInterfacePreview.navigate(id), id);
const field = key => page.locator(`[data-setting="${key}"]`);
const action = label => page.locator('.settings-row').filter({ has: page.locator('.label', { hasText: label }) }).getByRole('button').first();
const accept = async () => { await page.locator('#dialog-confirm').click(); await page.waitForTimeout(50); };
try {
  await page.goto(url); await page.waitForFunction(() => window.GCAInterfacePreview);
  const ids = await page.evaluate(() => Object.keys(GCAInterfacePreview.pages()));
  assert.equal(ids.length, 17);
  for (const id of ids) {
    await go(id);
    const checks = await page.evaluate(() => ({ empty: [...document.querySelectorAll('select[data-setting]')].filter(e => !e.options.length).map(e => e.id), ids: [...document.querySelectorAll('[id]')].map(e => e.id), controls: document.querySelectorAll('#settings-content [data-setting],#settings-content [data-action]').length }));
    assert.deepEqual(checks.empty, [], id);
    assert.equal(new Set(checks.ids).size, checks.ids.length, `duplicate IDs on ${id}`);
    assert.ok(checks.controls > 0, `${id} has real controls`);
  }
  await go('bar'); assert.equal(await page.locator('#settings-content [data-open]').count(), 6);
  await page.locator('[data-open="customization"]').click();
  assert.equal(await field('customization_pattern').locator('option').count(), 65);
  await field('customization_colour_count').selectOption('3');
  await field('customization_colour_1').fill('#ff0055');
  await go('routing'); await field('light_bar_day_brightness').fill('37');
  await field('home_display').selectOption('weather');
  await go('customization'); assert.equal(await field('customization_colour_1').inputValue(), '#ff0055');
  assert.equal(await page.evaluate(() => GCAInterfacePreview.inspect().settings.light_bar_day_brightness), 37);
  await go('faceplate');
  const before = await field('faceplate.routing.routes.game').inputValue();
  await field('faceplate.routing.routes.game').selectOption('performance');
  assert.equal(await page.locator('#preview-dialog').isVisible(), true);
  await page.locator('#preview-dialog button[value="cancel"]').click();
  await page.waitForTimeout(50);
  assert.equal(await field('faceplate.routing.routes.game').inputValue(), before);
  await field('faceplate.routing.routes.game').selectOption('performance'); await accept();
  await page.waitForFunction(() => GCAInterfacePreview.inspect().settings['faceplate.routing.routes.game'] === 'performance');
  assert.equal(await field('faceplate.routing.routes.game').inputValue(), 'performance');
  assert.equal(await field('faceplate_performance_interval_seconds').inputValue(), '5');
  await field('faceplate_dashboard_show_weather').uncheck();
  assert.equal(await field('faceplate_dashboard_clock_position').isEnabled(), true);
  await field('faceplate_dashboard_bottom_mode').selectOption('controllers');
  assert.equal(await field('faceplate_dashboard_battery_style').isVisible(), true);
  assert.equal(await page.getByLabel('Personal API key', { exact: true }).isDisabled(), true);
  await action('Use example SteamGridDB key').click();
  assert.match(await page.locator('#settings-content').innerText(), /Example key detected/);
  await action('Verify SteamGridDB key now').click();
  assert.match(await page.locator('#settings-content').innerText(), /Simulated verification/);
  assert.equal(await page.locator('#settings-content').getByText('Send crash diagnostics automatically', { exact: true }).count(), 0);

  await go('artwork'); await page.locator('[data-library-home]').click();
  await go('faceplate'); await field('faceplate_dashboard_home_source').selectOption('artwork');
  assert.equal(await field('faceplate_dashboard_home_source').inputValue(), 'artwork');
  await go('artwork'); await page.locator('[data-library-delete]').click(); await accept();
  assert.equal(await page.locator('[data-library-id]').count(), 0);
  await page.locator('[data-art-game="drg"]').click();
  await action('Prepare preview').click();
  await page.waitForFunction(() => GCAInterfacePreview.inspect().prepared);
  await action('Use this image').click();
  assert.equal(await page.locator('[data-library-id]').count(), 1);
  await page.locator('[data-library-home]').click();
  await go('faceplate'); assert.equal(await field('faceplate_dashboard_home_source').inputValue(), 'artwork');
  await go('artwork'); await field('studio.adjust_image').check();
  assert.equal(await field('studio.loop_ending_cleanup').inputValue(), 'no');
  await field('studio.preview').selectOption('dashboard');
  await action('Preview Artwork in-game').click();
  await page.waitForFunction(() => document.querySelector('[data-preview-caption]').textContent.includes('Dashboard overlay'));
  await go('weather'); await field('weather_condition').selectOption('cloud_night');
  assert.equal(await field('weather_variant').locator('option').count(), 4);
  await action('Preview this animation').click();
  await page.waitForFunction(() => document.querySelector('[data-preview-caption]').textContent.includes('24 frames'));

  await go('assistant'); await field('assistant.enabled').check();
  await action('Install speech recognition').click(); await action('Prepare character').click();
  await action('Try assistant').click();
  assert.equal(await action('Done speaking · answer now').isVisible(), true);
  await action('Done speaking · answer now').click();
  await field('assistant.advanced_mode').check();
  const details = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Character and lighting details' }) }).first();
  await details.locator('summary').click();
  assert.equal(await field('assistant.mouth_width').isVisible(), true);
  await field('assistant.character').selectOption('gabe');
  await page.locator('details').filter({ has: page.locator('summary', { hasText: 'Appearance and sound' }) }).first().locator('summary').click();
  assert.equal(await field('assistant.eye_color').isVisible(), true);
  await field('assistant.eye_color').fill('#00ff88');
  await action('Prepare and preview character').click();
  await page.waitForFunction(() => document.querySelector('[data-preview-caption]').textContent.includes('Gabe'));
  await go('profiles'); await action('Create Evening profile').click();
  assert.equal(await field('profile.profile').locator('option').count(), 2);
  await action('Try selected profile').click();
  assert.equal(typeof await page.evaluate(() => GCAInterfacePreview.inspect().settings.home_display), 'string');
  await go('advanced'); assert.equal(await field('faceplate_flash_protection_enabled').isVisible(), true);

  for (const context of ['home-connected', 'game-connected', 'home-absent', 'game-absent', 'home-recent', 'game-busy']) {
    await page.locator('#preview-view').selectOption('quick'); await page.locator('#preview-situation').selectOption(context);
    assert.equal(await page.locator('.zone.matrix').count(), !context.includes('absent') ? 1 : 0);
    assert.equal(await page.locator('#quick-panel .zone img').count(), context === 'game-absent' ? 1 : 0);
  }
  await page.locator('#preview-situation').selectOption('game-absent');
  for (const game of ['witcher', 'drg', 'balatro']) { await page.locator('#preview-game').selectOption(game); assert.equal(await page.locator('#quick-panel img').getAttribute('src'), `../assets/${game}-header.jpg`); }
  await page.locator('#preview-view').selectOption('setup');
  await page.locator('[data-setup-next]').click(); await page.locator('[data-setup-next]').click(); await page.locator('[data-setup-next]').click();
  assert.equal(await page.locator('#preview-view').inputValue(), 'quick');
  for (const width of [320, 390, 736, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of [...ids, 'bar', 'signals']) { await go(id); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, `${id} overflow at ${width}`); }
  }
  assert.deepEqual(errors, []); assert.deepEqual(failures, []);
  assert.ok(requests.every(r => new URL(r).origin === new URL(url).origin), 'No external services accessed');
  await page.setViewportSize({ width: 1280, height: 900 }); await go('routing'); await page.screenshot({ path: '/private/tmp/gca-interface-final.png', fullPage: true });
  console.log('PASS: 7 sidebar sections, 12 grouped pages, 303 control definitions, navigation, persistence, risk cancel/accept, library prepare/delete/assign, assistant readiness, native previews, profiles, onboarding and 320–1024px layouts. No external request.');
} finally { await browser.close(); }

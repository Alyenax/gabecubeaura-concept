import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.GABECUBEAURA_CONCEPT_URL || 'http://127.0.0.1:4199/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [], failures = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (!r.ok()) failures.push(`${r.status()} ${r.url()}`); });
const input = async (id, value) => { await page.locator(id).fill(String(value)); await page.waitForTimeout(100); };
const select = async (id, value) => { await page.locator(id).selectOption(value); await page.waitForTimeout(100); };
try {
  await page.goto(url);
  await page.waitForFunction(() => window.GCAExpansion);
  assert.equal(await page.locator('.tab').count(), 18);
  assert.equal(await page.locator('#customPattern option').count(), 65);
  const exported = await page.evaluate(async () => {
    const a = GCA_SIMULATOR_ASSETS, entries = [...Object.values(a.weather), ...Object.values(a.assistant), a.overlay_fixture];
    const verified = [];
    for (const entry of entries) {
      const img = new Image(); img.src = entry.src; await img.decode();
      if (img.naturalWidth !== 64 || img.naturalHeight !== entry.frames * 54) throw Error('Invalid atlas geometry');
      const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
      const rgba = ctx.getImageData(0, 0, 64, canvas.height).data;
      const rgb = new Uint8Array(rgba.length / 4 * 3); let n = 0;
      for (let i = 0; i < rgba.length; i += 4) { rgb[n++] = rgba[i]; rgb[n++] = rgba[i + 1]; rgb[n++] = rgba[i + 2]; }
      const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', rgb))].map(c => c.toString(16).padStart(2, '0')).join('');
      if (hash !== entry.rgb_sha256) throw Error('Native RGB mismatch: ' + entry.src);
      if (entry.frames !== entry.delays.length || entry.delays.some(d => !(d > 0))) throw Error('Invalid timing');
      verified.push(entry.src);
    }
    return { weather: Object.keys(a.weather).length, assistant: Object.keys(a.assistant).length, verified: verified.length,
      companionMaxBytes: Math.max(...Object.values(a.assistant).filter(a => a.gif_bytes).map(a => a.gif_bytes)) };
  });
  assert.deepEqual([exported.weather, exported.assistant, exported.verified], [22, 35, 58]);
  assert.ok(exported.companionMaxBytes <= 12000);

  await page.locator('[data-tab="faceplate"]').click();
  const weather = await page.evaluate(() => Object.keys(WEATHER_OPTIONS));
  for (const condition of weather) {
    await select('#simWeather', condition);
    const variants = await page.locator('#simVariant option').count();
    assert.equal(variants, ['cloud', 'cloud_night'].includes(condition) ? 4 : 2);
    for (let v = 0; v < variants; v++) {
      await select('#simVariant', String(v));
      await page.waitForFunction(() => Boolean(GCAExpansion.inspect().face));
      assert.equal(await page.locator('#simMatrix').isVisible(), true);
    }
  }
  await select('#simWeather', 'rain');
  await page.locator('[data-tab="dashboard"]').click();
  await select('#simBottom', 'controllers');
  const fixture = await page.evaluate(async () => {
    const entry = GCA_SIMULATOR_ASSETS.overlay_fixture, img = new Image(); img.src = entry.src; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 54;
    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
    const expected = ctx.getImageData(0, 0, 64, 54).data, actual = GCAExpansion.fixture();
    return actual.reduce((n, v, i) => n + (i % 4 !== 3 && v !== expected[i] ? 1 : 0), 0);
  });
  assert.equal(fixture, 0, 'Approved native overlay RGB must match pixel by pixel');
  for (const bottom of ['next_hour', 'today', 'controllers', 'performance', 'session', 'timer']) {
    await select('#simBottom', bottom);
    assert.ok(await page.evaluate(() => GCAExpansion.inspect().face.some(v => v > 0)));
  }
  await select('#simBackground', 'artwork');
  await page.waitForFunction(() => !document.querySelector('#simMatrixDetail').textContent.includes('Loading'));
  await page.locator('[data-tab="faceplate"]').click();
  await select('#simFaceMode', 'artwork');
  const artworkFrames = [];
  for (const game of ['witcher', 'drg', 'balatro']) {
    await select('#simGame', game); await page.waitForTimeout(150);
    artworkFrames.push(await page.evaluate(() => GCAExpansion.inspect().face.join(',')));
  }
  assert.equal(new Set(artworkFrames).size, 3);
  await page.locator('#simExtension').check();
  await page.waitForFunction(() => document.querySelector('#providerBadge').textContent === 'IMAGE EXTENSION');
  await page.locator('#simExtension').uncheck();

  await page.locator('[data-tab="customization"]').click();
  await select('#customPattern', 'steady'); await select('#customPaletteCount', '1');
  await input('#customHex1', '#FF0000'); await input('#customBrightness', 255);
  await input('#simBrightness', 50);
  await page.waitForFunction(() => document.querySelector('#logicalLeds i').style.backgroundColor === 'rgb(128, 0, 0)');
  await page.locator('#simNight').check(); await input('#simNightGain', 20);
  await page.waitForFunction(() => document.querySelector('#logicalLeds i').style.backgroundColor === 'rgb(26, 0, 0)');
  await page.locator('#simNight').uncheck(); await input('#simBrightness', 100);
  await page.locator('[data-tab="routing"]').click();
  await select('#simFaceHome', 'weather'); await select('#simFaceGame', 'artwork');
  await page.locator('#simApplyRoutes').click();
  await page.locator('[data-tab="assistant"]').click();
  await page.locator('#simConversation').click();
  await page.waitForFunction(() => document.querySelector('#providerBadge').textContent === 'ASSISTANT');
  await page.locator('#simContext').evaluate(el => el.click());
  const target = await page.evaluate(() => ({ context: state.context, route: state.context === 'home' ? GCAExpansion.inspect().faceHome : GCAExpansion.inspect().faceGame }));
  await page.evaluate(() => { clock += GCAExpansion.inspect().assistant.steps.reduce((sum, s) => sum + s.duration, 0) + 50; });
  await page.waitForFunction(() => !GCAExpansion.inspect().assistant);
  assert.equal(await page.evaluate(() => GCAExpansion.inspect().faceMode), target.route);
  for (const character of ['gabe', 'companion']) {
    await select('#simCharacter', character);
    for (const reaction of ['wake', 'listen', 'question', 'success']) {
      await page.locator(`[data-reaction="${reaction}"]`).click();
      await page.waitForFunction(() => GCAExpansion.inspect().assistant && GCAExpansion.inspect().face);
      await page.evaluate(() => { clock += GCAExpansion.inspect().assistant.steps[0].duration + 50; });
      await page.waitForFunction(() => !GCAExpansion.inspect().assistant);
    }
  }
  assert.equal(await page.evaluate(() => GCAExpansion.frameIndex({ frames: 2, delays: [100, 200], loop: false }, 9999)), 1);
  assert.equal(await page.evaluate(() => GCAExpansion.frameIndex({ frames: 2, delays: [100, 200], loop: true }, 350)), 0);
  await page.locator('[data-reaction="listen"]').click();
  await page.locator('#simMaster').uncheck();
  await page.waitForFunction(() => document.querySelector('#providerBadge').textContent === 'OFF');
  assert.equal(await page.evaluate(() => GCAExpansion.inspect().assistant), null);
  await page.locator('#simMaster').check();
  await page.locator('[data-tab="routing"]').click();
  await page.locator('[data-pane="routing"] summary').click();
  await select('#simSafety', 'thermal');
  await page.waitForFunction(() => document.querySelector('#providerBadge').textContent === 'SAFETY');
  assert.ok(await page.locator('#logicalLeds i').evaluateAll(items => items.every(el => el.style.backgroundColor === 'rgb(255, 0, 0)')));
  await select('#simSafety', 'sleep');
  await page.waitForFunction(() => document.querySelector('#providerBadge').textContent === 'OFF');
  await select('#simSafety', 'normal');

  for (const width of [320, 390, 736, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const tab of ['faceplate', 'dashboard', 'assistant', 'ambience', 'routing']) {
      await page.locator(`[data-tab="${tab}"]`).click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 1) { await page.screenshot({ path: '/private/tmp/gca-simulator-overflow.png', fullPage: true }); console.log(await page.evaluate(() => ({ scrollX, overflow: document.documentElement.scrollWidth - innerWidth, nodes: [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width && r.right + scrollX > innerWidth + 1 && getComputedStyle(el.parentElement).overflowX === 'visible'; }).map(el => [el.tagName, el.id, el.className, el.getBoundingClientRect().right + scrollX, el.textContent.slice(0, 80)]).slice(0, 20) }))); }
      assert.ok(overflow <= 1, `${tab} overflows by ${overflow}px at ${width}px`);
      const bounds = await page.evaluate(() => {
        const c = document.querySelector('#simMatrix').getBoundingClientRect(), f = document.querySelector('.cube-face').getBoundingClientRect();
        return { visible: !document.querySelector('#simMatrix').hidden, inside: c.top >= f.top && c.bottom <= f.bottom + 1 && c.left >= f.left && c.right <= f.right + 1, ratio: c.width / c.height };
      });
      if (bounds.visible) { assert.equal(bounds.inside, true); assert.ok(Math.abs(bounds.ratio - 64 / 54) < .005); }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('[data-tab="dashboard"]').click();
  await page.locator('.workbench').screenshot({ path: '/private/tmp/gca-lighting-simulator-expanded.png' });
  await page.locator('[data-tab="priorities"]').click(); await page.locator('#resetDemo').click();
  assert.equal(await page.locator('#simFaceMode').inputValue(), 'off');
  assert.equal(await page.locator('#simBrightnessValue').innerText(), '100%');
  assert.equal(await page.locator('#simWeather').inputValue(), 'rain');
  assert.deepEqual(errors, []); assert.deepEqual(failures, []);
  console.log('PASS: 58 RGB atlas hashes, native Dashboard overlay, all 22 weather variants, 35 assistant banks, transitions, current-route restoration, brightness, safety, reset and 320–1440px layouts.');
} finally { await browser.close(); }

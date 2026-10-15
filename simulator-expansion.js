/* Static visual coverage for Lab 121. No Steam, microphone or hardware APIs. */
(() => {
  'use strict';
  const assets = globalThis.GCA_SIMULATOR_ASSETS;
  const C = assets.colors, W = 64, H = 54;
  const defaults = () => ({ enabled: true, brightness: 100, night: false, nightGain: 35,
    faceBrightness: 100, faceConnected: true, faceMode: 'off', background: 'weather',
    condition: 'rain', variant: 0, game: 'witcher', source: 'hero', crop: 50,
    bottom: 'next_hour', clock: '21:40', clockStart: clock, temperature: 12,
    nextTemp: 13, rain: 80, morning: 9, afternoon: 14, p1: 87, p2: 64,
    showP2: true, batteryStyle: 'percent', unit: 'celsius', clock24: true,
    character: 'companion', mount: 'round', amplitude: 'natural', motion: 'lively',
    eyes: '#66c0f4', glasses: '#b4a17b', heart: '#a879a8', mouth: '#f2b6d0',
    edge: '#853f66', mouthWidth: 40, assistant: null, restore: null,
    extension: false, routing: false, homeRoute: 'customization', gameRoute: 'artwork',
    faceHome: 'dashboard', faceGame: 'artwork', safety: 'normal', generation: 0 });
  let sim = defaults(), lastFrame = null, lastDrawKey = '', lastDrawTime = -1;
  let cachedFrame = null, cachedFrameKey = '';
  const bindings = [];
  const sheets = new Map(), images = new Map();
  const newTabs = [['faceplate', '▦', 'Faceplate'], ['dashboard', '◷', 'Dashboard'],
    ['assistant', '♡', 'Voice assistant'], ['ambience', '◐', 'Ambience'], ['routing', '⇄', 'Display routing']];
  const range = (id, label, min, max, value, suffix = '') => `<label class="slider-field" for="${id}"><span>${label} <output id="${id}Value">${value}${suffix}</output></span><input id="${id}" type="range" min="${min}" max="${max}" value="${value}"></label>`;
  const choice = (id, label, options) => `<label class="field">${label}<select id="${id}">${options.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`;
  const check = (id, label, checked = false) => `<label class="toggle-line"><input id="${id}" type="checkbox" ${checked ? 'checked' : ''}><span>${label}</span></label>`;
  const conditions = Object.keys(WEATHER_OPTIONS).map(v => [v, v.replaceAll('_', ' ')]);
  const games = Object.entries(GAME_DATA).map(([key, value]) => [key, value.title]);
  const routes = [['customization', 'Customization+'], ['artwork', 'Artwork'], ['performance', 'Performance'], ['controller', 'Controllers'], ['weather', 'Weather'], ['faceplate-extension', 'Faceplate image extension'], ['disabled', 'GabeCubeAura Off']];
  const faceRoutes = [['dashboard', 'Dashboard'], ['weather', 'Weather'], ['artwork', 'Artwork'], ['performance', 'Performance'], ['off', 'Off']];
  const panes = {
    faceplate: `<div class="pane-head"><p class="eyebrow">NATIVE 64 × 54 · PREPARED PIXELS</p><h3>Give the front a scene.</h3><p>Every dot is one source pixel. Weather uses all 22 native Realistic V2 loops, not an invented cloud overlay. Artwork is cropped locally from the bundled Steam images.</p></div>
      <div class="form-grid">${choice('simFaceMode', 'Faceplate display', faceRoutes)}${choice('simWeather', 'Weather condition', conditions)}</div>
      ${choice('simVariant', 'Realistic V2 animation', [])}
      <div class="form-grid">${choice('simGame', 'Artwork game', games)}${choice('simSource', 'Artwork image', Object.entries(IMAGE_LABELS))}</div>
      ${range('simCrop', 'Horizontal crop position', 0, 100, 50, '%')}
      ${range('simFaceBrightness', 'Faceplate brightness', 0, 100, 100, '%')}
      ${check('simConnected', 'JSAUX Faceplate connected (simulated)', true)}
      ${check('simExtension', 'Extend the Faceplate image colours into the light bar')}
      <p class="sim-status" id="simFaceStatus" role="status">Preparing native example…</p>
      <p class="sim-evidence">Source RGB and frame delays come from the Lab 121 runtime assets. The diffuser is illustrative. This preview performs no serial transfer, flash write or GIF conversion.</p>`,
    dashboard: `<div class="pane-head"><p class="eyebrow">ONE SHARED OVERLAY · ONE STRICT BOTTOM ROW</p><h3>A dashboard, not a collage.</h3><p>Keep the same weather notch and quiet clock over Realistic V2 weather or a game artwork. Change one bottom row at a time.</p></div>
      <div class="form-grid">${choice('simBackground', 'Background', [['weather', 'Realistic V2 weather'], ['artwork', 'Game artwork']])}${choice('simBottom', 'Bottom row', [['next_hour', 'Next hour · weather and rain'], ['today', 'Today · morning / afternoon'], ['controllers', 'Controller batteries · P1 / P2'], ['performance', 'CPU / GPU'], ['session', 'Current game session'], ['timer', 'Playtime countdown']])}</div>
      <div class="form-grid" id="simDashboardArtwork">${choice('simDashboardGame', 'Artwork game', games)}${choice('simDashboardSource', 'Artwork image', Object.entries(IMAGE_LABELS))}</div>
      <div class="form-grid" id="simDashboardWeatherControls">${choice('simDashboardWeather', 'Weather condition', conditions)}${choice('simDashboardVariant', 'Realistic V2 animation', [])}</div>
      <div class="form-grid"><label class="field">Example clock<input id="simClock" type="time" value="21:40"></label>${choice('simUnit', 'Temperature unit', [['celsius', 'Celsius · °C'], ['fahrenheit', 'Fahrenheit · °F']])}</div>
      ${check('simClock24', '24-hour clock', true)}
      ${range('simTemperature', 'Current temperature', -30, 45, 12, '°C')}
      <div id="simForecastInputs">${range('simNextTemp', 'Temperature in one hour', -30, 45, 13, '°C')}${range('simRain', 'Rain probability in one hour', 0, 100, 80, '%')}</div>
      <div id="simTodayInputs" hidden>${range('simMorning', 'Morning temperature', -30, 45, 9, '°C')}${range('simAfternoon', 'Afternoon temperature', -30, 45, 14, '°C')}</div>
      <div id="simBatteryInputs" hidden>${range('simP1', 'P1 battery', 0, 100, 87, '%')}${range('simP2', 'P2 battery', 0, 100, 64, '%')}${check('simP2Enabled', 'Show P2 on the left', true)}${choice('simBatteryStyle', 'Battery display', [['percent', 'Percentage'], ['bar', 'Battery bar']])}</div>
      <p class="field-help">CPU/GPU values use the Performance sliders. Session duration is an example (42 minutes). Countdown uses Playtime values. This clock advances continuously, independently of the weather loop.</p>`,
    assistant: `<div class="pane-head"><p class="eyebrow">FACE + 17-LED MOUTH · SILENT VISUAL PREVIEW</p><h3>Meet your assistant.</h3><p>Play a complete call, listening, clarification and success sequence, then return to the current Dashboard. No microphone opens and no command is executed.</p></div>
      <div class="form-grid">${choice('simCharacter', 'Character', [['companion', 'GabeCube Companion'], ['gabe', 'Gabe Assistant']])}${choice('simMotion', 'Companion movement', [['lively', 'Lively'], ['calm', 'Calm']])}</div>
      <div class="form-grid">${choice('simMount', 'Gabe glasses', [['round', 'Round'], ['optique', 'Optique V3'], ['rectangular', 'Rectangular']])}${choice('simAmplitude', 'Gabe expression', [['natural', 'Natural'], ['subtle', 'Subtle'], ['expressive', 'Expressive']])}</div>
      <div class="colour-row"><label>Eyes<input id="simEyes" type="color" value="#66c0f4"></label><label>Glasses<input id="simGlasses" type="color" value="#b4a17b"></label><label>Heart<input id="simHeart" type="color" value="#a879a8"></label></div>
      <div class="colour-row"><label>Mouth centre<input id="simMouth" type="color" value="#f2b6d0"></label><label>Mouth edges<input id="simEdge" type="color" value="#853f66"></label></div>
      ${range('simMouthWidth', 'Slow Prism width around centre', 25, 100, 40, '%')}
      <div class="button-row"><button class="button primary" id="simConversation">Play a conversation</button><button class="button ghost" id="simCancel">Return to normal display</button></div>
      <div class="button-row"><button class="button ghost" data-reaction="wake">Call</button><button class="button ghost" data-reaction="listen">Listen</button><button class="button ghost" data-reaction="question">Clarify</button><button class="button ghost" data-reaction="success">Success</button></div>
      <div class="sim-phase" id="simPhases" aria-label="Conversation phases"><span data-phase="wake">Call</span><span data-phase="listen">Listening</span><span data-phase="question">Clarification</span><span data-phase="success">Done</span><span data-phase="restored">Normal display</span></div>
      <p class="sim-status" id="simAssistantStatus" role="status">Ready. All motions are native prepared frames.</p>
      <details class="sim-advanced"><summary>What the real assistant does</summary><ul class="sim-commands"><li>Launch a game, the last game, or close the current one.</li><li>Set or adjust a Playtime timer and ask how long you have played.</li><li>Change, mute or restore volume through the configured output route.</li><li>Apply a saved ambience profile.</li><li>Sleep or shut down, with confirmation where required.</li><li>Optional Ok / Hey activation with Gabe, Gaben, Gaby, Cube or GabeCube.</li></ul><p class="field-help">Real speech recognition, voices, wake sensitivity, CEC and controller shortcuts require the installed plugin. Here the mouth envelope is synthetic, no sound is played. GIF byte counts are measured runtime files, not promises about USB latency.</p></details>`,
    ambience: `<div class="pane-head"><p class="eyebrow">BROWSER-ONLY SCENARIO EXAMPLES</p><h3>Change the room's mood.</h3><p>Try a coordinated visual example without changing brightness. These are demonstration combinations, not an import of your saved profiles.</p></div>
      <div class="button-row"><button class="button primary" data-ambience="evening">Evening · quiet night</button><button class="button ghost" data-ambience="day">Daytime · warm light</button><button class="button ghost" data-ambience="gaming">Gaming · artwork</button></div>
      <p class="field-help">Global Light bar brightness stays independent. Use the always-visible controls above the machine for Day / Night dimming, brightness and master on / off.</p>`,
    routing: `<div class="pane-head"><p class="eyebrow">HOME + IN GAME · TWO INDEPENDENT DISPLAYS</p><h3>Choose what appears, and when.</h3><p>Switch context without losing either route. A temporary assistant session restores the current route, not a stale screenshot.</p></div>
      <div class="form-grid">${choice('simHomeRoute', 'Home · light bar', routes)}${choice('simGameRoute', 'In game · light bar', routes)}</div>
      <div class="form-grid">${choice('simFaceHome', 'Home · Faceplate', faceRoutes)}${choice('simFaceGame', 'In game · Faceplate', faceRoutes)}</div>
      <div class="button-row"><button class="button primary" id="simApplyRoutes">Try these routes</button><button class="button ghost" id="simContext">Switch Home / in game</button></div>
      <details class="sim-advanced"><summary>System ownership and safety examples</summary>${choice('simSafety', 'System situation', [['normal', 'Normal · GabeCubeAura'], ['thermal', 'Critical temperature · fixed red'], ['steam', 'Steam owns the bar · rendering not simulated'], ['sleep', 'Machine asleep · displays off']])}<p class="field-help">The red warning is illustrative, not a sensor reading. Native Valve patterns are not fabricated. Master off, sleep and safety override the visual session.</p></details>
      <p class="field-help">For real media analysis, open Audio Sync or Screen Sync and press Play. Those pages use the bundled videos; this route editor does not start playback automatically.</p>`
  };
  for (const [key, icon, label] of newTabs) {
    const button = document.createElement('button'); button.className = 'tab'; button.dataset.tab = key;
    button.setAttribute('aria-selected', 'false'); button.textContent = `${icon} ${label}`;
    button.addEventListener('click', () => setTab(key)); $('.tab-list').append(button);
    const pane = document.createElement('section'); pane.className = 'pane'; pane.dataset.pane = key;
    pane.setAttribute('aria-label', label); pane.innerHTML = panes[key]; $('.settings-content').append(pane);
    const card = document.createElement('button'); card.className = 'scene-card';
    card.innerHTML = `<span class="scene-icon cyan">${icon}</span><strong>${label}</strong><small>${key === 'faceplate' ? '22 native Realistic V2 animations' : key === 'assistant' ? 'Two characters, exact prepared motions' : key === 'dashboard' ? 'Weather or game artwork, six bottom rows' : key === 'routing' ? 'Separate Home and in-game routes' : 'Coordinated visual examples'}</small>`;
    card.addEventListener('click', () => setTab(key)); $('.scene-grid').append(card);
  }
  $('#weatherCondition').add(new Option('Cloud · night', 'cloud_night'));
  for (const id of ['weatherCondition', 'weatherVariant']) $(`#${id}`).addEventListener('change', () => {
    sim.condition = state.weatherCondition; sim.variant = state.weatherVariants[state.weatherCondition];
    $('#simWeather').value = sim.condition; syncVariants(); update();
  });
  const global = document.createElement('div'); global.className = 'sim-global';
  global.innerHTML = `<label><input id="simMaster" type="checkbox" checked> Displays on</label><label>Light bar <input id="simBrightness" type="range" min="0" max="100" value="100"><output id="simBrightnessValue">100%</output></label><label><input id="simNight" type="checkbox"> Night</label><label>Night gain <input id="simNightGain" type="range" min="0" max="100" value="35"><output id="simNightGainValue">35%</output></label>`;
  $('.stage-top').after(global);
  const faceCanvas = document.createElement('canvas'); faceCanvas.id = 'simMatrix'; faceCanvas.className = 'sim-face';
  faceCanvas.width = 640; faceCanvas.height = 540; faceCanvas.hidden = true;
  faceCanvas.setAttribute('role', 'img'); faceCanvas.setAttribute('aria-label', 'Native 64 by 54 RGB Faceplate preview');
  $('.cube-face').append(faceCanvas);
  const detail = document.createElement('div'); detail.className = 'sim-face-detail'; detail.id = 'simMatrixDetail'; detail.hidden = true;
  $('.machine-scene').after(detail);
  const coverage = document.createElement('details'); coverage.className = 'sim-coverage';
  coverage.innerHTML = `<summary>Coverage and honest limits</summary><ul><li>65 Customization+ patterns; 19 event cues including recording; 15 controller patterns with one to four seats; 10 launch patterns.</li><li>9 weather conditions, 22 light-bar loops and all 22 Realistic V2 Faceplate loops.</li><li>10 Audio Sync patterns, 22 palettes and two Screen Sync mappings using actual bundled media.</li><li>Artwork: three games × Hero / Header / Capsule, local upload for the light bar, editable sampling and crop.</li><li>Dashboard: weather or artwork, clock, °C / °F, forecast, batteries, load, session and timer examples.</li><li>Two assistants: 27 Gabe face banks and 8 Companion banks, with authored timing and one-shot handling.</li><li>Home / in-game routes, image extension, master, Night dimming and safety examples.</li><li>Hardware, automatic weather fetching, installed-game discovery, SteamGridDB search, voice recognition, voices, CEC, module installation and real transfer latency are not emulated.</li></ul><p class="sim-evidence">Reference: Lab 121 (${assets.source_commit.slice(0, 7)}). Browser models are not bit-identical to PipeWire or proof of physical behaviour. <a href="interface-preview/">Inspect the separate Decky navigation draft ↗</a></p>`;
  $('[data-pane="overview"]').append(coverage);

  function loadSheet(entry) {
    if (!entry) return null;
    if (sheets.has(entry.src)) return sheets.get(entry.src);
    const record = { ready: false, error: false }; sheets.set(entry.src, record);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 54 * entry.frames;
        const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
        record.pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data; record.ready = true;
      } catch { record.error = true; }
      sim.generation++; lastDrawKey = '';
    };
    image.onerror = () => { record.error = true; sim.generation++; };
    image.src = entry.src; return record;
  }
  function frameIndex(entry, elapsed) {
    const total = entry.delays.reduce((a, b) => a + b, 0);
    let position = entry.loop ? Math.max(0, elapsed) % total : Math.min(total - 1, Math.max(0, elapsed));
    for (let i = 0; i < entry.frames; i++) { if (position < entry.delays[i]) return i; position -= entry.delays[i]; }
    return entry.frames - 1;
  }
  function sheetFrame(entry, elapsed) {
    const sheet = loadSheet(entry); if (!sheet?.ready) return null;
    return new Uint8ClampedArray(sheet.pixels.subarray(frameIndex(entry, elapsed) * W * H * 4, (frameIndex(entry, elapsed) + 1) * W * H * 4));
  }
  function pixel(frame, x, y, color) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = (y * W + x) * 4; frame.set([...color, 255], i);
  }
  function rect(frame, x, y, w, h, color) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) pixel(frame, xx, yy, color); }
  function measure(value) { const chars = [...String(value).toUpperCase()]; return chars.reduce((sum, c) => sum + (assets.font[c] || assets.font['?'])[0].length, 0) + Math.max(0, chars.length - 1); }
  function text(frame, x, y, value, color) {
    for (const c of String(value).toUpperCase()) {
      const glyph = assets.font[c] || assets.font['?'];
      glyph.forEach((row, yy) => [...row].forEach((bit, xx) => { if (bit === '1') pixel(frame, x + xx, y + yy, color); }));
      x += glyph[0].length + 1;
    }
  }
  function icon(frame, condition, x, y) { for (const [xx, yy, color] of assets.icons[condition]) pixel(frame, x + xx, y + yy, color); }
  function temperature(value, short = false) { return `${Math.round(sim.unit === 'fahrenheit' ? value * 9 / 5 + 32 : value)}°${short ? '' : sim.unit === 'fahrenheit' ? 'F' : 'C'}`; }
  function notch(frame) {
    rect(frame, 38, 1, 25, 9, C.NOTCH_BACKGROUND); rect(frame, 37, 2, 27, 7, C.NOTCH_BACKGROUND);
    rect(frame, 38, 0, 25, 1, C.NOTCH_BORDER); rect(frame, 38, 10, 25, 1, C.NOTCH_BORDER);
    for (const [x, y] of [[37, 1], [63, 1], [37, 9], [63, 9]]) pixel(frame, x, y, C.NOTCH_BORDER);
    for (const [x, y, color] of assets.notch_icons[sim.condition]) pixel(frame, x, y, color);
    const label = temperature(sim.temperature);
    if (measure(label) <= 14) text(frame, 61 - measure(label), 3, label, C.TEMPERATURE_AMBER);
    else {
      const number = label.slice(0, -2); text(frame, 61 - measure(number), 1, number, C.TEMPERATURE_AMBER);
      rect(frame, 55, 6, 2, 2, C.TEMPERATURE_AMBER);
      const rows = sim.unit === 'celsius' ? ['111', '100', '100', '111'] : ['111', '100', '110', '100'];
      rows.forEach((row, y) => [...row].forEach((bit, x) => { if (bit === '1') pixel(frame, 58 + x, 6 + y, C.TEMPERATURE_AMBER); }));
    }
  }
  function dashboard(frame) {
    const [hh, mm] = sim.clock.split(':').map(Number);
    const minutes = (hh * 60 + mm + Math.floor((clock - sim.clockStart) / 60000)) % 1440;
    const hour = Math.floor(minutes / 60), label = `${sim.clock24 ? String(hour).padStart(2, '0') : hour % 12 || 12}:${String(minutes % 60).padStart(2, '0')}`;
    const suffix = sim.clock24 ? '' : hour < 12 ? 'AM' : 'PM';
    const width = measure(label) + (suffix ? 2 + measure(suffix) : 0);
    for (let y = 0; y < 10; y++) for (let x = 0; x < width + 4; x++) {
      const i = (y * W + x) * 4, factor = 1 - (.58 - y * .035);
      for (let c = 0; c < 3; c++) frame[i + c] = Math.round(frame[i + c] * factor);
    }
    text(frame, 2, 3, label, C.WARM_WHITE); if (suffix) text(frame, 4 + measure(label), 3, suffix, C.SEPARATOR_GREY);
    notch(frame); rect(frame, 0, 45, 64, 9, C.RAIL_BACKGROUND); rect(frame, 0, 45, 64, 1, C.RAIL_BORDER);
    if (sim.bottom === 'controllers') {
      const items = sim.showP2 ? [[2, sim.p2, 2, C.PLAYER_TWO], [1, sim.p1, 39, C.PLAYER_ONE]] : [[1, sim.p1, 2, C.PLAYER_ONE]];
      for (const [player, percent, left, color] of items) {
        text(frame, left, 48, `P${player}`, color);
        if (sim.batteryStyle === 'percent') {
          const value = `${percent}%`, right = left > 30 ? 63 : 29;
          text(frame, Math.min(left + 12, right + 1 - measure(value)), 48, value, color);
        } else {
          rect(frame, left + 10, 48, 12, 5, [245, 248, 255]); rect(frame, left + 22, 49, 1, 3, [245, 248, 255]);
          rect(frame, left + 11, 49, 10, 3, [2, 6, 12]); rect(frame, left + 11, 49, Math.round(percent / 10), 3, color);
        }
      }
    } else if (sim.bottom === 'performance') {
      text(frame, 2, 48, `CPU ${state.cpu}%`, C.PLAYER_ONE); const label = `GPU ${state.gpu}%`;
      text(frame, 63 - measure(label), 48, label, [75, 218, 110]);
    } else if (sim.bottom === 'today') {
      const morning = temperature(sim.morning), afternoon = temperature(sim.afternoon);
      const mx = 20, sx = Math.max(33, mx + measure(morning) + 1), ax = Math.max(39, sx + 4);
      const shift = Math.max(0, ax + measure(afternoon) - 63);
      const iw = Math.max(...assets.icons[sim.condition].map(p => p[0])) + 1;
      icon(frame, sim.condition, 17 - iw - shift, 48); text(frame, mx - shift, 48, morning, C.MORNING_BLUE);
      text(frame, sx - shift, 48, '/', C.SEPARATOR_GREY); text(frame, ax - shift, 48, afternoon, C.AFTERNOON_ORANGE);
    } else if (sim.bottom === 'session' || sim.bottom === 'timer') {
      const value = sim.bottom === 'session' ? 'PLAY 0H42' : `T ${formatTime(state.timerRemaining)}`;
      text(frame, Math.max(2, Math.floor((64 - measure(value)) / 2)), 48, value, C.WARM_WHITE);
    } else {
      const values = ['+1H', sim.condition, temperature(sim.nextTemp, true), 'rain', `${sim.rain}%`];
      const iw = Math.max(...assets.icons[sim.condition].map(p => p[0])) + 1;
      const widths = [measure(values[0]), iw, measure(values[2]), 7, measure(values[4])];
      let temp = values[2]; if (widths.reduce((a, b) => a + b, 0) > 56) { temp = temp.replace('°', ''); widths[2] = measure(temp); }
      const spare = 60 - widths.reduce((a, b) => a + b, 0), gutter = Math.floor(spare / 4), extra = spare % 4;
      let x = 2; text(frame, x, 48, '+1H', C.WARM_WHITE); x += widths[0] + gutter + (extra > 0);
      icon(frame, sim.condition, x, 47); x += widths[1] + gutter + (extra > 1);
      text(frame, x, 48, temp, C.WARM_WHITE); x += widths[2] + gutter + (extra > 2);
      icon(frame, 'rain', x, 47); x += widths[3] + gutter;
      text(frame, x, 48, values[4], C.PLAYER_ONE);
    }
    return frame;
  }
  function artwork() {
    const src = `assets/${sim.game}-${sim.source}.jpg`;
    if (!images.has(src)) {
      const image = new Image(); const record = { image, ready: false, error: false }; images.set(src, record);
      image.onload = () => { record.ready = true; sim.generation++; }; image.onerror = () => { record.error = true; sim.generation++; }; image.src = src;
    }
    const record = images.get(src); if (!record.ready) return null;
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const context = canvas.getContext('2d', { willReadFrequently: true }), image = record.image;
    const ratio = W / H, sourceRatio = image.naturalWidth / image.naturalHeight;
    const sw = sourceRatio > ratio ? image.naturalHeight * ratio : image.naturalWidth;
    const sh = sw / ratio, x = (image.naturalWidth - sw) * sim.crop / 100, y = (image.naturalHeight - sh) / 2;
    try { context.drawImage(image, x, y, sw, sh, 0, 0, W, H); return context.getImageData(0, 0, W, H).data; }
    catch { record.error = true; return null; }
  }
  function assistantEntry(reaction) {
    return assets.assistant[sim.character === 'gabe' ? `gabe-${sim.mount}-${sim.amplitude}-${({ wake: 'listening', listen: 'listening', question: 'question', success: 'happy' })[reaction]}` : `companion-${sim.motion}-${reaction}`];
  }
  function sessionPhase() {
    if (!sim.assistant) return null;
    let elapsed = clock - sim.assistant.start;
    for (const step of sim.assistant.steps) { if (elapsed < step.duration) return { reaction: step.reaction, elapsed }; elapsed -= step.duration; }
    sim.assistant = null;
    if (sim.restore) { sim.faceMode = sim.restore.faceMode; sim.restore = null; }
    $('#simAssistantStatus').textContent = 'Normal display restored. No action was executed.';
    $$('#simPhases span').forEach(el => el.classList.toggle('active', el.dataset.phase === 'restored'));
    return null;
  }
  function recolor(frame, entry) {
    const lookup = new Map();
    entry.palette.forEach((item, i) => {
      if (sim.character === 'companion') {
        if (!['heart_canonical', 'heart_pink', 'heart_flashy'].includes(item.part)) return;
        const sourceRed = { heart_canonical: 168, heart_pink: 240, heart_flashy: 255 }[item.part];
        const gain = item.rgb[0] / sourceRed * { heart_canonical: 1, heart_pink: 1.2, heart_flashy: 1.5 }[item.part];
        if (sim.heart !== '#a879a8') lookup.set(entry.rendered_palette[i].join(','), hexToRgb(sim.heart).map(c => Math.min(255, Math.round(c * gain))));
        return;
      }
      const field = item.part === 'eyes' ? 'eyes' : item.part === 'glasses' ? 'glasses' : null;
      if (!field) return;
      const original = entry.rendered_palette[i], base = field === 'eyes' ? [102, 192, 244] : [180, 161, 123];
      const axis = base.indexOf(Math.max(...base)), target = hexToRgb(sim[field]);
      lookup.set(original.join(','), target.map(c => Math.min(255, Math.floor(c * original[axis] / base[axis] + .5))));
    });
    for (let i = 0; i < frame.length; i += 4) { const color = lookup.get(`${frame[i]},${frame[i + 1]},${frame[i + 2]}`); if (color) frame.set(color, i); }
    return frame;
  }
  function currentFrame() {
    const phase = sessionPhase();
    if (phase) {
      const entry = assistantEntry(phase.reaction), frame = sheetFrame(entry, phase.elapsed);
      $('#simAssistantStatus').textContent = `${sim.character === 'gabe' ? 'Gabe Assistant' : 'GabeCube Companion'} · ${phase.reaction}${entry.gif_bytes ? ` · ${entry.gif_bytes.toLocaleString('en')} byte native GIF` : ''} · ${entry.frames} authored frames`;
      $$('#simPhases span').forEach(el => el.classList.toggle('active', el.dataset.phase === phase.reaction));
      return frame ? recolor(frame, entry) : null;
    }
    if (sim.faceMode === 'off') return null;
    if (sim.faceMode === 'performance') {
      const frame = new Uint8ClampedArray(W * H * 4);
      text(frame, 2, 5, `CPU ${state.cpu}%`, C.PLAYER_ONE); text(frame, 2, 15, `${state.cpuTemp}°C`, C.WARM_WHITE);
      text(frame, 2, 30, `GPU ${state.gpu}%`, [75, 218, 110]); text(frame, 2, 40, `${state.gpuTemp}°C`, C.WARM_WHITE);
      rect(frame, 2, 23, Math.round(60 * state.cpu / 100), 2, C.PLAYER_ONE); rect(frame, 2, 48, Math.round(60 * state.gpu / 100), 2, [75, 218, 110]); return frame;
    }
    const entry = assets.weather[`${sim.condition}:${sim.variant}`];
    let frame = sim.faceMode === 'artwork' || (sim.faceMode === 'dashboard' && sim.background === 'artwork') ? artwork() : sheetFrame(entry, clock);
    if (!frame) return null;
    if (sim.faceMode === 'weather') notch(frame);
    if (sim.faceMode === 'dashboard') frame = dashboard(frame);
    return frame;
  }
  function applyRoutes() {
    const route = state.context === 'home' ? sim.homeRoute : sim.gameRoute;
    state.display = route; sim.faceMode = state.context === 'home' ? sim.faceHome : sim.faceGame;
    $('#simFaceMode').value = sim.faceMode;
  }
  function startAssistant(reaction, full = false) {
    if (!sim.enabled || !sim.faceConnected || sim.safety !== 'normal') {
      $('#simAssistantStatus').textContent = 'Enable displays, connect the simulated Faceplate and return to Normal ownership first.'; return;
    }
    if (!sim.assistant) sim.restore = { faceMode: sim.faceMode };
    const reactions = full ? ['wake', 'listen', 'question', 'success'] : [reaction];
    sim.assistant = { start: clock, steps: reactions.map(r => {
      const entry = assistantEntry(r); loadSheet(entry);
      const native = entry.delays.reduce((a, b) => a + b, 0);
      return { reaction: r, duration: r === 'listen' ? Math.max(2200, native) : r === 'question' ? Math.max(1800, native) : native };
    }) };
    lastDrawKey = '';
  }
  function update() {
    sim.generation++; lastDrawKey = '';
    for (const { element, key, type, suffix } of bindings) {
      if (document.activeElement !== element) { if (type === 'check') element.checked = sim[key]; else element.value = String(sim[key]); }
      const output = $(`#${element.id}Value`); if (output) output.textContent = `${sim[key]}${suffix}`;
    }
    $('#simDashboardArtwork').hidden = sim.background !== 'artwork';
    $('#simDashboardWeatherControls').hidden = sim.background !== 'weather';
    $('#simForecastInputs').hidden = sim.bottom !== 'next_hour'; $('#simTodayInputs').hidden = sim.bottom !== 'today'; $('#simBatteryInputs').hidden = sim.bottom !== 'controllers';
    $('#simMount').disabled = $('#simAmplitude').disabled = sim.character !== 'gabe'; $('#simMotion').disabled = sim.character !== 'companion';
    $('#simEyes').disabled = $('#simGlasses').disabled = sim.character !== 'gabe'; $('#simHeart').disabled = sim.character !== 'companion';
    if (sim.routing) applyRoutes();
  }
  function bind(id, key, type = 'string', suffix = '') {
    const element = $(`#${id}`); element.value = String(sim[key]); if (type === 'check') element.checked = sim[key];
    bindings.push({ element, key, type, suffix });
    element.addEventListener(type === 'check' || element.tagName === 'SELECT' ? 'change' : 'input', () => {
      sim[key] = type === 'check' ? element.checked : type === 'number' ? Number(element.value) : element.value;
      const output = $(`#${id}Value`); if (output) output.textContent = `${sim[key]}${suffix}`;
      if (key === 'clock') { if (!element.value) { element.value = '21:40'; sim.clock = element.value; } sim.clockStart = clock; }
      if (key === 'condition') { sim.variant = 0; syncVariants(); }
      if (['character', 'motion', 'mount', 'amplitude'].includes(key)) { sim.assistant = null; sim.restore = null; }
      if (key === 'character') {
        sim.mouth = sim.character === 'gabe' ? '#36d7dc' : '#f2b6d0'; sim.edge = sim.character === 'gabe' ? '#6824ff' : '#853f66';
        $('#simMouth').value = sim.mouth; $('#simEdge').value = sim.edge;
      }
      if (['faceMode', 'background'].includes(key)) sim.routing = false;
      if (key === 'faceMode' && sim.assistant && sim.restore) sim.restore.faceMode = sim.faceMode;
      if (key === 'enabled' && !sim.enabled || key === 'safety' && sim.safety !== 'normal') { sim.assistant = null; sim.restore = null; }
      update();
    });
  }
  function syncVariants() {
    for (const id of ['simVariant', 'simDashboardVariant']) { $(`#${id}`).replaceChildren(...WEATHER_OPTIONS[sim.condition].map((label, i) => new Option(label, String(i)))); $(`#${id}`).value = String(sim.variant); }
  }
  for (const [id, key] of Object.entries({ simFaceMode: 'faceMode', simWeather: 'condition', simVariant: 'variant', simGame: 'game', simSource: 'source', simBackground: 'background', simBottom: 'bottom', simClock: 'clock', simUnit: 'unit', simBatteryStyle: 'batteryStyle', simCharacter: 'character', simMotion: 'motion', simMount: 'mount', simAmplitude: 'amplitude', simEyes: 'eyes', simGlasses: 'glasses', simHeart: 'heart', simMouth: 'mouth', simEdge: 'edge', simHomeRoute: 'homeRoute', simGameRoute: 'gameRoute', simFaceHome: 'faceHome', simFaceGame: 'faceGame', simSafety: 'safety' })) bind(id, key, key === 'variant' ? 'number' : 'string');
  for (const [id, key, suffix] of [['simBrightness', 'brightness', '%'], ['simNightGain', 'nightGain', '%'], ['simCrop', 'crop', '%'], ['simFaceBrightness', 'faceBrightness', '%'], ['simTemperature', 'temperature', '°C'], ['simNextTemp', 'nextTemp', '°C'], ['simRain', 'rain', '%'], ['simMorning', 'morning', '°C'], ['simAfternoon', 'afternoon', '°C'], ['simP1', 'p1', '%'], ['simP2', 'p2', '%'], ['simMouthWidth', 'mouthWidth', '%']]) bind(id, key, 'number', suffix);
  for (const [id, key] of Object.entries({ simMaster: 'enabled', simNight: 'night', simConnected: 'faceConnected', simExtension: 'extension', simClock24: 'clock24', simP2Enabled: 'showP2' })) bind(id, key, 'check');
  for (const [id, key] of Object.entries({ simDashboardGame: 'game', simDashboardSource: 'source', simDashboardWeather: 'condition', simDashboardVariant: 'variant' })) bind(id, key, key === 'variant' ? 'number' : 'string');
  $('#simConversation').onclick = () => startAssistant('wake', true);
  $$('[data-reaction]').forEach(el => { el.onclick = () => startAssistant(el.dataset.reaction); });
  $('#simCancel').onclick = () => { sim.assistant = null; if (sim.restore) sim.faceMode = sim.restore.faceMode; sim.restore = null; $('#simAssistantStatus').textContent = 'Normal display restored.'; update(); };
  $('#simApplyRoutes').onclick = () => { sim.routing = true; state.controllerWhere = state.weatherWhere = 'off'; state.timerRunning = false; state.overlay = null; state.launchPlaying = false; applyRoutes(); update(); };
  $('#simContext').onclick = () => { state.context = state.context === 'game' ? 'home' : 'game'; if (sim.routing) applyRoutes(); update(); };
  $$('[data-ambience]').forEach(el => { el.onclick = () => {
    const key = el.dataset.ambience; sim.assistant = null; sim.restore = null; sim.faceMode = 'dashboard'; sim.routing = false;
    state.context = key === 'gaming' ? 'game' : 'home'; state.display = key === 'gaming' ? 'artwork' : 'customization';
    state.controllerWhere = state.weatherWhere = 'off'; state.timerRunning = false; state.launchPlaying = false; state.overlay = null;
    sim.background = key === 'gaming' ? 'artwork' : 'weather'; sim.condition = key === 'day' ? 'clear_day' : 'clear_night'; sim.variant = 0;
    state.customPattern = key === 'day' ? 'steady' : 'nocturne'; state.customColours[0] = key === 'day' ? '#ffdca0' : '#6689c8';
    $('#simWeather').value = sim.condition; $('#simBackground').value = sim.background; $('#simFaceMode').value = sim.faceMode;
    syncVariants(); syncCustomizationUI(); update();
  }; });
  function extensionFrame() {
    if (!lastFrame || !sim.faceConnected) return blank();
    // Browser approximation of projecting the source, independent of UI overlays.
    return Array.from({ length: 17 }, (_, n) => {
      const colors = [0, 0, 0]; let count = 0;
      for (let y = 28; y < 45; y++) for (let x = Math.floor(n * W / 17); x < Math.floor((n + 1) * W / 17); x++) {
        const i = (y * W + x) * 4; for (let c = 0; c < 3; c++) colors[c] += lastFrame[i + c]; count++;
      }
      return colors.map(v => Math.round(v / Math.max(1, count)));
    });
  }
  function output() {
    if (!sim.enabled || sim.safety === 'sleep') return { logical: blank(), physical: blank(), name: sim.safety === 'sleep' ? 'Machine asleep' : 'Displays off', readout: 'Simulation only', explain: 'No hardware command is sent. Saved routes and brightness remain unchanged.', badge: 'OFF' };
    if (sim.safety === 'thermal') { const frame = Array.from({ length: 17 }, () => [255, 0, 0]); return { logical: frame, physical: frame, name: 'Critical temperature warning', readout: 'Simulated safety override', explain: 'Fixed red has priority. No real temperature is measured.', badge: 'SAFETY' }; }
    if (sim.safety === 'steam') return { logical: blank(), physical: blank(), name: 'Steam owns the bar', readout: 'Native effect not reproduced', explain: 'The simulator does not invent Valve’s native firmware effects.', badge: 'STEAM' };
    const phase = sessionPhase();
    if (phase) {
      const centre = hexToRgb(sim.mouth), edge = hexToRgb(sim.edge), t = phase.elapsed / 1000;
      const speaking = ['wake', 'question', 'success'].includes(phase.reaction);
      const energy = speaking ? (.32 + .55 * Math.max(0, Math.sin(t * 9)) * (.5 + .5 * Math.sin(t * 3.1) ** 2)) : .20 + .1 * Math.sin(t * 2.4);
      const radius = Math.max(.7, sim.mouthWidth / 100 * 8 * energy);
      const frame = Array.from({ length: 17 }, (_, i) => { const d = Math.abs(i - 8), weight = Math.max(0, 1 - d / radius); return scale(blend(centre, edge, Math.min(1, d / Math.max(1, radius))), weight * energy); });
      return { logical: frame, physical: frame, name: `${sim.character === 'gabe' ? 'Gabe Assistant' : 'GabeCube Companion'} · ${phase.reaction}`, readout: 'Synthetic mouth envelope · no audio', explain: 'The face and Slow Prism temporarily take both displays. Native frame delays are preserved; capture and speech are not running in this visual preview.', badge: 'ASSISTANT' };
    }
    if (sim.routing) {
      applyRoutes(); const route = state.display;
      if (route === 'controller') return controllerFrame();
      if (route === 'weather') return weatherFrame();
    }
    if ((sim.extension || state.display === 'faceplate-extension') && sim.faceConnected && sim.faceMode !== 'off') {
      const frame = extensionFrame(); return { logical: frame, physical: frame, name: 'Faceplate image extension', readout: '17 sampled zones · browser approximation', explain: 'The scene’s lower middle region supplies 17 colour zones, excluding the Dashboard text rows. This is a visual approximation, not the production semantic projection.', badge: 'IMAGE EXTENSION' };
    }
    return null;
  }
  function draw() {
    const visible = sim.faceConnected && (sim.faceMode !== 'off' || sim.assistant) && !['audio-sync', 'screen-sync', 'witcher'].includes(state.tab);
    faceCanvas.hidden = !visible; detail.hidden = !visible;
    if (!visible) return;
    if (clock - lastDrawTime < 50 && sim.generation === Number(faceCanvas.dataset.generation)) return;
    lastDrawTime = clock; faceCanvas.dataset.generation = sim.generation;
    const phaseBeforeDraw = sessionPhase(), sourceEntry = phaseBeforeDraw ? assistantEntry(phaseBeforeDraw.reaction) : assets.weather[`${sim.condition}:${sim.variant}`];
    const drawKey = [sim.generation, sim.faceMode, sourceEntry.src, frameIndex(sourceEntry, phaseBeforeDraw ? phaseBeforeDraw.elapsed : clock), sim.bottom,
      Math.floor((clock - sim.clockStart) / 60000), Math.floor(state.timerRemaining), state.cpu, state.gpu, state.cpuTemp, state.gpuTemp].join(':');
    const frame = drawKey === cachedFrameKey && cachedFrame ? cachedFrame : currentFrame();
    if (drawKey === lastDrawKey && frame) return;
    if (frame) { cachedFrameKey = drawKey; cachedFrame = frame; }
    lastDrawKey = frame ? drawKey : ''; lastFrame = frame;
    const entry = assets.weather[`${sim.condition}:${sim.variant}`];
    const weatherSheet = sheets.get(entry.src), art = images.get(`assets/${sim.game}-${sim.source}.jpg`);
    const usesArtwork = sim.faceMode === 'artwork' || sim.faceMode === 'dashboard' && sim.background === 'artwork';
    const phase = sessionPhase(), assistantSheet = phase && sheets.get(assistantEntry(phase.reaction).src);
    const error = phase ? assistantSheet?.error : usesArtwork ? art?.error : weatherSheet?.error;
    const sourceLabel = usesArtwork ? `${GAME_DATA[sim.game].title} · ${IMAGE_LABELS[sim.source]} · crop ${sim.crop}%` : `${entry.title} · ${entry.scene}`;
    $('#simFaceStatus').textContent = error ? (location.protocol === 'file:' ? 'Serve this folder over HTTP to read native image pixels. The browser blocks file:// canvas reads.' : 'Example unavailable. Reload or choose another source.') : `${sourceLabel} · 64 × 54${usesArtwork ? ' · static artwork' : ` · ${entry.frames} native frames`}`;
    detail.textContent = error ? 'Asset unavailable, no successful rendering is claimed.' : !frame ? 'Loading selected native frames…' : `${sim.assistant ? 'Assistant' : sim.faceMode} · ${sim.assistant ? 'native animation' : sim.faceMode === 'performance' ? 'sample CPU / GPU readings' : sourceLabel} · 64 × 54 · ${sim.faceBrightness}% · illustrative diffuser`;
    const ctx = faceCanvas.getContext('2d'); ctx.fillStyle = '#010409'; ctx.fillRect(0, 0, 640, 540);
    if (!frame || !sim.enabled || sim.safety === 'sleep') return;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, rgb = Array.from(frame.subarray(i, i + 3)).map(v => Math.round(v * sim.faceBrightness / 100));
      ctx.fillStyle = rgb.some(v => v > 0) ? `rgb(${rgb.join(',')})` : '#091019';
      ctx.beginPath(); ctx.arc(x * 10 + 5, y * 10 + 5, 3.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  $('#contextSwitch').addEventListener('click', () => { if (sim.routing) { applyRoutes(); update(); } });
  window.GCAExpansion = {
    output, draw,
    process(out) {
      const gain = sim.brightness / 100 * (sim.night ? sim.nightGain / 100 : 1);
      if (sim.safety === 'thermal') return out;
      return { ...out, logical: out.logical.map(c => scale(c, gain)), physical: (out.physical || out.logical).map(c => scale(c, gain)) };
    },
    selectTab(tab, configure) {
      if (!configure) return;
      if (tab !== 'assistant' && tab !== 'routing') sim.routing = false;
      if (!newTabs.some(([key]) => key === tab)) {
        sim.assistant = null; sim.restore = null; sim.safety = 'normal'; $('#simSafety').value = 'normal';
        if (tab === 'weather') { sim.faceMode = 'weather'; sim.condition = state.weatherCondition; sim.variant = state.weatherVariants[state.weatherCondition]; $('#simWeather').value = sim.condition; $('#simFaceMode').value = sim.faceMode; syncVariants(); update(); }
        return;
      }
      state.overlay = null; state.timerRunning = false; state.launchPlaying = false; state.controllerWhere = state.weatherWhere = 'off';
      if (tab === 'faceplate' && sim.faceMode === 'off') sim.faceMode = 'weather';
      if (tab === 'dashboard') sim.faceMode = 'dashboard';
      if (tab === 'assistant' && sim.faceMode === 'off') sim.faceMode = 'dashboard';
      if (tab === 'assistant') for (const reaction of ['wake', 'listen', 'question', 'success']) loadSheet(assistantEntry(reaction));
      $('#simFaceMode').value = sim.faceMode; update();
    },
    reset() {
      sim = defaults(); sim.clockStart = 0; lastFrame = null; lastDrawKey = ''; lastDrawTime = -1; cachedFrame = null; cachedFrameKey = '';
      for (const { element, key, type, suffix } of bindings) {
        if (type === 'check') element.checked = sim[key]; else element.value = String(sim[key]);
        const output = $(`#${element.id}Value`); if (output) output.textContent = `${sim[key]}${suffix}`;
      }
      syncVariants(); update();
    },
    // Read-only numerical fixtures for regression tests; not a control API.
    inspect: () => ({ ...sim, assistant: sim.assistant ? { ...sim.assistant } : null, restore: sim.restore ? { ...sim.restore } : null, face: lastFrame ? Array.from(lastFrame) : null }),
    fixture: () => dashboard(new Uint8ClampedArray(W * H * 4)),
    frameIndex,
  };
  syncVariants(); update();
  $('#simHomeRoute').value = sim.homeRoute; $('#simGameRoute').value = sim.gameRoute;
  for (const [id, text] of [['displayChoice', 'Faceplate image extension']]) if (!$(`#${id} option[value="faceplate-extension"]`)) $(`#${id}`).add(new Option(text, 'faceplate-extension'));
  if (newTabs.some(([key]) => key === location.hash.slice(1))) openTabFromLocation();
  else if (state.tab === 'weather') window.GCAExpansion.selectTab('weather', true);
})();

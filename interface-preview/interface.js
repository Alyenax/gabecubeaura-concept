/* Documentation-only state machine. No plugin imports, RPC, microphone or device access. */
(() => {
  'use strict';
  const S = globalThis.GCA_INTERFACE_SOURCE, A = globalThis.GCA_SIMULATOR_ASSETS;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const options = list => list.map(v => ({ value: v.data ?? v.value, label: v.label }));
  const GAMES = { witcher: { title: 'The Witcher 3: Wild Hunt', appid: 292030 }, drg: { title: 'Deep Rock Galactic', appid: 548430 }, balatro: { title: 'Balatro', appid: 2379780 } };
  const nav = [['bar', 'Light bar'], ['signals', 'Signals and automation'], ['weather', 'Weather'], ['screensaver', 'Animated Screensaver Studio'], ['faceplate', 'Faceplate displays'], ['artwork', 'Faceplate artwork'], ['updates', 'Updates'], ['advanced', 'Advanced']];
  const groups = { bar: [['routing', 'Display routing'], ['customization', 'Customization+'], ['bar-artwork', 'Light bar artwork colours'], ['performance', 'Performance'], ['screen-sync', 'Screen Sync'], ['audio-sync', 'Audio Sync']], signals: [['assistant', 'Voice assistant'], ['profiles', 'Ambience profiles'], ['events', 'Light events'], ['controllers', 'Controllers'], ['launches', 'Game launches'], ['playtime', 'Playtime']] };
  const titles = Object.fromEntries([...nav, ...Object.values(groups).flat()]);
  const parent = page => groups.bar.some(([id]) => id === page) ? 'bar' : groups.signals.some(([id]) => id === page) ? 'signals' : page;
  const entry = (group, label) => S.groups[group].find(f => f.label === label);
  const custom = (type, label, key, extra = {}) => ({ type, label, key, section: '', description: '', ...extra });
  function fields(group, prefix = '') {
    return S.groups[group].filter(f => f.label !== 'Contextual control').map(f => ({ ...f, key: prefix ? prefix + (f.key || slug(f.label)) : f.key || group + '_' + slug(f.label), source: `${f.file}:${f.line}` }));
  }
  const specialKeys = { 'Faceplate brightness': 'faceplate_brightness', 'Day brightness': 'light_bar_day_brightness', 'Night brightness': 'night_mode_brightness', 'Protect faceplate memory': 'faceplate_flash_protection_enabled' };
  const pages = {
    routing: [...fields('routing'), ...fields('LightBarBrightness')],
    customization: fields('CustomizationPanel'), 'bar-artwork': fields('artwork'), performance: fields('performance'),
    'screen-sync': fields('ScreenSyncPanel'), 'audio-sync': [],
    faceplate: [...fields('pixel-settings'), ...fields('FaceplateBrightnessSlider'), ...fields('PixelStudioWeatherCatalog')],
    artwork: [], screensaver: [], assistant: fields('GabeAssistantPanel', 'assistant.'), profiles: fields('AmbienceProfilesPanel', 'profile.'),
    events: [], controllers: [], launches: fields('launches'), playtime: fields('CountdownPanel'),
    weather: fields('WeatherPanel'), updates: fields('updates'),
    advanced: [...fields('CompatibilityPanel'), ...fields('FlashProtectionPanel').filter(f => f.label !== 'Transfer limits and statistics'), ...fields('advanced')],
  };
  const eventVariants = S.catalogs.EVENT_VARIANTS, controllerVariants = S.catalogs.CONTROLLER_VARIANTS;
  pages.events.push(custom('ToggleField', 'Steam event animations', 'events_enabled', { section: 'Light events', description: entry('EventsPanel', 'Steam event animations').description }));
  for (const [kind, label] of [['notification', 'Notifications'], ['achievement', 'Achievements'], ['screenshot', 'Screenshots']]) {
    pages.events.push(custom('ToggleField', `Show ${label.toLowerCase()}`, `event_${kind}s_enabled`, { section: label }), custom('DropdownItem', 'Animation', `event_${kind}_variant`, { section: label, options: options(eventVariants[kind]) }), custom('ButtonItem', `Preview ${label.toLowerCase()}`, `preview.event.${kind}`, { section: label }));
  }
  pages.events.push(...fields('EventsPanel').filter(f => ['Recording · red start/stop', 'Isolate recording marker'].includes(f.label)), custom('ButtonItem', 'Preview recording starts', 'preview.record-start', { section: 'Recording' }), custom('ButtonItem', 'Preview recording ends', 'preview.record-stop', { section: 'Recording' }));
  pages.controllers.push(...fields('ControllersPanel').filter(f => !['Visual style', 'Preview controller'].includes(f.label)));
  for (const [kind, label] of [['connect', 'Connection'], ['persistent', 'Permanent gauge'], ['low', 'Low battery'], ['charging', 'Charging style'], ['duo', 'Multiple controllers']]) {
    if (['connect', 'low'].includes(kind)) pages.controllers.push(custom('ToggleField', `Show ${label.toLowerCase()}`, `controller_${kind}_enabled`, { section: label }));
    pages.controllers.push(custom('DropdownItem', 'Visual style', `controller_${kind}_variant`, { section: label, options: options(controllerVariants[kind]) }), custom('ButtonItem', `Preview ${label.toLowerCase()}`, `preview.controller.${kind}`, { section: label }));
  }
  pages.controllers.push(custom('DropdownItem', 'Preview controller', 'controller_preview_target', { section: 'Controller battery', options: [1, 2, 3, 4].map(i => ({ value: i, label: `P${i}` })) }));
  pages.advanced.push(custom('DropdownItem', 'TW3-SteamRGB priority', 'tw3_companion_priority', { section: 'Compatibility', options: options(S.constants.COMPANION_PRIORITY_OPTIONS) }), custom('DropdownItem', 'StripMine priority', 'stripmine_companion_priority', { section: 'Compatibility', options: options(S.constants.COMPANION_PRIORITY_OPTIONS) }));
  for (const [key, label] of [['normal', 'Healthy battery'], ['medium', 'Medium battery'], ['low', 'Low battery'], ['charging', 'Charging']]) pages.controllers.push(custom('PreciseColorEditor', label, `controller_colour_${key}`, { section: 'Battery colours' }));
  for (let i = 1; i <= 4; i++) pages.controllers.push(custom('PreciseColorEditor', `Player ${i}`, `controller_player_colour_${i}`, { section: 'Player seat colours' }));
  for (const context of ['home', 'game']) {
    for (const field of fields('AudioContextMapping').filter(f => f.type !== 'PreciseColorEditor')) pages['audio-sync'].push({ ...field, key: `audio_sync_${context}_${slug(field.label)}`, section: context === 'home' ? 'Home pattern and palette' : 'In-game pattern and palette' });
    for (const [i, role] of ['High frequencies · edges', 'Middle frequencies · shoulders', 'Low frequencies · centre'].entries()) pages['audio-sync'].push(custom('PreciseColorEditor', role, `audio_sync_${context}_colour_${i}`, { section: context === 'home' ? 'Home pattern and palette' : 'In-game pattern and palette', when: [`audio_sync_${context}_palette`, 'custom'] }));
  }
  pages['audio-sync'].push(...fields('AudioSyncPanel'), ...fields('HifiCrestLab').map(f => ({ ...f, disclosure: 'Hi-Fi Crest tuning', when: ['audio_sync_hifi_lab_enabled', true] })));
  for (let i = 1; i <= 3; i++) pages.customization.splice(2 + i - 1, 0, custom('PreciseColorEditor', `Colour ${i}`, `customization_colour_${i}`, { section: 'Customization+', minCount: i }));
  pages.customization = pages.customization.filter(f => f.type !== 'PreciseColorEditor' || /^Colour [123]$/.test(f.label));
  for (const [key, label] of [['cool', 'Cool colour'], ['middle', 'Middle colour'], ['hot', 'Hot colour']]) pages.performance.push(custom('PreciseColorEditor', label, `temperature_custom_${key}`, { section: 'Performance', when: ['temperature_palette', 'custom'] }));
  for (let i = 1; i <= 3; i++) pages.launches.push(custom('PreciseColorEditor', `Launch colour ${i}`, `launch_colour_${i}`, { section: 'Game launch animation', when: ['palette_mode', 'custom'], launchCount: i }));
  pages.launches = pages.launches.filter(f => f.label !== 'Preview launch animation' || pages.launches.findIndex(v => v.label === f.label) === pages.launches.indexOf(f));
  const artFields = fields('PixelStudioArtworkPanel', 'studio.').filter(f => !['Your Faceplate library', 'Choose another game', 'Choose a game', 'Search your games'].includes(f.label));
  for (const field of artFields) { field.section = 'Prepare and activate'; if (field.label === 'Personal API key') field.disabled = true; }
  pages.artwork = artFields;
  for (const f of pages.assistant) if (['Voice activation settings', 'Audio and action safeguards', 'Character and lighting details', 'Assistant testing support'].includes(f.disclosure)) f.when = ['assistant.advanced_mode', true];
  for (const f of pages.advanced) if (f.section === 'Update lab · TEST BUILD') f.disclosure = 'Update lab · test-build fixtures';
  for (const [page, list] of Object.entries(pages)) for (const f of list) {
    if (specialKeys[f.label] && !f.key.startsWith('profile.')) f.key = specialKeys[f.label];
    if (f.key === 'day') f.key = 'light_bar_day_brightness'; if (f.key === 'night') f.key = 'night_mode_brightness';
    f.id = `${page}-${slug(f.key)}`; f.page = page;
  }
  function fix(page, label, patch) { const f = pages[page].find(f => f.label === label); if (f) { Object.assign(f, patch); f.id = `${page}-${slug(f.key)}`; } }
  fix('routing', 'Home display', { options: options(S.constants.HOME_DISPLAY_OPTIONS) });
  fix('routing', 'In-game display', { options: options(S.constants.GAME_DISPLAY_OPTIONS) });
  pages.routing.push(custom('DropdownItem', 'Current game override', 'display_override', { page: 'routing', id: 'routing-display_override', section: 'Current game override', options: [{ value: 'inherit', label: 'Use in-game default' }, ...options(S.constants.GAME_DISPLAY_OPTIONS)], inGameOnly: true }));
  fix('faceplate', 'Faceplate CPU/GPU refresh interval', { options: [1, 2, 5, 10, 30, 60].map(v => ({ value: v, label: `${v} s` })) });
  fix('updates', 'Update channel', { key: 'update_channel', options: options(S.constants.UPDATE_CHANNEL_OPTIONS) });
  fix('customization', 'Pattern', { options: S.catalogs.CUSTOMIZATION_PATTERN_ENTRIES.map(v => ({ value: v.data, label: v.label })) });
  fix('launches', 'Pattern', { options: options(S.catalogs.LAUNCH_ARTWORK_PATTERN_OPTIONS) });
  fix('controllers', 'Controllers in preview', { key: 'controller_preview_count', options: [1, 2, 3, 4].map(v => ({ value: v, label: String(v) })) });
  for (const page of ['faceplate', 'weather']) {
    fix(page, page === 'faceplate' ? 'Weather condition' : 'Condition to configure', { key: 'weather_condition', options: options(S.catalogs.WEATHER_CONDITIONS) });
    fix(page, page === 'faceplate' ? 'Animated scene' : 'Animation', { key: 'weather_variant', dynamic: 'weather' });
  }
  fix('weather', 'Top-bar icon family', { options: options(S.catalogs.WEATHER_ICON_STYLE_OPTIONS) });
  fix('assistant', 'Microphone', { options: [{ value: '', label: 'System default microphone (sample)' }, { value: 'usb', label: 'USB headset (sample)' }, { value: 'controller', label: 'Controller microphone, if exposed (sample)' }] });
  fix('assistant', 'Test an installed game without the microphone', { options: Object.entries(GAMES).map(([value, g]) => ({ value, label: g.title })) });
  fix('assistant', 'Colour palette', { key: 'assistant.colour_preset' });
  fix('advanced', 'Français / English', { key: 'ui_french' });
  fix('advanced', 'Protect faceplate memory', { key: 'faceplate_flash_protection_enabled' });
  for (const [label, key] of [['Eye colour', 'eye_color'], ['Glasses colour', 'glasses_color'], ['Companion heart colour', 'companion_color'], ['Mouth centre colour', 'mouth_color'], ['Mouth edge colour', 'mouth_edge_color']]) fix('assistant', label, { key: 'assistant.' + key });
  fix('assistant', 'Melody volume', { labelDynamic: 'volume', max: 150 });
  fix('assistant', 'Prepare and preview character', { description: 'Displays the authored RGB animation below. Appearance controls recolour its semantic palette. No character file is sent to hardware.' });
  const TOGGLES_ON = new Set(['signalbar_enabled', 'faceplate_lab_enabled', 'faceplate_playtime_enabled', 'parental_countdown_enabled', 'events_enabled', 'event_notifications_enabled', 'event_achievements_enabled', 'event_screenshots_enabled', 'event_recording_enabled', 'controller_alerts_enabled', 'controller_connect_enabled', 'controller_low_enabled', 'faceplate_dashboard_show_weather', 'faceplate_dashboard_game_session', 'recording_marker_isolation', 'reverse_led_order', 'faceplate_flash_protection_enabled', 'assistant.trigger_sound', 'assistant.confirm_game_close', 'assistant.duck_listening', 'assistant.companion_banter', 'assistant.beard_shadow']);
  const DEFAULTS = { signalbar_enabled: true, home_display: 'customization', game_display: 'artwork', display_override: 'inherit', display_preset: 'moderate', valve_ownership_policy: 'cooperative', light_bar_day_brightness: 128, night_mode_brightness: 35, customization_colour_count: 2, customization_pattern: 'steady', customization_speed: 50, customization_brightness: 128, customization_colour_1: '#ffd000', customization_colour_2: '#00c8ff', customization_colour_3: '#ff3c9d', 'faceplate.routing.routes.home': 'dashboard', 'faceplate.routing.routes.game': 'artwork', faceplate_dashboard_home_source: 'weather', faceplate_dashboard_bottom_mode: 'next_hour', faceplate_dashboard_clock_format: '24h', faceplate_dashboard_clock_position: 'left', faceplate_dashboard_battery_style: 'percent', faceplate_performance_interval_seconds: 5, faceplate_brightness: 100, faceplate_power_mode: 'auto', weather_condition: 'rain', weather_variant: 0, weather_brightness: 100, weather_temperature_unit: 'celsius', weather_location: '', performance_metric: 'mixed', performance_smoothing: 'balanced', cool_temp_c: 45, hot_temp_c: 78, temperature_palette: 'thermal', free_timer_minutes: 30, countdown_colour: 'white', controller_gauge_brightness: 65, controller_low_threshold: 20, controller_preview_count: 2, controller_preview_target: 1, controller_colour_preset: 'automatic', update_channel: 'stable', 'assistant.character': 'companion', 'assistant.language': 'en', 'assistant.microphone': '', 'assistant.companion_voice': 'v4', 'assistant.companion_response': 'hybrid', 'assistant.companion_motion': 'lively', 'assistant.mount': 'round', 'assistant.emotional_amplitude': 'natural', 'assistant.mouth_width': 40, 'assistant.companion_volume': 70, 'assistant.companion_speech_volume': 100, 'assistant.eye_color': '#66c0f4', 'assistant.glasses_color': '#b4a17b', 'assistant.companion_color': '#a879a8', 'assistant.mouth_color': '#f2b6d0', 'assistant.mouth_edge_color': '#853f66', 'assistant.wake_phrases': 'ok', 'assistant.wake_command_mode': 'separate', 'assistant.beard_shadow_strength': 60, 'studio.what_would_you_like': 'static', 'studio.horizontal_crop': 50, 'studio.vertical_crop': 50, 'studio.saturation': 110, 'studio.brightness': 100, 'studio.loop_ending_cleanup': 'no', 'studio.dashboard_compression': 'compatible', 'studio.apply_to': 'game', 'profile.profile_name': '' };
  const initialValues = () => {
    const result = Object.create(null);
    for (const f of Object.values(pages).flat()) {
      if (f.type === 'ButtonItem') continue;
      result[f.key] = f.type === 'ToggleField' ? TOGGLES_ON.has(f.key) : f.type === 'SliderField' ? Math.max(f.min ?? 0, Math.min(f.max ?? 100, 50)) : f.type === 'PreciseColorEditor' ? '#66c0f4' : f.type === 'DropdownItem' ? f.options?.[0]?.value ?? 0 : '';
    }
    Object.assign(result, DEFAULTS);
    Object.assign(result, { audio_sync_home_pattern: 'slow-prism', audio_sync_game_pattern: 'hifi-crest', audio_sync_home_palette: 'screen-sync', audio_sync_game_palette: 'screen-sync', audio_sync_reactivity: 'balanced', audio_sync_brightness: 160 });
    for (const key of ['light_bar_day_brightness', 'faceplate_brightness', 'night_mode_enabled', 'home_display', 'game_display']) result['profile.' + key] = result[key];
    return result;
  };
  let values = initialValues();
  let gameOverrides = { witcher: 'inherit', drg: 'inherit', balatro: 'inherit' };
  let view = 'quick', page = 'bar', situation = 'game-connected', game = 'witcher', setupStep = 1;
  let library = [{ id: 'sample-witcher', game: 'witcher', mode: 'static', source: 'header' }], selection = 'sample-witcher', prepared = false, preparing = false, progress = 0, studioSource = 'header';
  let profiles = [], selectedProfile = '', apiState = 'absent', githubState = 'disconnected', moduleStates = { speech: false, wake: false, remarks: false, face: false }, facePowered = true;
  let timerDeadline = 0, assistantPhase = '', currentPreview = null, previewTimer = null, jobTimer = null;
  let timerEndAction = 'none', compactAssistantReady = false, compactSpeaking = false;
  let compactLanguage = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'fr', compactVisuals = true;
  const compactText = text => GCACompactPanel.translate(text, compactLanguage);
  const compactSay = text => { compactStatus = text; say(compactText(text)); };
  let compactStatus = 'Maquette interactive · aucune action réelle.';
  const previews = new Map(), artPalettes = new Map(), disclosureStates = new Map(), frameSheets = new Map();
  const isGame = () => situation.startsWith('game-'), connected = () => situation.endsWith('connected') || situation.endsWith('busy'), recent = () => connected() || situation.endsWith('recent');
  function say(message) { $('#action-status').textContent = message; }
  function optionsFor(f) {
    if (f.dynamic === 'weather') return S.catalogs.WEATHER_VARIANTS[values.weather_condition].map((v, i) => ({ value: i, label: v.label }));
    if (f.key === 'controller_preview_target') return Array.from({ length: values.controller_preview_count }, (_, i) => ({ value: i + 1, label: `P${i + 1}` }));
    if (f.key === 'profile.home_display') return options(S.constants.HOME_DISPLAY_OPTIONS);
    if (f.key === 'profile.game_display') return options(S.constants.GAME_DISPLAY_OPTIONS);
    if (f.label === 'Profile') return [{ value: '', label: 'New · capture current settings' }, ...profiles.map(p => ({ value: p.id, label: p.name }))];
    return f.options || [];
  }
  function available(f) {
    if (f.when && values[f.when[0]] !== f.when[1]) return false;
    if (f.inGameOnly && !isGame()) return false;
    if (f.minCount && f.minCount > values.customization_colour_count) return false;
    if (f.launchCount && (f.launchCount > values.launch_artwork_colour_count || values.palette_mode !== 'custom')) return false;
    if (f.key.startsWith('faceplate_dashboard_') && ['faceplate_dashboard_home_source'].includes(f.key) && values['faceplate.routing.routes.home'] !== 'dashboard') return false;
    if (f.key === 'faceplate_performance_interval_seconds' && !['performance', 'dashboard'].includes(values['faceplate.routing.routes.home']) && !['performance', 'dashboard', 'artwork-dashboard'].includes(values['faceplate.routing.routes.game'])) return false;
    if (['faceplate_dashboard_battery_style', 'faceplate_dashboard_show_p2'].includes(f.key) && values.faceplate_dashboard_bottom_mode !== 'controllers' && !values.faceplate_dashboard_game_session) return false;
    if (['faceplate_extension_mapping', 'faceplate_extension_saturation'].includes(f.key) && ![values.home_display, values.game_display, values.display_override].includes('faceplate_extension')) return false;
    if (f.page === 'assistant') {
      const cube = values['assistant.character'] === 'companion';
      if (['assistant.companion_voice', 'assistant.companion_response', 'assistant.companion_spoken_greeting', 'assistant.companion_banter', 'assistant.text_notifications', 'assistant.companion_speech_volume', 'assistant.companion_motion', 'assistant.companion_color'].includes(f.key) && !cube) return false;
      if (['assistant.spoken_greeting', 'assistant.eye_color', 'assistant.glasses_color', 'assistant.mouth_style', 'assistant.mount', 'assistant.emotional_amplitude', 'assistant.beard_shadow', 'assistant.beard_shadow_strength', 'assistant.colour_preset'].includes(f.key) && cube) return false;
      if (f.key === 'assistant.beard_shadow_strength' && !values['assistant.beard_shadow']) return false;
      if (['assistant.wake_phrases', 'assistant.wake_command_mode'].includes(f.key) && !values['assistant.wake_enabled']) return false;
      if (f.key === 'assistant.companion_speech_volume' && values['assistant.companion_response'] === 'musical') return false;
      if (f.label === 'Done speaking · answer now' && assistantPhase !== 'listening') return false;
    }
    if (f.page === 'controllers' && f.section === 'Player seat colours' && values.controller_colour_preset === 'manual' && values.controller_colour_mode !== 'players') return false;
    if (f.key === 'controller_colour_mode' && values.controller_colour_preset === 'automatic') return false;
    if (f.page === 'profiles' && ['profile.light_bar_day_brightness', 'profile.faceplate_brightness', 'profile.night_mode_enabled', 'profile.home_display', 'profile.game_display'].includes(f.key) && !values['profile.edit_profile_details']) return false;
    if (f.page === 'advanced' && ['tw3_steamrgb_integration_enabled', 'stripmine_integration_enabled', 'tw3_companion_priority', 'stripmine_companion_priority'].includes(f.key) && !values.CompatibilityPanel_show_tw3_steamrgb_and_stripmine_controls) return false;
    if (f.page === 'advanced' && ['reverse_led_order', 'countdown_dark_edge_compensation'].includes(f.key) && !values.advanced_show_technical_details) return false;
    if (f.page === 'artwork' && ['Artwork layout', 'Logo position', 'Horizontal crop', 'Vertical crop', 'Saturation', 'Brightness', 'Loop ending cleanup', 'Artwork Dashboard style', 'Dashboard compression'].includes(f.label) && !values['studio.adjust_image']) return false;
    if (f.label === 'Logo position' && values['studio.artwork_layout'] === 'art') return false;
    if (f.label === 'Show P2 when connected' && !values.faceplate_dashboard_game_session && values.faceplate_dashboard_bottom_mode !== 'controllers') return false;
    return true;
  }
  function disabled(f) {
    if (f.label === 'Personal API key') return true;
    if (f.key === 'faceplate_dashboard_clock_position') return values.faceplate_dashboard_show_weather;
    if (f.key === 'night_mode_enabled' && !values.weather_location) return true;
    if (['customization_speed', 'customization_direction'].includes(f.key) && values.customization_pattern === 'steady') return true;
    if (f.label === 'Cancel preparation') return !preparing;
    if (['Use this image', 'Apply to this game'].includes(f.label)) return !prepared || preparing;
    if (f.label === 'Verify SteamGridDB key now' || f.label === 'Forget SteamGridDB key') return apiState === 'absent';
    if (f.label === 'I authorized this device' && githubState !== 'pending') return true;
    if (f.label === 'Stop personal limit' && !timerDeadline) return true;
    if (f.label === 'Prepare preview' && (preparing || values['studio.what_would_you_like'] === 'animated_any' && isGame())) return true;
    return false;
  }
  function labelFor(f) {
    if (f.labelDynamic === 'volume') return values['assistant.character'] === 'companion' ? 'Melody volume' : 'Assistant audio volume';
    if (f.label === 'Stop assistant') return assistantPhase ? 'Stop assistant' : 'Try assistant';
    if (f.label === 'Accurate speech recognition installed') return moduleStates.speech ? 'Accurate speech recognition installed (simulated)' : 'Install speech recognition · allow 2 GB free';
    if (f.label === 'Voice activation installed') return moduleStates.wake ? 'Voice activation installed (simulated)' : 'Install or update hands-free activation';
    if (f.label.startsWith('Prepared remarks installed')) return moduleStates.remarks ? 'Prepared remarks installed (simulated)' : 'Install prepared remarks · 7.2 MB';
    if (f.label === 'Character ready') return moduleStates.face ? 'Character ready (simulated)' : 'Prepare character';
    if (f.label === 'Replace SteamGridDB key') return 'Use example SteamGridDB key';
    if (f.label === 'Turn faceplate on') return facePowered ? 'Turn faceplate off' : 'Turn faceplate on';
    if (f.label === 'Return to Lab 114') return 'Return to previous Lab';
    return f.label;
  }
  function fieldHTML(f) {
    const id = f.id, label = labelFor(f), val = values[f.key], off = disabled(f), attr = `${off ? 'disabled' : ''} data-setting="${escape(f.key)}" id="${escape(id)}"`;
    let control = '', before = `<label for="${escape(id)}">${escape(label)}</label>`, after = '';
    if (f.type === 'ToggleField') control = `<input ${attr} type="checkbox" role="switch" ${val ? 'checked' : ''}>`;
    if (f.type === 'DropdownItem') control = `<select ${attr}>${optionsFor(f).map(v => `<option value="${escape(v.value)}" ${String(val) === String(v.value) ? 'selected' : ''}>${escape(v.label)}</option>`).join('')}</select>`;
    if (f.type === 'SliderField') { control = `<output for="${escape(id)}">${escape(val)}${escape(f.suffix || '')}</output>`; after = `<input ${attr} type="range" min="${f.min ?? 0}" max="${f.page === 'assistant' && f.labelDynamic === 'volume' && values['assistant.character'] === 'companion' ? 100 : f.max ?? 100}" step="${f.step ?? 1}" value="${escape(val)}">`; }
    if (f.type === 'TextField') control = `<input ${attr} type="text" value="${f.label === 'Personal API key' ? 'EXAMPLE ONLY · do not paste a real key' : escape(val)}" maxlength="120" autocomplete="off">`;
    if (f.type === 'ButtonItem') { before = `<span class="label">${escape(label)}</span>`; control = `<button id="${escape(id)}" data-action="${escape(f.key)}" ${off ? 'disabled' : ''}>${escape(actionCaption(f))}</button>`; }
    if (f.type === 'PreciseColorEditor') {
      const hex = /^#[0-9a-f]{6}$/i.test(val) ? val : '#66c0f4', rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
      before = `<span class="label">${escape(label)}</span>`;
      after = `<div class="color-controls"><input ${attr} type="color" value="${hex}" aria-label="${escape(label)}"><input type="text" data-hex="${escape(f.key)}" value="${hex.toUpperCase()}" maxlength="7" aria-label="${escape(label)} hexadecimal"><div class="rgb-controls">${rgb.map((v, i) => `<label>${'RGB'[i]}<input type="number" min="0" max="255" value="${v}" data-rgb="${escape(f.key)}" data-channel="${i}" aria-label="${escape(label)} ${'RGB'[i]}"></label>`).join('')}</div></div>`;
    }
    let description = f.label === 'Personal API key' ? 'This public preview never accepts, stores or verifies real credentials. Use the example-key button to explore the states.' : f.description;
    if (f.page === 'artwork' && f.label === 'Show different artwork') description = 'Cycles through the bundled Header, Hero and Capsule. No SteamGridDB search is performed here.';
    if (f.page === 'artwork' && f.label === 'Prepare preview') description = values['studio.what_would_you_like'] === 'animated_any' && isGame() ? 'Animated preparation requires no running game. Switch Situation to Home to rehearse it. No actual conversion runs.' : 'Rehearses preparation with a percentage. No download, image conversion or GIF encoding runs.';
    if (f.key === 'night_mode_brightness') description = `${val}% of Day brightness · ${Math.max(1, Math.round(values.light_bar_day_brightness * val / 100))}/255. Global brightness is independent of display routes.`;
    return `<div class="settings-row" data-field="${escape(f.key)}"><div class="row-main ${f.type === 'ToggleField' ? 'switch-row' : ''}">${before}${control}</div>${after}${description ? `<p class="hint">${escape(description)}</p>` : ''}</div>`;
  }
  function actionCaption(f) {
    const label = labelFor(f).toLowerCase();
    if (label.includes('installed') || label.includes('character ready')) return 'Ready · simulated';
    if (label.startsWith('install')) return 'Simulate install';
    if (label.startsWith('try assistant')) return 'Try'; if (label.startsWith('stop assistant')) return 'Stop';
    if (f.label === 'Personal limit') return 'Start / restart';
    for (const [word, text] of [['cancel', 'Cancel'], ['prepare', 'Prepare'], ['apply', 'Apply'], ['use ', 'Use'], ['save', 'Save'], ['delete', 'Delete'], ['confirm deletion', 'Delete'], ['duplicate', 'Duplicate'], ['create', 'Create'], ['preview', 'Preview'], ['verify', 'Verify'], ['forget', 'Forget'], ['reset', 'Reset'], ['export', 'Export JSON'], ['import', 'Import JSON'], ['check', 'Check'], ['find', 'Find'], ['connect', 'Connect'], ['disconnect', 'Disconnect'], ['stop', 'Stop'], ['power', 'Power'], ['turn faceplate', facePowered ? 'Power off' : 'Power on'], ['restore', 'Restore'], ['download', 'Simulate'], ['done speaking', 'Done'], ['listen', 'Preview'], ['replace steamgriddb', 'Use example']]) if (label.startsWith(word)) return text;
    return 'Open';
  }
  function renderFields(container, list) {
    const sectionMap = new Map();
    for (const f of list.filter(available)) {
      const dis = f.disclosure || '', sec = f.section || titles[page] || 'Settings', key = dis + '|' + sec;
      if (!sectionMap.has(key)) sectionMap.set(key, { dis, sec, fields: [] }); sectionMap.get(key).fields.push(f);
    }
    const disclosures = new Map();
    for (const { dis, sec, fields: rows } of sectionMap.values()) {
      let target = container;
      if (dis) {
        if (!disclosures.has(dis)) { const node = document.createElement('details'); node.className = 'disclosure'; node.dataset.disclosure = `${page}:${dis}`; node.open = disclosureStates.get(node.dataset.disclosure) === true; node.innerHTML = `<summary>${escape(dis)}</summary>`; node.addEventListener('toggle', () => disclosureStates.set(node.dataset.disclosure, node.open)); container.append(node); disclosures.set(dis, node); }
        target = disclosures.get(dis);
      }
      const node = document.createElement('section'); node.className = 'settings-group'; node.innerHTML = `<h2>${escape(sec)}</h2>${rows.map(fieldHTML).join('')}`; target.append(node);
    }
  }
  function navigate(next, detail = null) { view = 'settings'; page = detail || next; currentPreview = null; render(); $('#settings-content h1')?.focus({ preventScroll: true }); }
  function shell() {
    $$('[data-compact-text]').forEach(el => { el.textContent = compactText(el.dataset.compactText); });
    $('#quick-panel').lang = compactLanguage;
    $('#compact-demo-options').lang = compactLanguage;
    $('#compact-language').value = compactLanguage;
    $('#compact-visuals').checked = compactVisuals;
    $('#open-settings').setAttribute('aria-label', compactText('Réglages'));
    $('#preview-view').value = view; $('#preview-situation').value = situation; $('#preview-game').value = game;
    $('#product').classList.toggle('settings', view !== 'quick'); $('#quick-panel').hidden = view !== 'quick'; $('#settings-shell').hidden = view !== 'settings'; $('#setup-content').hidden = view !== 'setup';
    $('#back-quick').hidden = view === 'quick'; $('#open-settings').hidden = view !== 'quick';
    $('#compact-demo-options').hidden = view !== 'quick';
    $('#compact-assistant-ready').checked = compactAssistantReady;
    $('#compact-assistant-speak').hidden = !compactAssistantReady;
    $('#compact-assistant-speak').disabled = compactSpeaking || !values['assistant.enabled'];
    $('#sidebar').innerHTML = nav.map(([id, label]) => `<button data-nav="${id}" ${parent(page) === id ? 'aria-current="page"' : ''}>${label}</button>`).join('');
  }
  function currentRoute() { return !values.signalbar_enabled ? 'off' : values.steam_control_enabled ? 'steam' : isGame() ? values.display_override === 'inherit' ? values.game_display : values.display_override : values.home_display; }
  const routeLabel = route => [...S.constants.HOME_DISPLAY_OPTIONS, ...S.constants.GAME_DISPLAY_OPTIONS, { data: 'off', label: 'Displays off' }, { data: 'steam', label: 'Steam control' }].find(v => v.data === route)?.label || route;
  function quick() {
    const faceKey = isGame() ? 'faceplate.routing.routes.game' : 'faceplate.routing.routes.home';
    const repaint = (message, focus) => { quick(); GCACompactPanel.restoreFocus($('#quick-panel'), focus); compactSay(message); };
    GCACompactPanel.render($('#quick-panel'), {
      enabled: values.signalbar_enabled, brightness: values.light_bar_day_brightness, preset: values.display_preset,
      language:compactLanguage, visuals:compactVisuals, artwork:`../assets/${game}-header.jpg`, game: isGame() ? GAMES[game].title : '',
      timer: {deadline:timerDeadline, minutes:values.free_timer_minutes, endAction:timerEndAction},
      assistant: {ready:compactAssistantReady, enabled:values['assistant.enabled'], speaking:compactSpeaking},
      faceplate: {visible:recent(), connected:connected(), busy:situation.endsWith('busy'), powered:facePowered, route:values[faceKey]}
    }, {
      dialog:confirmDialog,
      enabled: value => { values.signalbar_enabled = value; repaint(value ? 'Éclairage activé · choix conservés.' : 'Éclairage coupé · minuteur et micro inchangés.', 'enabled'); },
      brightness: value => { values.light_bar_day_brightness = value; palettePreview(); compactSay('Luminosité modifiée dans la maquette uniquement.'); },
      ambience: value => { values.display_preset = value; applyPreset(value); repaint('Ambiance modifiée · luminosité conservée.', 'ambience'); },
      microphone: value => { values['assistant.enabled'] = value; if (!value) compactSpeaking = false; $('#compact-assistant-speak').disabled = !value || compactSpeaking; repaint(value ? 'Écoute simulée activée. Aucun micro ouvert.' : 'Micro de l’assistant coupé dans la maquette.', 'microphone'); },
      silence: () => { compactSpeaking = false; $('#compact-assistant-speak').disabled = false; repaint('Réponse arrêtée · écoute inchangée.', 'microphone'); },
      faceplate: value => { facePowered = value !== 'off'; if (facePowered) values[faceKey] = value; repaint('Affichage JSAUX modifié dans la maquette. Aucun transfert.', 'faceplate'); },
      startTimer: (minutes, endAction) => { values.free_timer_minutes = minutes; timerEndAction = endAction; timerDeadline = Date.now() + minutes * 60000; repaint('Minuteur démarré dans la maquette. Aucune action réelle.', 'extend'); },
      extendTimer: () => { timerDeadline += 15 * 60000; repaint('15 minutes ajoutées au minuteur simulé.', 'extend'); },
      stopTimer: () => { timerDeadline = 0; timerEndAction = 'none'; repaint('Minuteur arrêté · action de fin annulée.', 'timer'); },
      openGame: () => navigate('routing')
    });
    if (compactVisuals) palettePreview();
  }
  async function artworkPalette() {
    const src = `../assets/${game}-header.jpg`; if (artPalettes.has(src)) return artPalettes.get(src);
    const image = new Image(); image.src = src; await image.decode(); const c = document.createElement('canvas'); c.width = image.naturalWidth; c.height = image.naturalHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0); const row = ctx.getImageData(0, Math.floor(c.height * .6), c.width, 1).data;
    const colors = Array.from({ length: 17 }, (_, n) => { const start = Math.floor(n * c.width / 17), end = Math.floor((n + 1) * c.width / 17), rgb = [0, 0, 0]; for (let x = start; x < end; x++) for (let k = 0; k < 3; k++) rgb[k] += row[x * 4 + k]; return rgb.map(v => Math.round(v / (end - start))); }); artPalettes.set(src, colors); return colors;
  }
  async function palettePreview() {
    const key = game; let rgb;
    try { rgb = await artworkPalette(); } catch { rgb = Array.from({ length: 17 }, () => [45, 100, 120]); }
    if (key !== game) return;
    const route = currentRoute(), gain = values.light_bar_day_brightness / 255;
    if (route === 'customization') { const hex = values.customization_colour_1; rgb = Array.from({ length: 17 }, () => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))); }
    if (['off', 'displays_off', 'bar_off', 'blackout', 'steam'].includes(route)) rgb = rgb.map(() => [0, 0, 0]);
    $$('[data-bar-palette] i').forEach((el, i) => { el.style.backgroundColor = `rgb(${rgb[i % 17].map(v => Math.round(v * gain)).join(',')})`; });
  }
  function sampleNote(html, warning = false) { return `<div class="sample-note${warning ? ' warning' : ''}">${html}</div>`; }
  function pageHeading(container, title, back) { container.innerHTML = `<div class="page-heading"><h1>${escape(title)}</h1>${back ? `<button data-back="${back}">Back to ${escape(titles[back])}</button>` : ''}</div>`; }
  function settings() {
    const container = $('#settings-content'); pageHeading(container, titles[page] || page, groups[parent(page)] && page !== parent(page) ? parent(page) : null);
    if (page === 'screensaver') { const mount=document.createElement('div'); mount.id='studio-root';container.append(mount); window.GCAStudioDemo.mount(mount);return; }
    if (groups[page]) { const p = document.createElement('p'); p.className = 'group-description'; p.textContent = page === 'bar' ? 'Choose a display, adjust its appearance or set the global brightness. Changes below stay in this preview.' : 'Configure the assistant, profiles and the temporary signals that can take over your displays.'; container.append(p); for (const [id, title] of groups[page]) { const row = document.createElement('div'); row.className = 'group-link'; row.innerHTML = `<span>${title}</span><button data-open="${id}">Open</button>`; container.append(row); } return; }
    if (page === 'artwork') { artworkPage(container); return; }
    if (page === 'profiles') { profilesPage(container); return; }
    if (page === 'assistant') container.insertAdjacentHTML('beforeend', sampleNote('All commands, modules and microphone states below are examples. No audio is captured or played. <b>Downloads are simulated, not real installations.</b>'));
    if (page === 'weather') container.insertAdjacentHTML('beforeend', sampleNote(`Location: <b>${escape(values.weather_location || 'Not selected')}</b> · example 12°C · rain. No weather service is queried.<span class="weather-icon-sample" role="img" aria-label="Selected top-bar icon family">${S.catalogs.WEATHER_ICON_SVGS[values.weather_icon_style || 'current'][values.weather_condition]}</span>`));
    if (page === 'faceplate') container.insertAdjacentHTML('beforeend', sampleNote(`Faceplate: <b>${connected() ? 'connected (sample)' : 'not connected (sample)'}</b> · SteamGridDB: <b>${apiLabel()}</b>. No serial writes occur.`) + '<section class="settings-group"><h2>Faceplate memory protection</h2><details class="disclosure"><summary>Transfer limits and statistics</summary><p class="hint">Upload protection is on · Sample counters: 4 confirmed new GIF transfers this session. One animated GIF is one transfer, not one transfer per frame. Physical endurance remains unknown. Change upload protection in Advanced. No hardware transaction is confirmed by this preview.</p></details></section>');
    if (page === 'updates') container.insertAdjacentHTML('beforeend', sampleNote(`Installed example: Lab 131. GitHub: <b>${githubState === 'authorized' ? 'example connection only' : githubState}</b>. This page cannot install, roll back or authenticate.`));
    if (page === 'advanced') container.insertAdjacentHTML('beforeend', sampleNote('Diagnostics stay here, not under Faceplate displays. Exported files contain only this preview’s sample settings. No real log is read or sent.'));
    renderFields(container, pages[page] || []);
    if (['faceplate', 'weather', 'assistant', 'customization', 'events', 'controllers', 'launches', 'playtime', 'performance', 'bar-artwork', 'screen-sync', 'audio-sync'].includes(page)) container.insertAdjacentHTML('beforeend', `<canvas class="native-preview" data-native width="640" height="540" hidden aria-label="64 by 54 native visual example"></canvas><p class="preview-caption" data-preview-caption></p><div class="palette" data-bar-palette aria-label="Example 17-LED palette">${'<i></i>'.repeat(17)}</div>`);
    if (page === 'assistant') glossary(container);
    if (page === 'screen-sync' || page === 'audio-sync') container.insertAdjacentHTML('beforeend', sampleNote(`No PipeWire or Gamescope connection exists here. <a href="../#${page}" target="_blank" rel="noopener noreferrer">Use the lighting simulator for actual bundled gameplay analysis ↗</a>`));
    if (page === 'bar-artwork') container.insertAdjacentHTML('beforeend', `<div class="art-detail"><img src="../assets/${game}-header.jpg" alt="Sample game artwork"></div>`);
    if (page === 'playtime') container.insertAdjacentHTML('beforeend', `<p class="hint" data-timer-status>${timerDeadline ? 'Example personal timer is active.' : 'No countdown is active.'}</p>`);
    if (page === 'weather' || page === 'routing') container.insertAdjacentHTML('beforeend', `<div class="toolbar" data-city-results></div>`);
    if (page === 'faceplate') container.insertAdjacentHTML('beforeend', `<p class="hint">Artwork Dashboard Home assignment: ${library.find(v => v.home) ? escape(GAMES[library.find(v => v.home).game].title) : 'none yet. Choose an artwork from the library first.'}</p>`);
    palettePreview();
  }
  function apiLabel() { return { absent: 'Key missing', detected: 'Example key detected locally · not verified', verified: 'Simulated verification succeeded · no API request', rejected: 'Simulated key rejection', offline: 'Simulated offline verification' }[apiState]; }
  function artworkPage(container) {
    container.insertAdjacentHTML('beforeend', sampleNote('A safe local rehearsal of the complete Artwork workflow. Three bundled games replace your installed-game inventory. Search, preparation and assignments below are simulated; no SteamGridDB request or GIF encoding runs.'));
    container.insertAdjacentHTML('beforeend', `<details class="disclosure" data-library open><summary>Your Faceplate library · ${library.length} saved</summary><div>${library.length ? library.map(item => `<div class="library-item" data-library-id="${escape(item.id)}"><img src="../assets/${item.game}-${item.source}.jpg" alt="${escape(GAMES[item.game].title)}"><div><strong>${escape(GAMES[item.game].title)}</strong><small>${item.mode === 'animated_any' ? 'Animated source example' : 'Static artwork'}${item.home ? ' · Dashboard Home' : ''}${item.active ? ' · active for game' : ''}</small><div class="library-actions"><button data-library-use="${escape(item.id)}">Use for this game</button><button data-library-home="${escape(item.id)}">Use for Dashboard Home</button><button class="danger" data-library-delete="${escape(item.id)}">Delete</button></div></div></div>`).join('') : '<p class="empty-state">No saved artwork. Prepare an example below.</p>'}</div></details>
      <section class="settings-group"><h2>1 · Choose an installed game (sample inventory)</h2><label class="hint" for="game-search">Search your games</label><input id="game-search" type="search" placeholder="Search three bundled examples" value=""><div class="game-grid">${Object.entries(GAMES).map(([id, g]) => `<button class="art-card" data-art-game="${id}" aria-pressed="${game === id}"><img src="../assets/${id}-header.jpg" alt=""><strong>${escape(g.title)}</strong><span>Installed · sample AppID ${g.appid}</span></button>`).join('')}</div></section>
      <section class="settings-group"><h2>2 · Choose artwork</h2><div class="row-main"><label for="studio-source">Source image</label><select id="studio-source"><option value="header" ${studioSource === 'header' ? 'selected' : ''}>Header</option><option value="hero" ${studioSource === 'hero' ? 'selected' : ''}>Horizontal Hero</option><option value="capsule" ${studioSource === 'capsule' ? 'selected' : ''}>Vertical Capsule</option></select></div><div class="art-detail"><img id="selected-artwork" src="../assets/${game}-${studioSource}.jpg" alt="Selected ${escape(GAMES[game].title)} artwork"></div></section>`);
    renderFields(container, pages.artwork.filter(f => !['Use for this game', 'Use for Dashboard Home', 'Delete from library'].includes(f.label)));
    container.insertAdjacentHTML('beforeend', `<div class="progress-label" role="status" id="preparation-status">${preparing ? `Simulated preparation: ${progress}%` : prepared ? 'Example prepared. You may now choose where to apply it.' : 'Not prepared. Existing artwork stays active.'}</div><div class="progress-track"><span id="preparation-progress"></span></div><canvas class="native-preview" data-native width="640" height="540" hidden aria-label="Native artwork example"></canvas><p class="preview-caption" data-preview-caption></p>`);
    $('#preparation-progress').style.width = progress + '%';
  }
  function profilesPage(container) {
    container.insertAdjacentHTML('beforeend', sampleNote('Profiles are managed in Signals and automation, never in the quick Decky panel. These examples exist only until this preview is reset.'));
    renderFields(container, pages.profiles);
    if (profiles.length) container.insertAdjacentHTML('beforeend', `<p class="hint">Saved examples: ${profiles.map(v => escape(v.name)).join(', ')}</p>`);
  }
  function glossary(container) {
    const group = document.createElement('details'); group.className = 'disclosure'; group.dataset.disclosure = 'assistant:glossary'; group.open = disclosureStates.get(group.dataset.disclosure) === true;
    group.innerHTML = `<summary>Voice command glossary · ${values['assistant.language'] === 'fr' ? 'French' : 'English'}</summary><p class="hint">All names work: Gabe, Gaby, Gaben, Cube, GabeCube. Choose Ok, Hey or both in Activation and microphone.</p>${S.catalogs.GABE_COMMANDS.map(g => `<h3>${escape(g.label)}</h3><p class="hint">${escape(g.note)}</p><ul class="command-list">${g[values['assistant.language'] === 'fr' ? 'fr' : 'en'].map(s => `<li>${escape(s)}</li>`).join('')}</ul>`).join('')}`;
    group.addEventListener('toggle', () => disclosureStates.set(group.dataset.disclosure, group.open)); container.append(group);
  }
  function setup() {
    const container = $('#setup-content'); container.innerHTML = `<h1>Welcome to GabeCubeAura</h1><div class="setup-steps">${['Choose a preset', 'Brightness and location', 'Review and finish'].map((t, i) => `<span class="${setupStep === i + 1 ? 'current' : ''}">${i + 1} · ${t}</span>`).join('')}</div>`;
    if (setupStep === 1) { container.insertAdjacentHTML('beforeend', '<p class="group-description">Choose a starting point. Detailed settings remain reversible.</p>'); renderFields(container, pages.routing.filter(f => f.key === 'display_preset')); }
    if (setupStep === 2) renderFields(container, pages.routing.filter(f => ['light_bar_day_brightness', 'night_mode_brightness', 'night_mode_enabled'].includes(f.key) || ['City or postal code', 'Country (optional)', 'Find city'].includes(f.label)));
    if (setupStep === 3) container.insertAdjacentHTML('beforeend', sampleNote(`Preset: <b>${escape(values.display_preset)}</b><br>Home: ${escape(routeLabel(values.home_display))}<br>In game: ${escape(routeLabel(values.game_display))}<br>Day brightness: ${values.light_bar_day_brightness}/255 · Night: ${values.night_mode_brightness}%<br>This will finish the example only. Your real plugin is unchanged.`));
    container.insertAdjacentHTML('beforeend', `<div class="toolbar">${setupStep > 1 ? '<button data-setup-back>Back</button>' : ''}<button class="primary" data-setup-next>${setupStep === 3 ? 'Finish example setup' : 'Continue'}</button></div><div data-city-results></div>`);
  }
  function render() {
    window.GCAStudioDemo?.unmount();
    clearTimeout(previewTimer); previewTimer = null; currentPreview = null; previewGeneration++;
    shell(); if (view === 'quick') quick(); else if (view === 'setup') setup(); else settings();
  }
  function confirmDialog(title, body, action, warning = false) {
    const dialog = $('#preview-dialog'); $('#dialog-title').textContent = title; $('#dialog-title').classList.toggle('warning-title', warning);
    dialog.returnValue = ''; dialog.querySelector('button[value="cancel"]').textContent = 'Cancel';
    $('#dialog-body').innerHTML = body; $('#dialog-confirm').textContent = warning ? 'I understand · use this example' : 'Confirm';
    dialog.addEventListener('close', () => { if (dialog.returnValue === 'confirm') { if (title === 'Reset the browser preview?') window.GCAStudioDemo?.reset(); action(); } }, { once: true }); dialog.showModal();
  }
  function riskReview(action) {
    confirmDialog('Experimental Faceplate CPU/GPU updates', '<p>CPU/GPU information requires repeatedly uploading new GIFs to persistent Faceplate memory. Hardware endurance is unknown.</p><p>Default refresh: <b>5 seconds</b>, adjustable down to <b>1 second</b>. Accepted CPU/GPU updates bypass the 120-per-hour GIF limit.</p><p class="risk-red">You enable this experimental feature at your own risk. Frequent writes may cause irreversible wear or failure. No hardware lifetime or recovery is guaranteed.</p><p>This is a simulated confirmation. Nothing is uploaded.</p>', () => { values.performance_risk_accepted = true; action(); render(); say('Risk accepted for this browser example only.'); }, true);
  }
  function setValue(key, value, element = null) {
    const field = Object.values(pages).flat().find(f => f.key === key);
    if (!field) return;
    const old = values[key];
    if (['faceplate.routing.routes.home', 'faceplate.routing.routes.game'].includes(key) && value === 'performance' && !values.performance_risk_accepted) { if (element) element.value = old; riskReview(() => { values[key] = value; }); return; }
    if (key === 'faceplate_dashboard_home_source' && value === 'artwork' && !library.some(v => v.home)) { if (element) element.value = old; say('Choose a saved artwork and Use for Dashboard Home first.'); return; }
    values[key] = value;
    if (key === 'display_override') gameOverrides[game] = value;
    if (key === 'weather_condition') values.weather_variant = 0;
    if (key === 'controller_preview_count') values.controller_preview_target = Math.min(values.controller_preview_target, Number(value));
    if (key === 'display_preset') applyPreset(value);
    if (key.startsWith('studio.')) { prepared = false; if (preparing) cancelJob(); }
    if (key === 'assistant.character') { values['assistant.mouth_color'] = value === 'companion' ? '#f2b6d0' : '#36d7dc'; values['assistant.mouth_edge_color'] = value === 'companion' ? '#853f66' : '#6824ff'; }
    if (key === 'assistant.colour_preset' && value !== 'custom') {
      const palettes = { champagne: ['#85e6e5', '#b4a17b'], plum: ['#c09ff5', '#9675a5'], ocean: ['#66c0f4', '#437a9b'], ember: ['#ffc86b', '#973d17'], classic: ['#66c0f4', '#b4a17b'] };
      if (palettes[value]) [values['assistant.eye_color'], values['assistant.glasses_color']] = palettes[value];
    }
    if (key === 'profile.profile') {
      selectedProfile = value; const p = profiles.find(p => p.id === value); if (p) { values['profile.profile_name'] = p.name; for (const [k, v] of Object.entries(p.values)) values['profile.' + k] = v; }
    }
    say(`Example setting saved: ${labelFor(field)}. Your real plugin is unchanged.`);
    if (field.type === 'SliderField' || field.type === 'TextField' || field.type === 'PreciseColorEditor') {
      const row = element?.closest('.settings-row'); if (row?.querySelector('output')) row.querySelector('output').textContent = value + (field.suffix || '');
      if (field.type === 'PreciseColorEditor') syncColorInputs(key, value);
      if (key === 'light_bar_day_brightness' || key === 'night_mode_brightness') palettePreview();
      return;
    }
    const scroll = window.scrollY; render(); window.scrollTo({ top: scroll, behavior: 'instant' });
    const next = [...document.querySelectorAll('[data-setting]')].find(el => el.dataset.setting === key); next?.focus({ preventScroll: true });
  }
  function syncColorInputs(key, hex) {
    $$('[data-setting],[data-hex]').filter(el => (el.dataset.setting || el.dataset.hex) === key).forEach(el => { el.value = el.dataset.hex ? hex.toUpperCase() : hex; });
    $$('[data-rgb]').filter(el => el.dataset.rgb === key).forEach(el => { el.value = parseInt(hex.slice(1 + Number(el.dataset.channel) * 2, 3 + Number(el.dataset.channel) * 2), 16); });
    palettePreview();
  }
  function applyPreset(preset) {
    const combos = { moderate: ['customization', 'artwork'], atmosphere: ['weather', 'artwork'], signals: ['controller', 'performance'], immersive: ['audio_sync', 'screen_sync'], 'immersive-plus': ['audio_sync', 'audio_sync'], festive: ['audio_sync', 'audio_sync'], focus: ['customization', 'customization'], essential: ['blackout', 'bar_off'], 'lights-out': ['blackout', 'displays_off'] };
    if (combos[preset]) [values.home_display, values.game_display] = combos[preset];
  }
  function saveArtwork() {
    const id = `sample-${game}-${studioSource}-${values['studio.what_would_you_like']}`;
    let item = library.find(i => i.id === id);
    if (!item) { item = { id, game, source: studioSource, mode: values['studio.what_would_you_like'] }; library.push(item); }
    selection = id;
    const target = values['studio.apply_to'];
    if (['game', 'game-dashboard', 'both'].includes(target)) { for (const i of library) if (i.game === game) i.active = i.id === id; values['faceplate.routing.routes.game'] = target === 'game-dashboard' ? 'artwork-dashboard' : 'artwork'; }
    if (['home', 'both'].includes(target)) { for (const i of library) i.home = i.id === id; values.faceplate_dashboard_home_source = values['studio.dashboard_home_after_preparation']; values['faceplate.routing.routes.home'] = 'dashboard'; }
    say('Prepared example saved and assigned locally. No hardware delivery is claimed.'); render();
  }
  function cancelJob() { clearInterval(jobTimer); jobTimer = null; preparing = false; progress = 0; }
  function prepare() {
    if (preparing) return; preparing = true; prepared = false; progress = 0; render();
    say('Simulated preparation started. No source download or GIF conversion occurs.');
    jobTimer = setInterval(() => {
      progress = Math.min(100, progress + 20);
      if ($('#preparation-progress')) $('#preparation-progress').style.width = progress + '%';
      if ($('#preparation-status')) $('#preparation-status').textContent = `Simulated preparation: ${progress}%`;
      if (progress === 100) { clearInterval(jobTimer); jobTimer = null; preparing = false; prepared = true; if (page === 'artwork') render(); say('Example prepared. Apply it to a game or Dashboard Home. No GIF was encoded.'); }
    }, 180);
  }
  function moduleInstall(kind) { moduleStates[kind] = true; render(); say(`${kind} module marked ready in the example. No files or models were downloaded.`); }
  function downloadSample(kind) {
    const payload = kind === 'settings' ? { format: 'gabecubeaura-interface-preview', revision: 1, settings: values } : { format: 'gabecubeaura-interface-preview-diagnostic', source_commit: S.source_commit, simulated: true, page, situation, keys_excluded: true };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `gabecubeaura-preview-${kind}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); say('Downloaded a browser-example JSON only. No real configuration or diagnostic was read.');
  }
  function profileSave(name = values['profile.profile_name']) {
    name = String(name || '').trim().slice(0, 60); if (!name) { say('Give the example profile a name first.'); return; }
    const p = profiles.find(v => v.id === selectedProfile) || { id: `profile-${Date.now()}`, name, values: {} };
    p.name = name; for (const key of ['light_bar_day_brightness', 'faceplate_brightness', 'night_mode_enabled', 'home_display', 'game_display']) p.values[key] = values['profile.' + key] ?? values[key];
    if (!profiles.includes(p)) profiles.push(p); selectedProfile = p.id; values['profile.profile'] = p.id; render(); say('Example profile saved in this page only.');
  }
  async function action(key) {
    const f = Object.values(pages).flat().find(f => f.key === key), label = f?.label || key;
    if (label === 'Apply recommended shared tuning') {
      const pattern = values[key.includes('_home_') ? 'audio_sync_home_pattern' : 'audio_sync_game_pattern'];
      const tuning = { 'slow-prism': [180, 'fast'], 'hifi-crest': [160, 'balanced'], 'velvet-relay': [184, 'fast'], 'negative-bloom': [192, 'fast'], 'stereo-lanterns': [172, 'balanced'], constellation: [205, 'fast'], spectrum: [190, 'fast'], spatial: [170, 'balanced'], bass: [185, 'fast'], 'audio-pulse': [168, 'balanced'] }[pattern] || [160, 'balanced'];
      [values.audio_sync_brightness, values.audio_sync_reactivity] = tuning; render(); say('Recommended Audio Sync example tuning applied. Global Light bar brightness is unchanged.'); return;
    }
    if (key.startsWith('preview.event.')) { previewBar('event', values[`event_${key.split('.').pop()}_variant`]); return; }
    if (key.startsWith('preview.controller.')) { previewBar('controller', key.split('.').pop()); return; }
    if (key.startsWith('preview.record-')) { previewBar('event', key.split('.')[1]); return; }
    if (['Choose an Artwork Dashboard', 'Open Pixel Studio Artwork'].includes(label)) { navigate('artwork'); return; }
    if (label === 'Review CPU/GPU memory warning') { riskReview(() => {}); return; }
    if (['Log in to SteamGridDB', 'Open API keys in the system browser'].includes(label)) { window.open('https://www.steamgriddb.com/profile/preferences/api', '_blank', 'noopener,noreferrer'); say('Opened SteamGridDB outside the preview. No key is read here.'); return; }
    if (label === 'Replace SteamGridDB key') { apiState = 'detected'; render(); say('Example key detected locally, not verified. No credential stored.'); return; }
    if (label === 'Verify SteamGridDB key now') { apiState = 'verified'; render(); say('Simulated verification only. No API request was made.'); return; }
    if (label === 'Forget SteamGridDB key') { apiState = 'absent'; render(); say('Example key removed. Saved artwork is kept.'); return; }
    if (label === 'Turn faceplate on') { facePowered = !facePowered; render(); say('Faceplate power changed in this example only.'); return; }
    if (label === 'Find city') { const target = $('[data-city-results]') || $('#settings-content'); target.innerHTML = target === $('#settings-content') ? target.innerHTML : ''; target.insertAdjacentHTML('beforeend', `<button data-city="Paris, France">Paris, France · sample result</button><button data-city="Seattle, United States">Seattle, United States · sample result</button>`); say('Two fixed city examples. No search request was sent.'); return; }
    if (label === 'Remove city') { values.weather_location = ''; values.night_mode_enabled = false; render(); say('Example city removed.'); return; }
    if (label === 'Change city') { say('Use the city fields below; results are fixed examples.'); return; }
    if (label === 'Personal limit') { timerEndAction = 'none'; timerDeadline = Date.now() + Number(values.free_timer_minutes) * 60000; render(); say(`Example timer started for ${values.free_timer_minutes} minutes.`); return; }
    if (label === 'Stop personal limit') { timerDeadline = 0; timerEndAction = 'none'; render(); say('Example timer stopped.'); return; }
    if (label === 'Test countdown and final alert') { previewBar('countdown'); return; }
    if (label === 'Accurate speech recognition installed') { moduleInstall('speech'); return; }
    if (label === 'Voice activation installed') { moduleInstall('wake'); return; }
    if (label.startsWith('Prepared remarks installed')) { moduleInstall('remarks'); return; }
    if (label === 'Character ready') { moduleInstall('face'); return; }
    if (label === 'Stop assistant') {
      if (assistantPhase) { assistantPhase = ''; currentPreview = null; render(); say('Example conversation cancelled. No action was executed.'); return; }
      if (!values['assistant.enabled'] || !moduleStates.speech || !moduleStates.face) { say('Enable the example assistant, simulate installing speech recognition and prepare its character first.'); return; }
      assistantPhase = 'listening'; render(); await nativePreview('assistant', 'listen'); say('Simulated listening. The microphone remains closed. Use Done speaking to advance the example.'); return;
    }
    if (label === 'Done speaking · answer now') { assistantPhase = ''; await nativePreview('assistant', 'success'); say('Example command accepted. No Steam action executed. Normal route will resume in the real plugin.'); return; }
    if (['Prepare and preview character', 'Listen to assistant'].includes(label)) { await nativePreview('assistant', values['assistant.preview_reaction'] || 'listen'); say('Silent native character preview. No voice playback.'); return; }
    if (label === 'Test microphone · 3 seconds') { confirmDialog('Microphone test is not connected', '<p>No microphone permission is requested by this public page. This control demonstrates where the test lives in the installed plugin.</p><p>Sample result: input signal present, no clipping. This is not a measurement of your microphone.</p>', () => say('Microphone example shown. No audio was captured.')); return; }
    if (label === 'Find connected microphones') { say('Showing fixed microphone examples, not devices detected on this computer.'); return; }
    if (label === 'Restore output sound') { say('Example output unmuted. No system volume setting was changed.'); return; }
    if (label === 'Manage ambience profiles') { navigate('profiles'); return; }
    if (label === 'Reset assistant and modules') { confirmDialog('Reset example assistant and modules?', '<p>This clears the simulated module readiness and assistant choices. No installed files are removed.</p>', () => { moduleStates = { speech: false, wake: false, remarks: false, face: false }; for (const k of Object.keys(values)) if (k.startsWith('assistant.')) values[k] = initialValues()[k]; render(); say('Example assistant reset. Install is available again.'); }); return; }
    if (label === 'Prepare preview') { prepare(); return; }
    if (label === 'Cancel preparation') { cancelJob(); prepared = false; render(); say('Example preparation cancelled. Previous artwork kept.'); return; }
    if (['Use this image', 'Apply to this game'].includes(label)) { if (prepared) saveArtwork(); return; }
    if (label === 'Show different artwork') { studioSource = ({ header: 'hero', hero: 'capsule', capsule: 'header' })[studioSource]; prepared = false; render(); say('Showing another bundled image; no SteamGridDB search.'); return; }
    if (label === 'Pause animation') { say('The selected source is static. Use an animated weather/assistant preview to inspect motion. Animated SteamGridDB results are not fetched here.'); return; }
    if (label === 'Preview Artwork in-game') { await nativePreview(values['studio.preview'] === 'weather-dashboard' ? 'weather-dashboard' : values['studio.preview'] === 'dashboard' ? 'dashboard' : 'artwork'); return; }
    if (['Preview this animation', 'Preview Realistic on Faceplate'].includes(label)) { await nativePreview('weather'); return; }
    if (label === 'Preview Customization+') { previewBar('customization'); return; }
    if (label === 'Preview launch animation') { previewBar('launch'); return; }
    if (label.includes('Preview') || label.startsWith('Preview')) { previewBar(page); return; }
    if (label === 'Check installed game library') { say('Three fixed installed-game examples. Your Steam library was not scanned.'); return; }
    if (label === 'Launch the selected game') { confirmDialog('Simulate launching a game?', `<p>${escape(GAMES[values['assistant.test_an_installed_game_without_the_microphone']]?.title || GAMES[game].title)} would be passed to Steam by AppID.</p><p>No URI or launch command is sent by this page.</p>`, () => say('Example launch acknowledged. No game was launched.')); return; }
    if (label === 'Connect GitHub') { githubState = 'pending'; render(); say('Example device code: DEMO-ONLY. No authentication request is sent.'); return; }
    if (label === 'I authorized this device') { githubState = 'authorized'; render(); say('Example GitHub connection only. No account is connected.'); return; }
    if (label === 'Disconnect Private Lab') { githubState = 'disconnected'; render(); say('Example GitHub connection removed.'); return; }
    if (label === 'Open GitHub device authorization') { confirmDialog('GitHub authorization example', '<p>The installed plugin opens GitHub’s device flow. This preview does not generate a code or connect an account.</p>', () => say('Authorization example inspected.')); return; }
    if (['Check for updates', 'Check again'].includes(label)) { say('Simulated check: example Lab 121 selected. No release endpoint was queried.'); return; }
    if (label === 'View release notes') { confirmDialog('Example release notes · Lab 131', '<p>Animated Screensaver Studio: collection, preview, preparation and settings. Optional independent Faceplate framing and prepared GIF preview.</p><p>Illustrative local text, not a live release check.</p>', () => {}); return; }
    if (['Download update', 'Restore', 'Return to Lab 114', 'Prepare previous version'].includes(label)) { confirmDialog('Simulated update or rollback', '<p>This rehearses the confirmation only. No archive is downloaded, plugin replaced or Decky service restarted.</p>', () => say('Example update/rollback completed. Installed software is unchanged.')); return; }
    if (label === 'Dismiss update error') { say('Example error dismissed.'); return; }
    if (label === 'Export configuration JSON') { downloadSample('settings'); return; }
    if (label === 'Import configuration JSON') { $('#import-file').click(); return; }
    if (['Export a local diagnostic', 'Export test report'].includes(label)) { downloadSample('diagnostic'); return; }
    if (label.includes('diagnostic') || label.includes('Diagnostic')) { say('Simulated redacted diagnostic. No logs were read or uploaded.'); return; }
    if (label === 'Reset to defaults') { confirmDialog('Reset example settings?', '<p>This restores this browser preview only, preserving the page’s sample artwork library and profiles.</p>', () => { values = initialValues(); gameOverrides = { witcher: 'inherit', drg: 'inherit', balatro: 'inherit' }; render(); say('Example settings reset. Your plugin is unchanged.'); }); return; }
    if (label.startsWith('Create Evening') || label.startsWith('Create Day')) { selectedProfile = ''; profileSave(label.includes('Evening') ? 'Evening' : 'Day'); return; }
    if (label === 'Save changes') { profileSave(); return; }
    if (label === 'Try selected profile') { const p = profiles.find(v => v.id === selectedProfile); if (!p) { say('Choose or save a profile first.'); return; } Object.assign(values, p.values); render(); say(`Applied example profile ${p.name}. No plugin change.`); return; }
    if (label === 'Restore automatic mode') { say('Example automatic routing restored. Saved profiles are kept.'); return; }
    if (label === 'Duplicate selected profile') { const p = profiles.find(v => v.id === selectedProfile); if (!p) { say('Choose a profile first.'); return; } selectedProfile = ''; profileSave(p.name + ' copy'); return; }
    if (label.startsWith('Confirm deletion')) { confirmDialog('Delete example profile?', '<p>Saved current settings are kept. This deletes only the selected browser example.</p>', () => { profiles = profiles.filter(p => p.id !== selectedProfile); selectedProfile = ''; values['profile.profile'] = ''; render(); say('Example profile deleted.'); }); return; }
    say(`${label}: example action completed locally. No system, service or hardware operation was performed.`);
  }
  async function loadSheet(entry) {
    if (!frameSheets.has(entry.src)) frameSheets.set(entry.src, (async () => { const img = new Image(); img.src = '../' + entry.src; await img.decode(); const c = document.createElement('canvas'); c.width = 64; c.height = entry.frames * 54; const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0); return ctx.getImageData(0, 0, c.width, c.height).data; })());
    return frameSheets.get(entry.src);
  }
  let previewGeneration = 0;
  async function nativePreview(kind, reaction = 'listen') {
    const generation = ++previewGeneration, canvas = $('[data-native]'); if (!canvas) return;
    const caption = $('[data-preview-caption]'); canvas.hidden = false; caption.textContent = 'Loading selected native example…';
    let entry;
    if (kind === 'assistant') {
      const cube = values['assistant.character'] === 'companion'; const r = ({ listening: 'listen', happy: 'success', attentive: 'listen' })[reaction] || reaction;
      entry = A.assistant[cube ? `companion-${values['assistant.companion_motion']}-${r}` : `gabe-${values['assistant.mount']}-${values['assistant.emotional_amplitude']}-${r === 'question' ? 'question' : r === 'success' ? 'happy' : 'listening'}`];
    } else if (kind === 'weather' || kind === 'weather-dashboard') entry = A.weather[`${values.weather_condition}:${values.weather_variant}`];
    let pixels;
    try {
      if (entry) pixels = await loadSheet(entry);
      else { const image = new Image(); image.src = `../assets/${game}-${studioSource}.jpg`; await image.decode(); const c = document.createElement('canvas'); c.width = 64; c.height = 54; const ctx = c.getContext('2d', { willReadFrequently: true }); const ratio = 64 / 54, sw = Math.min(image.naturalWidth, image.naturalHeight * ratio), sh = sw / ratio; const x = (image.naturalWidth - sw) * Number(values['studio.horizontal_crop'] ?? 50) / 100, y = (image.naturalHeight - sh) * Number(values['studio.vertical_crop'] ?? 50) / 100; ctx.drawImage(image, x, y, sw, sh, 0, 0, 64, 54); pixels = ctx.getImageData(0, 0, 64, 54).data;
        const saturation = Number(values['studio.saturation']) / 100, brightness = Number(values['studio.brightness']) / 100;
        for (let i = 0; i < pixels.length; i += 4) { const luma = pixels[i] * .2126 + pixels[i + 1] * .7152 + pixels[i + 2] * .0722; for (let k = 0; k < 3; k++) pixels[i + k] = Math.max(0, Math.min(255, Math.round((luma + (pixels[i + k] - luma) * saturation) * brightness))); }
      }
    } catch { caption.textContent = 'The bundled example could not be loaded. No successful hardware preview is claimed.'; return; }
    if (generation !== previewGeneration || !canvas.isConnected) return;
    const start = performance.now(), ctx = canvas.getContext('2d'), total = entry ? entry.delays.reduce((a, b) => a + b, 0) : 1000;
    function draw() {
      if (generation !== previewGeneration || !canvas.isConnected) return;
      let t = entry?.loop ? (performance.now() - start) % total : Math.min(total - 1, performance.now() - start), index = 0;
      if (entry) for (; index < entry.frames - 1; index++) { if (t < entry.delays[index]) break; t -= entry.delays[index]; }
      let raw = new Uint8ClampedArray(pixels.subarray(index * 54 * 64 * 4, (index + 1) * 54 * 64 * 4));
      if (kind === 'dashboard' || kind === 'weather-dashboard') raw = overlayExample(raw);
      if (kind === 'weather') exampleNotch(raw);
      const recoloring = new Map();
      if (kind === 'assistant' && entry?.palette) for (let i = 0; i < entry.palette.length; i++) {
        const item = entry.palette[i], old = entry.rendered_palette[i]; let target = item.rgb;
        const field = item.part === 'eyes' ? 'eye_color' : item.part === 'glasses' ? 'glasses_color' : null;
        if (field) { const base = field === 'eye_color' ? [102, 192, 244] : [180, 161, 123], axis = base.indexOf(Math.max(...base)), color = values['assistant.' + field]; target = [1, 3, 5].map(k => Math.min(255, Math.floor(parseInt(color.slice(k, k + 2), 16) * item.rgb[axis] / base[axis] + .5))); }
        if (item.beard_shadow && values['assistant.beard_shadow']) target = item.rgb.map(c => Math.max(c ? 1 : 0, Math.floor(c * (item.beard_shadow === 'edge' ? .8 : values['assistant.beard_shadow_strength'] / 100) + .5)));
        if (['heart_canonical', 'heart_pink', 'heart_flashy'].includes(item.part) && values['assistant.companion_color'] !== '#a879a8') { const sourceRed = { heart_canonical: 168, heart_pink: 240, heart_flashy: 255 }[item.part], gain = item.rgb[0] / sourceRed * { heart_canonical: 1, heart_pink: 1.2, heart_flashy: 1.5 }[item.part], color = values['assistant.companion_color']; target = [1, 3, 5].map(k => Math.min(255, Math.round(parseInt(color.slice(k, k + 2), 16) * gain))); }
        recoloring.set(old.join(','), target);
      }
      ctx.fillStyle = '#010409'; ctx.fillRect(0, 0, 640, 540);
      for (let y = 0; y < 54; y++) for (let x = 0; x < 64; x++) { const i = (y * 64 + x) * 4, key = `${raw[i]},${raw[i + 1]},${raw[i + 2]}`, rgb = recoloring.get(key) || Array.from(raw.subarray(i, i + 3)); ctx.fillStyle = `rgb(${rgb.join(',')})`; ctx.beginPath(); ctx.arc(x * 10 + 5, y * 10 + 5, 3.6, 0, Math.PI * 2); ctx.fill(); }
      caption.textContent = `${kind === 'assistant' ? values['assistant.character'] === 'companion' ? 'Companion' : 'Gabe' : entry ? entry.title : GAMES[game].title} · ${kind.includes('dashboard') ? 'Dashboard overlay · ' : ''}64 × 54 native pixels${entry ? ` · ${entry.frames} frames · ${entry.loop ? 'authored loop' : 'one-shot gesture'}` : ' · local artwork crop'} · no hardware transfer`;
      if (entry && (entry.loop || performance.now() - start < total)) previewTimer = setTimeout(draw, 50);
    }
    currentPreview = kind; draw();
  }
  function put(frame, x, y, rgb) { if (x >= 0 && x < 64 && y >= 0 && y < 54) frame.set([...rgb, 255], (y * 64 + x) * 4); }
  function box(frame, x, y, w, h, rgb) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) put(frame, xx, yy, rgb); }
  function nativeText(frame, x, y, text, rgb) { for (const c of String(text).toUpperCase()) { const rows = A.font[c] || A.font['?']; rows.forEach((row, yy) => [...row].forEach((bit, xx) => { if (bit === '1') put(frame, x + xx, y + yy, rgb); })); x += rows[0].length + 1; } }
  function exampleNotch(frame) {
    const C = A.colors; box(frame, 38, 1, 25, 9, C.NOTCH_BACKGROUND); box(frame, 37, 2, 27, 7, C.NOTCH_BACKGROUND); box(frame, 38, 0, 25, 1, C.NOTCH_BORDER); box(frame, 38, 10, 25, 1, C.NOTCH_BORDER);
    for (const [x, y] of [[37, 1], [63, 1], [37, 9], [63, 9]]) put(frame, x, y, C.NOTCH_BORDER);
    for (const [x, y, color] of A.notch_icons[values.weather_condition]) put(frame, x, y, color);
    nativeText(frame, 47, 3, values.weather_temperature_unit === 'fahrenheit' ? '54°F' : '12°C', C.TEMPERATURE_AMBER);
  }
  function overlayExample(frame) {
    const C = A.colors; box(frame, 0, 0, 24, 10, [1, 5, 14]); nativeText(frame, 2, 3, values.faceplate_dashboard_clock_format === '12h' ? '9:40' : '21:40', C.WARM_WHITE);
    if (values.faceplate_dashboard_show_weather) exampleNotch(frame);
    box(frame, 0, 45, 64, 9, C.RAIL_BACKGROUND); box(frame, 0, 45, 64, 1, C.RAIL_BORDER);
    if (values.faceplate_dashboard_bottom_mode === 'controllers') { nativeText(frame, 2, 48, values.faceplate_dashboard_show_p2 ? 'P2 64%' : 'P1 87%', C.PLAYER_TWO); if (values.faceplate_dashboard_show_p2) nativeText(frame, 39, 48, 'P1 87%', C.PLAYER_ONE); }
    else if (values.faceplate_dashboard_bottom_mode === 'today') { for (const [x, y, rgb] of A.icons[values.weather_condition]) put(frame, 8 + x, 48 + y, rgb); nativeText(frame, 20, 48, '9°C', C.MORNING_BLUE); nativeText(frame, 33, 48, '/', C.SEPARATOR_GREY); nativeText(frame, 39, 48, '14°C', C.AFTERNOON_ORANGE); }
    else { nativeText(frame, 2, 48, '+1H', C.WARM_WHITE); for (const [x, y, rgb] of A.icons[values.weather_condition]) put(frame, 16 + x, 47 + y, rgb); nativeText(frame, 26, 48, '13°', C.WARM_WHITE); for (const [x, y, rgb] of A.icons.rain) put(frame, 41 + x, 47 + y, rgb); nativeText(frame, 51, 48, '80%', C.PLAYER_ONE); }
    return frame;
  }
  function previewBar(kind, variant = '') {
    const slots = $$('[data-bar-palette] i'); if (!slots.length) return;
    let tick = 0; clearTimeout(previewTimer);
    const draw = () => { if (!slots[0].isConnected) return; tick++; const color = kind === 'customization' ? [1, 3, 5].map(i => parseInt(values.customization_colour_1.slice(i, i + 2), 16)) : kind === 'event' && variant.includes('achievement') ? [255, 196, 73] : kind === 'countdown' ? [255, 230, 180] : [90, 205, 235]; slots.forEach((el, i) => { const n = i % 17, level = kind === 'customization' && values.customization_pattern === 'steady' ? 1 : Math.max(0, 1 - Math.abs(n - (tick % 32 <= 16 ? tick % 32 : 32 - tick % 32)) / 4); el.style.backgroundColor = `rgb(${color.map(v => Math.round(v * level)).join(',')})`; }); if (tick < 48) previewTimer = setTimeout(draw, 60); else { palettePreview(); say('Local illustrative bar preview finished. For exact choreography use the lighting simulator.'); } };
    say(`${kind} example is illustrative. The complete lighting simulator remains the motion reference.`); draw();
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.nav) navigate(button.dataset.nav);
    if (button.dataset.open) navigate(button.dataset.open);
    if (button.dataset.back) navigate(button.dataset.back);
    if (button.dataset.action) await action(button.dataset.action);
    if (button.hasAttribute('data-refresh')) say('Example status refreshed. No hardware query was made.');
    if (button.hasAttribute('data-power')) { facePowered = !facePowered; render(); say('Example Faceplate power changed.'); }
    if (button.dataset.artGame) { if (preparing) cancelJob(); game = button.dataset.artGame; values.display_override = gameOverrides[game] || 'inherit'; prepared = false; render(); }
    if (button.dataset.city) { values.weather_location = button.dataset.city; values.night_mode_enabled = true; render(); say('Example city chosen. No network search.'); }
    if (button.dataset.libraryDelete) confirmDialog('Delete this saved example?', '<p>It disappears immediately from the browser library. No original artwork file is deleted.</p>', () => { library = library.filter(i => i.id !== button.dataset.libraryDelete); if (!library.some(i => i.home)) values.faceplate_dashboard_home_source = 'weather'; render(); say('Example artwork deleted. Library updated immediately.'); });
    if (button.dataset.libraryHome) { for (const i of library) i.home = i.id === button.dataset.libraryHome; values.faceplate_dashboard_home_source = 'artwork'; render(); say('Example assigned to Dashboard Home.'); }
    if (button.dataset.libraryUse) { const item = library.find(i => i.id === button.dataset.libraryUse); if (item) { for (const i of library) if (i.game === item.game) i.active = i.id === item.id; game = item.game; values.display_override = gameOverrides[game] || 'inherit'; values['faceplate.routing.routes.game'] = 'artwork'; render(); say('Example artwork assigned to its game.'); } }
    if (button.hasAttribute('data-setup-next')) { if (setupStep === 3) { view = 'quick'; setupStep = 1; render(); say('Example setup completed. No real settings changed.'); } else { setupStep++; render(); } }
    if (button.hasAttribute('data-setup-back')) { setupStep--; render(); }
  });
  document.addEventListener('input', event => {
    const el = event.target;
    if (el.matches('[data-setting]') && el.tagName !== 'SELECT' && el.type !== 'checkbox') setValue(el.dataset.setting, el.type === 'range' ? Number(el.value) : el.value, el);
    if (el.dataset.hex && /^#[0-9a-f]{6}$/i.test(el.value)) setValue(el.dataset.hex, el.value.toLowerCase(), el);
    if (el.dataset.rgb) { const key = el.dataset.rgb, rgb = [1, 3, 5].map(i => parseInt(values[key].slice(i, i + 2), 16)); rgb[Number(el.dataset.channel)] = Math.max(0, Math.min(255, Number(el.value) || 0)); setValue(key, '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join(''), el); }
    if (el.id === 'game-search') $$('[data-art-game]').forEach(card => { card.hidden = !GAMES[card.dataset.artGame].title.toLowerCase().includes(el.value.toLowerCase()); });
  });
  document.addEventListener('change', event => {
    const el = event.target;
    if (el.matches('[data-setting]') && (el.tagName === 'SELECT' || el.type === 'checkbox')) { const f = Object.values(pages).flat().find(f => f.key === el.dataset.setting), opts = optionsFor(f); const chosen = opts.find(v => String(v.value) === el.value); setValue(el.dataset.setting, el.type === 'checkbox' ? el.checked : chosen?.value ?? el.value, el); }
    if (el.hasAttribute('data-quick-master')) { values.signalbar_enabled = el.checked; render(); say('Example master state changed. Saved routes kept.'); }
    if (el.hasAttribute('data-quick-override')) { values.display_override = el.value; gameOverrides[game] = el.value; render(); say(`Example override saved for ${GAMES[game].title}.`); }
    if (el.id === 'studio-source') { if (preparing) cancelJob(); studioSource = el.value; prepared = false; render(); }
  });
  $('#preview-view').onchange = e => { view = e.target.value; render(); };
  $('#preview-situation').onchange = e => { situation = e.target.value; render(); };
  $('#preview-game').onchange = e => { if (preparing) cancelJob(); game = e.target.value; values.display_override = gameOverrides[game] || 'inherit'; prepared = false; render(); };
  $('#open-settings').onclick = () => navigate('bar'); $('#back-quick').onclick = () => { view = 'quick'; render(); };
  $('#compact-language').onchange = event => { compactLanguage = event.target.value; render(); compactSay(compactStatus); };
  $('#compact-visuals').onchange = event => { compactVisuals = event.target.checked; render(); compactSay(compactVisuals ? 'Aperçus activés · aucune action réelle.' : 'Aperçus masqués · raccourcis conservés.'); };
  $('#compact-assistant-ready').onchange = event => { compactAssistantReady = event.target.checked; compactSpeaking = false; render(); compactSay(compactAssistantReady ? 'Assistant configuré pour cet exemple seulement.' : 'Raccourci assistant masqué.'); };
  $('#compact-assistant-speak').onclick = () => { compactSpeaking = true; render(); compactSay('Réponse vocale simulée, sans lecture audio. « Faire taire » arrête la réponse sans couper le micro.'); };
  $('#reset-preview').onclick = () => confirmDialog('Reset the browser preview?', '<p>Reset example settings, library, profiles and module states. Your real plugin, files and accounts are unaffected.</p>', () => { cancelJob(); values = initialValues(); gameOverrides = { witcher: 'inherit', drg: 'inherit', balatro: 'inherit' }; library = [{ id: 'sample-witcher', game: 'witcher', mode: 'static', source: 'header' }]; profiles = []; selectedProfile = ''; apiState = 'absent'; githubState = 'disconnected'; moduleStates = { speech: false, wake: false, remarks: false, face: false }; timerDeadline = 0; timerEndAction = 'none'; compactAssistantReady = false; compactSpeaking = false; assistantPhase = ''; view = 'quick'; facePowered = true; prepared = false; render(); say('Browser example reset. No plugin settings changed.'); });
  $('#import-file').onchange = async event => {
    const file = event.target.files[0]; if (!file) return;
    try { if (file.size > 100000) throw Error('File too large'); const data = JSON.parse(await file.text()); if (data.format !== 'gabecubeaura-interface-preview' || data.revision !== 1 || typeof data.settings !== 'object' || !data.settings) throw Error('Use an exported preview file, not a real plugin configuration');
      const patch = Object.create(null); for (const [key, val] of Object.entries(data.settings)) { if (!Object.hasOwn(values, key)) continue; const f = Object.values(pages).flat().find(f => f.key === key); if (!f || f.type === 'ButtonItem') continue; if (f.type === 'ToggleField' && typeof val === 'boolean' || f.type === 'SliderField' && Number.isFinite(val) && val >= (f.min ?? 0) && val <= (f.max ?? 100) || f.type === 'TextField' && typeof val === 'string' && val.length <= 120 && f.label !== 'Personal API key' || f.type === 'PreciseColorEditor' && /^#[0-9a-f]{6}$/i.test(val) || f.type === 'DropdownItem' && optionsFor(f).some(o => o.value === val)) patch[key] = val; }
      confirmDialog('Import browser-example settings?', '<p>Only recognised preview fields will be applied. No real plugin settings are read or changed.</p>', () => { Object.assign(values, patch); render(); say('Example configuration imported.'); });
    } catch (error) { say(`Import refused: ${error.message}`); } finally { event.target.value = ''; }
  };
  $('#coverage-content').innerHTML = `<p>Reference: Lab 131, ${S.source_commit.slice(0, 7)}. All eight sidebar sections, twelve grouped pages and the first-run flow are browsable. Control labels, option lists and ranges are extracted from the actual source.</p><ul><li>Animated Screensaver Studio renders the actual React component and shared player. Its four spaces include independent Faceplate framing, prepared GIF preview, and simulated preparation, tools and Steam installation.</li><li>Local state: routes, colours with HEX/RGB, assistant setup, profiles, artwork library, assignments, preparation progress, warnings, updates and diagnostics.</li><li>Conditional controls and advanced groups are inspectable. Preview deletes and assignments update immediately.</li><li>Hardware/service actions use labelled sample outcomes, never successful real-device claims. Native visual examples use existing prepared RGB frames.</li><li>Administration and model downloads are rehearsals only. No real API key, login, network diagnostic, microphone, game command or hardware transaction occurs.</li><li>The lighting simulator remains separate for full effect choreography and media analysis.</li></ul>`;
  window.GCAInterfacePreview = { navigate, inspect: () => ({ view, page, situation, game, settings: { ...values }, library: library.map(i => ({ ...i })), profiles: profiles.map(p => ({ ...p })), apiState, moduleStates: { ...moduleStates }, prepared, preparing, compact:{assistantReady:compactAssistantReady,speaking:compactSpeaking,facePowered,timerDeadline,timerEndAction} }), pages: () => Object.fromEntries(Object.entries(pages).map(([id, fs]) => [id, fs.map(f => ({ label: f.label, key: f.key, type: f.type, source: f.source || null }))])) };
  window.GCAInterfacePreview.exampleKey = value => { if (['absent','detected','verified'].includes(value)) apiState=value; };
  setInterval(() => {
    if (!timerDeadline) return;
    const seconds = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
    const el = $('[data-timer-status]'); if (el) el.textContent = seconds ? `Example timer: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} remaining.` : 'Example timer finished.';
    GCACompactPanel.tick($('#quick-panel'), timerDeadline);
    if (!seconds) { const end = timerEndAction; timerDeadline = 0; timerEndAction = 'none'; if (view === 'quick') quick(); compactSay(end === 'none' ? 'Minuteur terminé.' : `Minuteur terminé · ${end === 'sleep' ? 'mise en veille' : 'extinction'} simulée uniquement.`); }
  }, 1000);
  if (new URLSearchParams(location.search).get('page') === 'screensaver') { view='settings';page='screensaver';situation='home-connected'; }
  render();
  compactSay(compactStatus);
})();

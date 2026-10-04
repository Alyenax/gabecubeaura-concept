/* GabeCubeAura Concept Lab: a browser-only visual simulator, not the plugin runtime. */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const OFF = [0, 0, 0];
const WHITE = [246, 249, 255];
const CYAN = [67, 214, 225];
const ICE = [215, 240, 250];
const BLUE = [55, 132, 205];
const GOLD = [255, 196, 73];
const CHAMPAGNE = [255, 238, 170];
const PINK = [245, 98, 166];
const RED = [229, 54, 70];
const GREEN = [0, 180, 45];
const GAME_DATA = {
  drg: { title: "Deep Rock Galactic", id: "548430" },
  witcher: { title: "The Witcher 3: Wild Hunt", id: "292030" },
  balatro: { title: "Balatro", id: "2379780" },
};
const IMAGE_LABELS = { hero: "Library Hero", header: "Library Header", capsule: "Library Capsule" };
// Browsers display local file:// images but forbid reading their pixels back from canvas.
// These values are generated from the bundled samples and are only used for that security fallback.
const SAMPLE_ARTWORK_PALETTES = {
  "drg:hero": { 2: [[69, 48, 23], [198, 154, 86]], 3: [[56, 39, 18], [144, 104, 51], [236, 195, 118]] },
  "drg:header": { 2: [[52, 60, 39], [162, 154, 91]], 3: [[50, 58, 38], [131, 157, 123], [217, 135, 16]] },
  "drg:capsule": { 2: [[42, 57, 55], [165, 149, 94]], 3: [[42, 56, 54], [129, 169, 143], [203, 123, 33]] },
  "witcher:hero": { 2: [[204, 226, 223], [94, 89, 93]], 3: [[219, 240, 236], [150, 168, 170], [82, 72, 76]] },
  "witcher:header": { 2: [[202, 223, 219], [86, 77, 79]], 3: [[213, 234, 230], [148, 156, 156], [65, 54, 57]] },
  "witcher:capsule": { 2: [[77, 62, 65], [206, 223, 218]], 3: [[56, 38, 43], [220, 241, 234], [134, 128, 127]] },
  "balatro:hero": { 2: [[156, 62, 58], [29, 80, 118]], 3: [[50, 51, 61], [183, 69, 63], [33, 126, 199]] },
  "balatro:header": { 2: [[56, 37, 44], [198, 191, 190]], 3: [[41, 40, 49], [197, 196, 196], [165, 22, 18]] },
  "balatro:capsule": { 2: [[69, 64, 84], [186, 180, 190]], 3: [[66, 52, 64], [100, 122, 159], [214, 197, 197]] },
};
const PALETTES = {
  classic: ["#00b42d", "#f1ca25", "#e83b39"],
  thermal: ["#24c5e7", "#f2a724", "#e52239"],
  icefire: ["#287beb", "#a65be8", "#f98ac1"],
};
const AUDIO_PALETTES = {
  aurora: ["#00aaff", "#702aff", "#ff308c"],
  candy: ["#71ffff", "#ff68e7", "#ff396a"],
  coastline: ["#0b5e8e", "#087fbf", "#1a9fff"],
  copper: ["#ffd27a", "#f69a3c", "#b95a2a"],
  "deep-sea": ["#7eebff", "#237ddb", "#14255e"],
  ember: ["#ffa21c", "#ff4812", "#b21250"],
  forest: ["#8affc4", "#48e073", "#397a29"],
  glacier: ["#d8ffff", "#5ddeff", "#2867d8"],
  ice: ["#1edcff", "#2870ff", "#8444ff"],
  lagoon: ["#b7fff5", "#21d7c0", "#087d91"],
  lime: ["#f2ffb0", "#a8ef45", "#3c8c46"],
  magma: ["#ffff2e", "#ffad29", "#ff0400"],
  orchid: ["#ffe1ff", "#ee72de", "#7b3ba7"],
  pearl: ["#ffffff", "#c9e8ff", "#7696d8"],
  plasma: ["#f5ecff", "#a45aff", "#5426b7"],
  sapphire: ["#6387e9", "#4e76e4", "#4e76e4"],
  silver: ["#ffffff", "#c7d0da", "#5f6875"],
  solar: ["#ffffff", "#ffe25a", "#ff9a1f"],
  sunset: ["#fff0b0", "#ff8d54", "#c33c72"],
};
const AUDIO_SMOOTHING = {
  calm: [.30, .12], balanced: [.58, .24], fast: [.82, .42], punchy: [1, .58],
};
const AUDIO_TUNING = {
  "hifi-crest": [160, "balanced"], "velvet-relay": [184, "fast"], "negative-bloom": [192, "fast"],
  "stereo-lanterns": [172, "balanced"], constellation: [205, "fast"], "slow-prism": [180, "fast"],
  spectrum: [190, "fast"], spatial: [170, "balanced"], bass: [185, "fast"], "audio-pulse": [168, "balanced"],
};
const AUDIO_PATTERN_LABELS = {
  spectrum: "17-band spectrum", "audio-pulse": "Audio pulse", bass: "Bass pulse", constellation: "Constellation",
  "hifi-crest": "Hi-Fi Crest", "negative-bloom": "Negative Bloom", "slow-prism": "Slow Prism", spatial: "Stereo field",
  "stereo-lanterns": "Stereo Lanterns", "velvet-relay": "Velvet Relay",
};
const AUDIO_EXAMPLES = {
  silksong: { title: "Silksong", source: "assets/karmelita-prime.mp4" },
  "witcher-bear": { title: "The Witcher 3 Remastered: Bear encounter", source: "assets/witcher-3-remastered-bear.mp4" },
};
const SCREEN_SYNC_SMOOTHING = {
  calm: [.24, .14], balanced: [.46, .28], fast: [.72, .52],
};
const START_COLOURS = { cyan: "#19c3eb", green: "#2dcd69", amber: "#f5a523", violet: "#a555eb", white: "#e1ebf5" };
const EVENT_OPTIONS = {
  notification: [
    ["notification-original", "Original · cyan crossing", "One quick cyan crossing."],
    ["notification-return", "Out and back", "A cyan glint crosses the bar and returns."],
    ["notification-echo", "Centre echo", "A centre call sends two waves towards the edges."],
    ["notification-ample", "Wide echo", "A bright centre call, one broad wave, then a softer echo."],
    ["notification-double", "Double halo", "Two separate centre pulses send halos to the edges."],
    ["notification-beacon", "Return beacon", "The edges answer a centre beacon and return to it."],
  ],
  achievement: [
    ["achievement-original", "Original · gold celebration", "Three centre beats open into a full gold bar."],
    ["achievement-confetti", "Return + confetti", "Gold opens, returns to centre and bursts into colours."],
    ["achievement-rebound", "Chromatic rebound", "Two gold ribbons rebound from the edges and collide in colour."],
    ["achievement-constellation", "Constellation", "Stars light in sequence, connect and radiate."],
    ["achievement-twoway", "Constellation round trip", "A line connects the stars in both directions, flashing at each end."],
    ["achievement-supernova", "Supernova", "Stars gather at centre, explode and leave a shimmering trail."],
  ],
  screenshot: [
    ["screenshot-original", "Original · ice shutter", "Two icy blades close like a camera shutter."],
    ["screenshot-double", "Shutter + two flashes", "A shutter closes; one central flash is followed by a wider flash."],
    ["screenshot-scan", "Scan + negative", "A focus line scans, flashes, then leaves a fading blue imprint."],
    ["screenshot-bloom", "Expanding echoes", "Each flash sends a soft echo outwards."],
    ["screenshot-ripple", "Ricochet echoes", "Narrow echoes reach the edges and bounce back."],
  ],
  recording: [
    ["record-start", "Recording starts", "Red traces meet at the centre, then leave a steady red marker."],
    ["record-stop", "Recording stops", "The centre marker sends red traces outward and goes dark."],
  ],
};
const CONTROLLER_OPTIONS = {
  duo: [["twin", "Twin reveal"], ["focus", "Two signatures"], ["double-welcome", "Mirror greeting"]],
  gauge: [["clean", "Quiet fill"], ["tip", "Bright tip"], ["horizon", "Soft horizon"]],
  connect: [["welcome", "Magnetic welcome"], ["orbit", "Arc return"], ["handshake", "Twin bloom"]],
  low: [["beacon", "Last ember"], ["drain", "Signal flare"], ["heartbeat", "Afterglow"]],
  charging: [["current", "Photon current"], ["breath", "Tidal fill"], ["spark", "Spark lattice"]],
};
const WEATHER_OPTIONS = {
  clear_day: ["Sun glints", "Solar bloom"],
  clear_night: ["Quiet constellation", "Silver hush"],
  rain: ["Bluewater", "Pearl rain"],
  cloud: ["Passing shadow", "Passing shadows", "Cross & gather", "Slow convergence"],
  breaks: ["Sun through clouds", "Sun, fading clouds"],
  breaks_night: ["Moon through clouds", "Moon, fading clouds"],
  snow: ["Melting snowfall", "Snow takes hold"],
  storm: ["Pulse and echoes", "Storm break"],
};
const WEATHER_ICONS = { clear_day: "☀", clear_night: "☾", rain: "☂", cloud: "☁", breaks: "⛅", breaks_night: "☾", snow: "❄", storm: "⚡" };
const WITCHER_SIGNS = {
  aard: [158, 214, 255], axii: [255, 255, 255], igni: [255, 79, 10],
  quen: [255, 205, 68], yrden: [200, 81, 255],
};
const LAUNCH_PATTERNS = [
  ["arpege-crossed", "Crossed arpeggio"], ["two-hands", "Two hands"],
  ["legato", "Legato"], ["nocturne", "Nocturne"], ["crescendo", "Crescendo"],
  ["color-wipe", "Color wipe"], ["scanner", "Scanner"],
  ["theater-chase", "Theater chase"], ["twinkle", "Twinkle"], ["ripple", "Ripple"],
];
const CUSTOMIZATION_GROUPS = [
  ["Steady", [["steady", "Steady · precise static colour"]]],
  ...Object.entries(EVENT_OPTIONS).filter(([kind]) => kind !== "recording").map(([kind, variants]) =>
    [`Light Events / ${kind[0].toUpperCase()}${kind.slice(1)}`, variants.map(([key, label]) => [`event:${key}`, label])]),
  ...Object.entries(CONTROLLER_OPTIONS).map(([kind, variants]) =>
    [`Controllers / ${kind[0].toUpperCase()}${kind.slice(1)}`, variants.map(([key, label]) => [`controller:${kind}:${key}`, label])]),
  ...Object.entries(WEATHER_OPTIONS).map(([condition, variants]) =>
    [`Weather / ${condition.replaceAll("_", " ")}`, variants.map((label, index) => [`weather:${condition}:${index}`, label])]),
  ["Game Launches", LAUNCH_PATTERNS],
];
function freshLaunchProfiles() {
  return Object.fromEntries(Object.keys(GAME_DATA).map((game) => [game, {
    paletteMode: "artwork",
    custom: { 2: ["#FFD000", "#00C8FF"], 3: ["#FFD000", "#00C8FF", "#FF3C9D"] },
  }]));
}

function defaultState() {
  return {
    tab: "overview", context: "game", display: "artwork", paused: false,
    game: "drg", artSource: "hero", artMode: "manual", artRow: 59, autoRow: 59,
    gameSettings: {
      drg: { source: "hero", mode: "manual", row: 59, display: "inherit" },
      witcher: { source: "hero", mode: "auto", row: 65, display: "inherit" },
      balatro: { source: "hero", mode: "manual", row: 34, display: "inherit" },
    },
    artCustom: null, artworkColors: Array.from({ length: 17 }, (_, i) => hexToRgb(i < 5 ? "#9ed163" : i < 12 ? "#e9aa22" : "#46a58e")),
    metric: "mixed", direction: "mirrored", cpu: 38, cpuTemp: 58, gpu: 72, gpuTemp: 70,
    palette: "classic", response: "balanced", shownCpu: 38, shownGpu: 72,
    coolColor: "#1eb4e6", middleColor: "#f5b42d", hotColor: "#eb2d37", coolTemp: 45, hotTemp: 78, perfHome: true,
    timerSource: "families", timerDuration: 60, timerRemaining: 2520, timerScale: 0, timerColor: "white", timerSpeed: 60, timerRunning: false, timerElapsed: 0,
    eventKind: "notification", eventVariants: { notification: "notification-beacon", achievement: "achievement-rebound", screenshot: "screenshot-bloom", recording: "record-start" },
    recording: false, recordIsolation: true,
    padCount: 2, padOne: 96, padTwo: 41, padThree: 73, padFour: 28, controllerTarget: 1, padCharging: false, controllerWhere: "home", chargeMode: "continuous-home", alertWhere: "both", lowThreshold: 20, padBrightness: 65,
    controllerColourMode: "battery", padPlayerColours: ["#25c8f5", "#ffb43b", "#a777ff", "#4bd38a"],
    controllerScene: "duo", controllerVariants: { duo: "double-welcome", gauge: "tip", connect: "welcome", low: "beacon", charging: "breath" },
    padHealthy: "#00b42d", padMedium: "#e66e00", padLow: "#dc0c18", padCharge: "#0091dc",
    weatherCondition: "clear_day", weatherVariants: { clear_day: 0, clear_night: 0, rain: 0, cloud: 1, breaks: 0, breaks_night: 0, snow: 1, storm: 0 },
    weatherWhere: "off", weatherTopbar: false, weatherUnit: "celsius", weatherBrightness: 70, weatherCutoff: 0, weatherStart: 0,
    audioSyncExample: "silksong", audioSyncStyle: "hifi-crest", audioSyncReactivity: "balanced", audioSyncBrightness: 160,
    audioSyncPalette: "screen-sync", audioSyncColours: ["#00aaff", "#702aff", "#ff308c"],
    audioLevels: Array(17).fill(0), audioLeft: 0, audioRight: 0, audioVideoColours: null, audioVideoPalette: null, audioArtworkPalette: null,
    audioMetrics: { impact: 0, attack: 0, texture: 0, stereo: 0, window: 0 }, audioHistory: [], audioCrests: [],
    screenSyncStyle: "panorama", screenSyncBrightness: 160, screenSyncReactivity: "balanced", screenSyncIntensity: "natural", screenSyncBlackThreshold: 8, screenSyncBlackBars: true, screenSyncStart: 0, screenVideoColours: null,
    witcherHealth: 72, witcherStamina: 86, witcherToxicity: 0, witcherAdrenaline: 2, witcherCombat: true,
    customPattern: "steady", customPaletteCount: 2, customColours: ["#FFD000", "#00C8FF", "#FF3C9D"], customBrightness: 128, customSpeed: 50, customDirection: "forward",
    launchGame: "drg", launchSource: "hero", launchColourCount: 2, launchPattern: "arpege-crossed", launchDuration: 20,
    launchProfiles: freshLaunchProfiles(), launchArtworkPalettes: {},
    launchStarted: 0, launchPlaying: false,
    extraDark: 2, reversePhysical: true, overlay: null,
  };
}
let state = defaultState();
let eventFrames = globalThis.GABECUBEAURA_EVENT_FRAMES || {};
let weatherFrames = globalThis.GABECUBEAURA_WEATHER_FRAMES || null;
let clock = 0;
let lastRealTime = performance.now();
let artworkLoadToken = 0;
let launchArtworkLoadToken = 0;
let customObjectUrl = null;
let audioContext = null;
let audioMediaSource = null;
let audioLeftAnalyser = null;
let audioRightAnalyser = null;
let audioLeftData = null;
let audioRightData = null;
let audioLastAnalysis = 0;
let audioLastCapture = 0;
let audioLastVideoSample = 0;
let screenLastVideoSample = 0;
let audioVideoPrevious = null;
let audioVideoSourceActive = false;
let audioVideoBarCandidate = [0, 0];
let audioVideoBarStreak = 0;
let audioVideoStableBars = [0, 0];
let audioVideoBlackStreak = 0;
let audioVideoStyle = "";
const audioVideoCanvas = document.createElement("canvas");
audioVideoCanvas.width = 34;
audioVideoCanvas.height = 18;
const ledElements = Array.from({ length: 17 }, () => {
  const led = document.createElement("i");
  $("#logicalLeds").append(led);
  return led;
});
const mobileLedElements = Array.from({ length: 17 }, () => {
  const led = document.createElement("i");
  $("#mobileLeds").append(led);
  return led;
});
const audioBandElements = Array.from({ length: 17 }, () => {
  const band = document.createElement("i");
  $("#audioSpectrum").append(band);
  return band;
});

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function rgbToHex(rgb) { return `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`; }
function hexToRgb(hex) { const value = hex.replace("#", ""); return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16)); }
function blend(a, b, amount) { return a.map((value, index) => Math.round(value * (1 - amount) + b[index] * amount)); }
function scale(color, amount) { return color.map((value) => Math.round(value * amount)); }
function blank() { return Array.from({ length: 17 }, () => [...OFF]); }
function isLit(color) { return color.some((value) => value > 3); }
function emissivePreviewColour(colour, exponent = .58) {
  if (!isLit(colour)) return [...OFF];
  const [hue, saturation, value] = rgbToHsv(colour);
  return hsvToRgb([
    hue,
    clamp(saturation * 1.18, 0, 1),
    .025 + .975 * Math.pow(value, exponent),
  ]);
}
function formatTime(seconds) { const safe = Math.max(0, Math.ceil(seconds)); return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`; }
function ease(value) { const x = clamp(value, 0, 1); return x * x * (3 - 2 * x); }
function fill(frame, from, to, color) { for (let index = Math.max(0, from); index <= Math.min(16, to); index++) frame[index] = [...color]; }
function put(frame, index, color) { if (index >= 0 && index < 17) frame[index] = [...color]; }
function colourAtTemp(temperature) {
  const palette = state.palette === "custom" ? [state.coolColor, state.middleColor, state.hotColor] : PALETTES[state.palette];
  const colors = palette.map(hexToRgb);
  const fraction = clamp((temperature - state.coolTemp) / Math.max(1, state.hotTemp - state.coolTemp), 0, 1);
  return fraction < .5 ? blend(colors[0], colors[1], fraction * 2) : blend(colors[1], colors[2], (fraction - .5) * 2);
}
function applyExtraDark(counts) {
  const values = [...counts];
  for (let i = 0; i < state.extraDark; i++) {
    const available = values.map((count, index) => count > 1 ? index : -1).filter((index) => index >= 0);
    if (!available.length) break;
    const selected = available.reduce((best, index) => values[index] > values[best] ? index : best, available[0]);
    values[selected]--;
  }
  return values;
}
function performanceFrames() {
  const frame = blank();
  const physical = blank();
  const cpuColor = colourAtTemp(state.cpuTemp), gpuColor = colourAtTemp(state.gpuTemp);
  if (state.metric === "mixed") {
    const cpuCount = Math.round(clamp(state.shownCpu, 0, 100) * 8 / 100);
    const gpuCount = Math.round(clamp(state.shownGpu, 0, 100) * 8 / 100);
    const [physicalCpu, physicalGpu] = applyExtraDark([cpuCount, gpuCount]);
    fill(frame, 0, cpuCount - 1, cpuColor); fill(physical, 0, physicalCpu - 1, cpuColor);
    const fillGpu = (target, count) => {
      if (state.direction === "mirrored") fill(target, 17 - count, 16, gpuColor);
      else fill(target, 9, 8 + count, gpuColor);
    };
    fillGpu(frame, gpuCount); fillGpu(physical, physicalGpu);
    return { logical: frame, physical, name: `CPU + GPU · ${state.direction === "mirrored" ? "mirrored" : "left-to-right"} meter`, readout: `CPU ${Math.round(state.shownCpu)}% · ${state.cpuTemp}°C   GPU ${Math.round(state.shownGpu)}% · ${state.gpuTemp}°C`, explain: "Eight LEDs for each meter; the centre LED stays dark. Length shows load, colour shows temperature.", badge: "PERFORMANCE" };
  }
  const cpu = state.metric === "cpu";
  const load = cpu ? state.shownCpu : state.shownGpu;
  const temp = cpu ? state.cpuTemp : state.gpuTemp;
  const count = Math.round(clamp(load, 0, 100) * 17 / 100);
  const [physicalCount] = applyExtraDark([count]);
  fill(frame, 0, count - 1, cpu ? cpuColor : gpuColor);
  fill(physical, 0, physicalCount - 1, cpu ? cpuColor : gpuColor);
  return { logical: frame, physical, name: `${cpu ? "CPU" : "GPU"} performance`, readout: `${Math.round(load)}% · ${temp}°C`, explain: "The meter grows with load. Its colour moves between Cool, Middle and Hot as temperature changes.", badge: "PERFORMANCE" };
}
function artworkFrame() {
  const colors = state.artworkColors?.length === 17 ? state.artworkColors : blank();
  const title = state.artCustom ? "Your image" : GAME_DATA[state.game].title;
  return { logical: colors, physical: colors, name: "Game artwork", readout: `${title} · row ${getSampleRow()}%`, explain: "The selected horizontal row is sampled into 17 colours. Upload an image to try your own palette.", badge: "ARTWORK" };
}
function countdownFrame() {
  const remaining = state.timerRemaining;
  const scaleDuration = state.timerScale ? state.timerScale * 60 : state.timerDuration * 60;
  const count = remaining <= 0 ? 0 : Math.ceil(17 * clamp(remaining / scaleDuration, 0, 1));
  const physicalCount = count === 17 ? 17 : remaining > 0 ? Math.max(1, count - state.extraDark) : 0;
  const chosen = remaining <= 300 ? [255, 0, 0] : remaining <= 900 ? hexToRgb("#f5a523") : hexToRgb(START_COLOURS[state.timerColor]);
  const make = (lit) => {
    const frame = blank();
    for (let index = 0; index < lit; index++) frame[index] = scale(chosen, .34);
    if (lit) {
      const head = lit - 1 - (Math.floor(state.timerElapsed / .2) % lit);
      frame[head] = chosen;
      put(frame, head + 1, scale(chosen, .72));
      put(frame, head + 2, scale(chosen, .52));
      for (let index = lit; index < 17; index++) frame[index] = [...OFF];
    }
    return frame;
  };
  if (remaining <= 8 && remaining > 0) {
    const phase = (8 - remaining) % 1.8;
    const flash = [0, .3, .6].some((start) => phase >= start && phase < start + .15);
    const frame = flash ? Array.from({ length: 17 }, () => [255, 255, 255]) : blank();
    return { logical: frame, physical: frame, name: "Final eight seconds", readout: formatTime(remaining), explain: "Three short white flashes repeat until the timer reaches zero.", badge: "COUNTDOWN" };
  }
  const source = state.timerSource === "families" ? "Steam Families" : "Personal timer";
  return { logical: make(count), physical: make(physicalCount), name: `${source} countdown`, readout: `${formatTime(remaining)} left · ${count}/17 logical LEDs`, explain: "The bright point travels right to left. Below 15 minutes the bar turns amber; below five minutes it turns red.", badge: "PLAYTIME" };
}
function controllerColour(percent, charging = false, player = 0) {
  if (charging) return hexToRgb(state.padCharge);
  if (state.controllerColourMode === "players") return hexToRgb(state.padPlayerColours[player]);
  if (percent <= state.lowThreshold) return hexToRgb(state.padLow);
  if (percent <= Math.max(35, state.lowThreshold + 5)) return hexToRgb(state.padMedium);
  return hexToRgb(state.padHealthy);
}
function controllerRound(value) {
  const lower = Math.floor(value), fraction = value - lower;
  if (fraction < .5) return lower;
  if (fraction > .5) return lower + 1;
  return lower % 2 === 0 ? lower : lower + 1;
}
function controllerScale(colour, amount) { return colour.map((value) => controllerRound(value * amount)); }
function controllerPercents() { return [state.padOne, state.padTwo, state.padThree, state.padFour].slice(0, state.padCount); }
function controllerZones(count = state.padCount) {
  if (count === 1) return [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]];
  if (count === 2) return [[0, 1, 2, 3, 4, 5, 6, 7], [16, 15, 14, 13, 12, 11, 10, 9]];
  if (count === 3) return [[0, 1, 2, 3, 4], [6, 7, 8, 9, 10], [12, 13, 14, 15, 16]];
  return [[0, 1, 2, 3], [7, 6, 5, 4], [9, 10, 11, 12], [16, 15, 14, 13]];
}
function controllerGaugeInto(frame, zone, percent, charging = false, player = 0) {
  const count = Math.min(zone.length, Math.max(percent > 0 ? 1 : 0, controllerRound(percent * zone.length / 100)));
  const lit = zone.slice(0, count);
  lit.forEach((index) => put(frame, index, controllerColour(percent, charging, player)));
  return lit;
}
function controllerChargeInto(frame, zone, percent, variant, seconds, continuous = false, player = 0) {
  const lit = controllerGaugeInto(frame, zone, percent, true, player);
  if (!lit.length) return lit;
  let t = seconds;
  if (continuous) t %= { current: 2.55, breath: 3.2, spark: 2.55 }[variant];
  if (variant === "current") {
    if (t < 1.95) {
      const position = Math.min(lit.length - 1, Math.floor(t / 1.95 * lit.length));
      put(frame, lit[position], WHITE);
      if (position > 0) put(frame, lit[position - 1], controllerScale(WHITE, .65));
    } else put(frame, lit[lit.length - 1], WHITE);
  } else if (variant === "breath") {
    const centre = t / 2.75 * (lit.length + 3) - 2;
    lit.forEach((index, position) => {
      const distance = Math.abs(position - centre);
      if (distance < 2.8) put(frame, index, distance < 1 ? WHITE : controllerScale(WHITE, .7));
    });
    put(frame, lit[lit.length - 1], WHITE);
  } else {
    for (let offset = 0; offset < 3; offset++) {
      const position = Math.floor(((t / 2.15 + offset / 3) % 1) * lit.length);
      put(frame, lit[position], offset === 0 ? WHITE : controllerScale(WHITE, .68));
    }
    put(frame, lit[lit.length - 1], WHITE);
  }
  return lit;
}
function controllerBaseRaw(animateCharging = false) {
  let frame = blank();
  const zones = controllerZones(), percents = controllerPercents();
  const chargingAllowed = state.chargeMode === "continuous-everywhere" || (state.chargeMode === "continuous-home" && state.context === "home");
  zones.forEach((zone, player) => {
    const charging = state.padCharging && player === state.controllerTarget && chargingAllowed && percents[player] < 100;
    const lit = charging && animateCharging
      ? controllerChargeInto(frame, zone, percents[player], state.controllerVariants.charging, clock / 1000, true, player)
      : controllerGaugeInto(frame, zone, percents[player], charging, player);
    if (!charging && lit.length && state.controllerVariants.gauge === "tip") put(frame, lit[lit.length - 1], WHITE);
  });
  if (state.controllerVariants.gauge === "horizon") frame = frame.map((colour) => controllerScale(colour, .58));
  return frame;
}
function controllerBaseFrame(animateCharging = false) {
  return controllerBaseRaw(animateCharging).map((colour) => controllerScale(colour, state.padBrightness / 100));
}
function controllerFrame() {
  const frame = controllerBaseFrame(true), percents = controllerPercents();
  const charging = state.padCharging && state.chargeMode !== "off" && percents[state.controllerTarget] < 100;
  const readout = percents.map((percent, index) => `P${index + 1} ${percent}%`).join(" · ");
  const layout = state.padCount === 1 ? "17 LEDs" : state.padCount === 2 ? "8 + centre + 8" : state.padCount === 3 ? "5 + separator + 5 + separator + 5" : "4 + 4 + centre + 4 + 4";
  const colourMeaning = state.controllerColourMode === "players" ? "fixed player colours" : "battery-level colours";
  const direction = state.padCount === 3 ? " Every seat fills left to right." : state.padCount > 1 ? " Opposing seats fill towards the centre." : "";
  return { logical: frame, physical: frame, name: charging ? `Controller ${state.controllerTarget + 1} charging` : `${state.padCount} controller${state.padCount === 1 ? "" : "s"}`, readout: `${readout}${charging ? ` · P${state.controllerTarget + 1} charging` : ""}`, explain: `${layout}. Each reported battery keeps its own fixed seat and white endpoint, using ${colourMeaning}.${direction}`, badge: "CONTROLLERS" };
}
function weatherFrame() {
  const variant = state.weatherVariants[state.weatherCondition];
  const loop = weatherFrames?.frames?.[state.weatherCondition]?.[variant];
  const elapsed = Math.max(0, clock - state.weatherStart) / 1000;
  const raw = loop?.[Math.floor(elapsed * weatherFrames.fps) % loop.length] || blank();
  const frame = raw.map((pixel) => {
    const scaled = scale(pixel, state.weatherBrightness / 100);
    return Math.max(...scaled) <= state.weatherCutoff ? [...OFF] : scaled;
  });
  return { logical: frame, physical: frame, name: `${state.weatherCondition.replaceAll("_", " ")} · ${WEATHER_OPTIONS[state.weatherCondition][variant]}`, readout: `${state.weatherUnit === "fahrenheit" ? "64°F" : "18°C"} · sample sky`, explain: "An eight-second weather loop repeats on the light bar. The exact temperature is text only, never encoded as LED colours.", badge: "WEATHER" };
}
function screenSyncFrame() {
  const video = $("#audioSyncVideo"), now = performance.now();
  if (video.readyState >= 2 && now - screenLastVideoSample >= 100) {
    screenLastVideoSample = now;
    state.screenVideoColours = sampleGameplayVideoColours(video);
  }
  const frame = state.screenVideoColours?.length === 17 ? state.screenVideoColours : blank();
  const position = Number.isFinite(video.currentTime) ? formatTime(video.currentTime) : "0:00";
  const duration = Number.isFinite(video.duration) ? formatTime(video.duration) : "0:00";
  const crop = audioVideoStableBars[0] || audioVideoStableBars[1]
    ? ` · crop ${audioVideoStableBars[0]}+${audioVideoStableBars[1]}` : "";
  return {
    logical: frame, physical: frame,
    name: `Screen Sync · ${state.screenSyncStyle === "ambient" ? "Ambient" : "Panorama"}`,
    readout: `${AUDIO_EXAMPLES[state.audioSyncExample].title} · 10 fps${crop} · ${position} / ${duration}`,
    explain: "Each displayed frame follows the current Screen Sync processor: 34 by 18 capture, zone averaging, spatial blur, stable black-bar crop and asymmetric response smoothing.",
    badge: video.paused ? "SCREEN READY" : "SCREEN SYNC",
  };
}
function audioPaletteFrame(mirrored = true) {
  let raw;
  if (state.audioSyncPalette === "screen-sync") raw = state.audioVideoPalette || state.audioArtworkPalette || AUDIO_PALETTES.sapphire;
  else if (state.audioSyncPalette === "artwork") raw = state.audioArtworkPalette || AUDIO_PALETTES.sapphire;
  else raw = state.audioSyncPalette === "custom" ? state.audioSyncColours : AUDIO_PALETTES[state.audioSyncPalette] || AUDIO_PALETTES.sapphire;
  const colours = raw.map((colour) => typeof colour === "string" ? hexToRgb(colour) : colour);
  return Array.from({ length: 17 }, (_, index) => {
    if (!mirrored) {
      const position = index / 16;
      return position <= .5 ? blend(colours[0], colours[1], position * 2) : blend(colours[1], colours[2], (position - .5) * 2);
    }
    const distance = Math.abs(index - 8) / 8;
    return distance <= .5 ? blend(colours[2], colours[1], distance * 2) : blend(colours[1], colours[0], (distance - .5) * 2);
  });
}
function harmonizeAudioPalette(colours) {
  const useful = colours.filter((colour) => screenLuma(colour) > 12).map((colour) => {
    const hsv = rgbToHsv(colour);
    return { colour, hue: hsv[0], saturation: hsv[1], value: hsv[2], score: hsv[1] * .72 + hsv[2] * .28 };
  });
  if (!useful.length) return AUDIO_PALETTES.sapphire.map(hexToRgb);
  const anchor = useful.reduce((best, item) => item.score > best.score ? item : best, useful[0]);
  const hueDelta = (first, second) => ((second - first + .5) % 1) - .5;
  const candidates = useful.sort((first, second) => second.score - first.score);
  const shoulder = candidates.find((item) => Math.abs(hueDelta(anchor.hue, item.hue)) > .025) || anchor;
  const outer = candidates.find((item) => item !== shoulder && Math.abs(hueDelta(anchor.hue, item.hue)) > .04) || shoulder;
  const make = (source, maxShift, saturation, value) => hsvToRgb([
    (anchor.hue + clamp(hueDelta(anchor.hue, source.hue), -maxShift, maxShift) + 1) % 1,
    clamp(Math.max(saturation, source.saturation * .86), .42, .90), value,
  ]);
  return [make(outer, 20 / 360, .56, .24), make(shoulder, 32 / 360, .62, .43), make(anchor, 0, .68, .64)];
}
function screenLuma(colour) {
  return .2126 * colour[0] + .7152 * colour[1] + .0722 * colour[2];
}
function srgbToLinear(channel) {
  const value = channel / 255;
  return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
}
function linearToSrgb(channel) {
  const value = channel <= .0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - .055;
  return Math.round(clamp(value, 0, 1) * 255);
}
function rgbToHsv([red, green, blue]) {
  const r = red / 255, g = green / 255, b = blue / 255;
  const maximum = Math.max(r, g, b), minimum = Math.min(r, g, b), delta = maximum - minimum;
  let hue = 0;
  if (delta) {
    if (maximum === r) hue = ((g - b) / delta) % 6;
    else if (maximum === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue = ((hue / 6) + 1) % 1;
  }
  return [hue, maximum ? delta / maximum : 0, maximum];
}
function hsvToRgb([hue, saturation, value]) {
  const sector = Math.floor(hue * 6), fraction = hue * 6 - sector;
  const p = value * (1 - saturation), q = value * (1 - fraction * saturation), t = value * (1 - (1 - fraction) * saturation);
  const [red, green, blue] = [[value, t, p], [q, value, p], [p, value, t], [p, q, value], [t, p, value], [value, p, q]][sector % 6];
  return [red, green, blue].map((channel) => Math.round(clamp(channel, 0, 1) * 255));
}
function rgbToHsl([red, green, blue]) {
  const r = red / 255, g = green / 255, b = blue / 255;
  const maximum = Math.max(r, g, b), minimum = Math.min(r, g, b), lightness = (maximum + minimum) / 2;
  if (maximum === minimum) return [0, lightness, 0];
  const delta = maximum - minimum;
  const saturation = lightness > .5 ? delta / (2 - maximum - minimum) : delta / (maximum + minimum);
  let hue = maximum === r ? (g - b) / delta + (g < b ? 6 : 0) : maximum === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return [hue / 6, lightness, saturation];
}
function hslToRgb([hue, lightness, saturation]) {
  hue = ((hue % 1) + 1) % 1;
  if (!saturation) return [lightness, lightness, lightness].map((channel) => Math.round(channel * 255));
  const q = lightness < .5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  const channel = (offset) => {
    let value = hue + offset;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };
  return [channel(1 / 3), channel(0), channel(-1 / 3)].map((value) => Math.round(value * 255));
}
function meanScreenColour(pixels) {
  if (!pixels.length) return [0, 0, 0];
  const ordered = [...pixels].sort((first, second) => screenLuma(first) - screenLuma(second));
  const sample = ordered.slice(0, Math.max(1, Math.round(ordered.length * .95)));
  return [0, 1, 2].map((channel) => linearToSrgb(sample.reduce((sum, pixel) => sum + srgbToLinear(pixel[channel]), 0) / sample.length));
}
function detectAudioVideoBars(pixels) {
  if (!state.screenSyncBlackBars) return [0, 0];
  const threshold = state.screenSyncBlackThreshold + 4;
  const rowIsBlack = (row) => {
    let dark = 0;
    for (let column = 0; column < 34; column++) {
      if (screenLuma(pixels[row * 34 + column]) <= threshold) dark++;
    }
    return dark >= Math.floor(34 * .9);
  };
  const limit = Math.floor(18 / 3);
  let top = 0, bottom = 0;
  while (top < limit && rowIsBlack(top)) top++;
  while (bottom < limit && rowIsBlack(17 - bottom)) bottom++;
  const candidate = [top, bottom];
  if (candidate[0] === audioVideoBarCandidate[0] && candidate[1] === audioVideoBarCandidate[1]) audioVideoBarStreak++;
  else { audioVideoBarCandidate = candidate; audioVideoBarStreak = 1; }
  if (audioVideoBarStreak >= 3) audioVideoStableBars = candidate;
  return audioVideoStableBars;
}
function adjustAudioVideoColours(colours) {
  const brightness = clamp(state.screenSyncBrightness, 34, 255) / 255;
  const saturationScale = state.screenSyncIntensity === "vivid" ? 1.3 : 1;
  return colours.map((colour) => {
    if (screenLuma(colour) <= state.screenSyncBlackThreshold) return [0, 0, 0];
    const [hue, saturation, value] = rgbToHsv(colour);
    return hsvToRgb([hue, clamp(saturation * saturationScale, 0, 1), value * brightness]);
  });
}
function resetAudioVideoProcessor() {
  audioVideoPrevious = null;
  audioVideoSourceActive = false;
  audioVideoBarCandidate = [0, 0];
  audioVideoBarStreak = 0;
  audioVideoStableBars = [0, 0];
  audioVideoBlackStreak = 0;
  state.audioVideoColours = null;
  state.audioVideoPalette = null;
  state.screenVideoColours = null;
  state.screenPaletteSamples = null;
  screenLastVideoSample = 0;
}
function sampleGameplayVideoColours(video) {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    audioVideoSourceActive = false;
    return state.screenVideoColours || blank();
  }
  try {
    const context = audioVideoCanvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(video, 0, 0, audioVideoCanvas.width, audioVideoCanvas.height);
    const raw = context.getImageData(0, 0, audioVideoCanvas.width, audioVideoCanvas.height).data;
    const pixels = Array.from({ length: audioVideoCanvas.width * audioVideoCanvas.height }, (_, index) => [raw[index * 4], raw[index * 4 + 1], raw[index * 4 + 2]]);
    const [top, bottom] = detectAudioVideoBars(pixels);
    const rows = [];
    for (let row = top; row < Math.max(top + 1, 18 - bottom); row++) rows.push(row);
    state.screenPaletteSamples = rows.flatMap((row) => Array.from({ length: 34 }, (_, column) => pixels[row * 34 + column]));
    let colours;
    if (state.screenSyncStyle === "ambient") {
      const colour = meanScreenColour(rows.flatMap((row) => Array.from({ length: 34 }, (_, column) => pixels[row * 34 + column])));
      colours = Array.from({ length: 17 }, () => [...colour]);
    } else {
      colours = Array.from({ length: 17 }, (_, led) => {
        const zone = [];
        const left = Math.floor(led * 34 / 17), right = Math.max(left + 1, Math.floor((led + 1) * 34 / 17));
        for (const row of rows) for (let column = left; column < right; column++) zone.push(pixels[row * 34 + column]);
        return meanScreenColour(zone);
      });
    }
    colours = adjustAudioVideoColours(colours);
    colours = colours.map((centre, index) => {
      const left = colours[Math.max(0, index - 1)], right = colours[Math.min(16, index + 1)];
      return [0, 1, 2].map((channel) => Math.round(left[channel] * .2 + centre[channel] * .6 + right[channel] * .2));
    });
    const allBlack = colours.every((colour) => screenLuma(colour) <= state.screenSyncBlackThreshold);
    audioVideoBlackStreak = allBlack ? audioVideoBlackStreak + 1 : 0;
    let result = audioVideoBlackStreak >= 3 ? blank() : colours;
    if (audioVideoBlackStreak < 3 && audioVideoPrevious) {
      const [brightenAlpha, darkenAlpha] = SCREEN_SYNC_SMOOTHING[state.screenSyncReactivity] || SCREEN_SYNC_SMOOTHING.balanced;
      result = colours.map((current, index) => {
        const previous = audioVideoPrevious[index];
        const alpha = screenLuma(current) >= screenLuma(previous) ? brightenAlpha : darkenAlpha;
        return current.map((channel, offset) => Math.round(previous[offset] + (channel - previous[offset]) * alpha));
      });
    }
    audioVideoPrevious = result;
    audioVideoSourceActive = true;
    return result;
  } catch (_error) {
    audioVideoSourceActive = false;
    return state.screenVideoColours || blank();
  }
}
function sampleAudioVideoColours(video) {
  const colours = sampleGameplayVideoColours(video);
  const palette = harmonizeAudioPalette(state.screenPaletteSamples || colours);
  state.audioVideoPalette = palette;
  if (!state.audioArtworkPalette) state.audioArtworkPalette = palette.map((colour) => [...colour]);
  return audioPaletteFrame();
}
function audioRms(values) {
  let sum = 0;
  for (const value of values) sum += value * value;
  return Math.sqrt(sum / Math.max(1, values.length));
}
function audioFftMagnitudes(left, right) {
  const size = 2048;
  const real = new Float64Array(size), imaginary = new Float64Array(size);
  for (let index = 0; index < size; index++) {
    const mono = ((left[index] || 0) + (right[index] || 0)) * .5;
    real[index] = mono * (.5 - .5 * Math.cos(2 * Math.PI * index / (size - 1)));
  }
  let reversed = 0;
  for (let index = 1; index < size; index++) {
    let bit = size >> 1;
    while (reversed & bit) { reversed ^= bit; bit >>= 1; }
    reversed ^= bit;
    if (index < reversed) {
      [real[index], real[reversed]] = [real[reversed], real[index]];
      [imaginary[index], imaginary[reversed]] = [imaginary[reversed], imaginary[index]];
    }
  }
  for (let length = 2; length <= size; length <<= 1) {
    const angle = -2 * Math.PI / length, cosine = Math.cos(angle), sine = Math.sin(angle), half = length >> 1;
    for (let start = 0; start < size; start += length) {
      let factorReal = 1, factorImaginary = 0;
      for (let offset = 0; offset < half; offset++) {
        const oddIndex = start + offset + half;
        const oddReal = factorReal * real[oddIndex] - factorImaginary * imaginary[oddIndex];
        const oddImaginary = factorReal * imaginary[oddIndex] + factorImaginary * real[oddIndex];
        const evenIndex = start + offset, evenReal = real[evenIndex], evenImaginary = imaginary[evenIndex];
        real[evenIndex] = evenReal + oddReal; imaginary[evenIndex] = evenImaginary + oddImaginary;
        real[oddIndex] = evenReal - oddReal; imaginary[oddIndex] = evenImaginary - oddImaginary;
        const nextReal = factorReal * cosine - factorImaginary * sine;
        factorImaginary = factorReal * sine + factorImaginary * cosine;
        factorReal = nextReal;
      }
    }
  }
  return Array.from({ length: size / 2 }, (_, index) => Math.hypot(real[index], imaginary[index]) / (size / 2));
}
function updateAudioBands() {
  const colours = audioPaletteFrame(false);
  audioBandElements.forEach((element, index) => {
    const level = state.audioLevels[index] || 0;
    element.style.height = `${Math.max(3, Math.round(level * 100))}%`;
    element.style.background = rgbToHex(colours[index]);
    element.style.opacity = String(.24 + level * .76);
  });
  const metrics = state.audioMetrics;
  for (const [name, value] of Object.entries(metrics)) {
    const output = $(`#audioMetric${name[0].toUpperCase()}${name.slice(1)}`);
    if (output) output.textContent = name === "window" ? `${value.toFixed(1)} s` : `${Math.round(value * 100)}%`;
  }
}
function decayAudioAnalysis() {
  const [, decay] = AUDIO_SMOOTHING[state.audioSyncReactivity] || AUDIO_SMOOTHING.balanced;
  state.audioLevels = state.audioLevels.map((value) => value * (1 - decay));
  state.audioLeft *= 1 - decay;
  state.audioRight *= 1 - decay;
  for (const key of ["impact", "attack", "texture", "stereo"]) state.audioMetrics[key] *= 1 - decay;
  updateAudioBands();
}
function audioPercentile(values, amount) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.round((sorted.length - 1) * amount)];
}
function analyseAudioNow() {
  const video = $("#audioSyncVideo");
  const now = performance.now();
  const processInterval = 60;
  if (!audioLeftAnalyser || !audioRightAnalyser || !audioLeftData || !audioRightData || video.paused || video.ended) {
    if (now - audioLastAnalysis >= processInterval) {
      audioLastAnalysis = now;
      decayAudioAnalysis();
    }
    return;
  }
  const captureInterval = 60;
  const captured = now - audioLastCapture >= captureInterval;
  if (captured) {
    audioLastCapture = now;
    audioLeftAnalyser.getFloatTimeDomainData(audioLeftData);
    audioRightAnalyser.getFloatTimeDomainData(audioRightData);
  }
  if (!captured || now - audioLastAnalysis < processInterval) return;
  audioLastAnalysis = now;
  const magnitudes = audioFftMagnitudes(audioLeftData, audioRightData);
  const sampleRate = audioContext.sampleRate;
  const minimumHz = 45, maximumHz = Math.min(16000, sampleRate / 2 - 1);
  const rawDb = Array.from({ length: 17 }, (_, index) => {
    const low = minimumHz * ((maximumHz / minimumHz) ** (index / 17));
    const high = minimumHz * ((maximumHz / minimumHz) ** ((index + 1) / 17));
    const start = Math.max(1, Math.floor(low * 2048 / sampleRate));
    const end = Math.min(magnitudes.length, Math.max(start + 1, Math.ceil(high * 2048 / sampleRate)));
    let power = 0;
    for (let bin = start; bin < end; bin++) {
      power += magnitudes[bin] * magnitudes[bin];
    }
    const energy = Math.sqrt(power / Math.max(1, end - start));
    return 20 * Math.log10(Math.max(1e-8, energy));
  });
  state.audioHistory.push(rawDb);
  if (state.audioHistory.length > 170) state.audioHistory.shift();
  const anchors = state.audioHistory.map((row) => audioPercentile(row, .76));
  const low = audioPercentile(anchors, .15) - 7;
  const high = Math.max(low + 18, audioPercentile(anchors, .92) + 3);
  const anchor = audioPercentile(rawDb, .76), span = Math.max(18, high - low);
  const programme = clamp((anchor - low) / span, 0, 1.18);
  const current = rawDb.map((value) => clamp(programme + (value - anchor) / 34, 0, 1));
  const [attack, decay] = AUDIO_SMOOTHING[state.audioSyncReactivity] || AUDIO_SMOOTHING.balanced;
  const previousLevels = [...state.audioLevels];
  state.audioLevels = current.map((value, index) => {
    const previous = state.audioLevels[index] || 0;
    const alpha = value >= previous ? attack : decay;
    return previous + (value - previous) * alpha;
  });
  const left = clamp(audioRms(audioLeftData) * 4.6, 0, 1);
  const right = clamp(audioRms(audioRightData) * 4.6, 0, 1);
  state.audioLeft += (left - state.audioLeft) * (left >= state.audioLeft ? attack : decay);
  state.audioRight += (right - state.audioRight) * (right >= state.audioRight ? attack : decay);
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  const bass = mean(state.audioLevels.slice(0, 5)), mid = mean(state.audioLevels.slice(5, 12)), highBand = mean(state.audioLevels.slice(12));
  const bassFlux = Math.max(0, bass - mean(previousLevels.slice(0, 5))) * 4.6;
  const midFlux = Math.max(0, mid - mean(previousLevels.slice(5, 12))) * 4.0;
  const highFlux = Math.max(0, highBand - mean(previousLevels.slice(12))) * 3.6;
  const metricTargets = {
    impact: clamp(bassFlux * .86 + bass * .16, 0, 1),
    attack: clamp(midFlux * .72 + highFlux * .28, 0, 1),
    texture: clamp(highFlux + highBand * .12, 0, 1),
    stereo: clamp(Math.abs(state.audioLeft - state.audioRight), 0, 1),
  };
  for (const [key, target] of Object.entries(metricTargets)) {
    const currentMetric = state.audioMetrics[key];
    const alpha = target >= currentMetric ? attack : decay;
    state.audioMetrics[key] += (target - currentMetric) * alpha;
  }
  state.audioMetrics.window = Math.min(10.2, state.audioHistory.length * .06);
  if (["screen-sync", "artwork"].includes(state.audioSyncPalette) && now - audioLastVideoSample >= 100) {
    audioLastVideoSample = now;
    state.audioVideoColours = sampleAudioVideoColours(video);
  }
  updateAudioBands();
}
function audioOpticalScale(colour, level, brightness) {
  if (level < .055) return [0, 0, 0];
  let clean = [...colour];
  const [, saturation, value] = rgbToHsv(clean);
  if (saturation < .08 && value > .62) clean = [255, 226, 194];
  else if (saturation < .18) clean = [Math.min(255, clean[0] * 1.05 + 2), clean[1] * .97, clean[2] * .86];
  const amount = brightness / 255 * (.28 + clamp(level, 0, 1) * .56);
  let output = clean.map((channel) => channel * amount);
  const peak = Math.max(...output);
  if (peak > 0 && peak < Math.min(34, brightness)) output = output.map((channel) => channel * Math.min(34, brightness) / peak);
  if (Math.max(...output) > 212) output = output.map((channel) => channel * 212 / Math.max(...output));
  return output.map((channel) => Math.round(clamp(channel, 0, 255)));
}
function renderAudioPattern(_base, brightness, nowSeconds) {
  const { impact, attack, texture } = state.audioMetrics;
  const bass = state.audioLevels.slice(0, 5).reduce((sum, value) => sum + value, 0) / 5;
  const mid = state.audioLevels.slice(5, 12).reduce((sum, value) => sum + value, 0) / 7;
  const high = state.audioLevels.slice(12).reduce((sum, value) => sum + value, 0) / 5;
  const bed = bass * .42 + mid * .38 + high * .20;
  const style = state.audioSyncStyle;
  const linear = audioPaletteFrame(false), mirrored = audioPaletteFrame(true);
  if (style === "spectrum") return linear.map((colour, index) => scale(colour, state.audioLevels[index] * brightness / 255));
  if (style === "spatial") return linear.map((colour, index) => scale(colour, (state.audioLeft * (1 - index / 16) + state.audioRight * index / 16) * brightness / 255));
  if (style === "bass") {
    const level = clamp(bass * 1.10, 0, 1);
    return mirrored.map((colour, index) => scale(colour, level * (1 - .50 * Math.abs(index - 8) / 8) * brightness / 255));
  }
  if (style === "audio-pulse") {
    const pulse = clamp((state.audioLeft + state.audioRight) * .62 + Math.max(...state.audioLevels.slice(0, 9)) * .58, 0, 1);
    return mirrored.map((colour) => scale(colour, pulse * brightness / 255));
  }

  const punchy = state.audioSyncReactivity === "punchy";
  const cooldown = punchy ? .12 : .18;
  if (impact >= .64 && (state.audioLastImpact || 0) < .64 && nowSeconds - (state.audioLastPulse || -10) >= cooldown - .000001) {
    state.audioCrests.push([nowSeconds, clamp(.48 + impact * .52, 0, 1)]);
    state.audioLastPulse = nowSeconds;
  }
  state.audioLastImpact = impact;
  state.audioCrests = state.audioCrests.filter(([started]) => nowSeconds - started <= .66).slice(-2);

  if (style === "velvet-relay") return mirrored.map((colour, index) => {
    const distance = Math.abs(index - 8) / 8;
    const wave = state.audioCrests.reduce((best, [started, strength]) => {
      const age = Math.max(0, nowSeconds - started), radius = clamp(age / .36, 0, 1) * 1.06, width = .18 + age * .12;
      return Math.max(best, Math.exp(-(((distance - radius) / width) ** 2)) * Math.max(0, 1 - age / .58) * strength);
    }, 0);
    const presence = clamp(bed * 4, 0, 1), level = (.06 + attack * .11 + texture * .07 * distance) * presence;
    return audioOpticalScale(colour, level + wave * .67, brightness);
  });

  if (style === "negative-bloom") return mirrored.map((colour, index) => {
    const distance = Math.abs(index - 8) / 8;
    let cut = 0, rim = 0;
    for (const [started, strength] of state.audioCrests) {
      const age = Math.max(0, nowSeconds - started), radius = clamp(age / .42, 0, 1) * 1.08;
      cut = Math.max(cut, Math.exp(-(((distance - radius) / .17) ** 2)) * Math.max(0, 1 - age / .60) * strength);
      rim = Math.max(rim, Math.exp(-(((distance - radius - .17) / .13) ** 2)) * Math.max(0, 1 - age / .56) * strength);
    }
    const presence = clamp(bed * 4, 0, 1), level = (.16 + attack * .10 + texture * .05 * distance) * presence;
    return cut > .44 ? [0, 0, 0] : audioOpticalScale(colour, level + rim * .30, brightness);
  });

  if (style === "stereo-lanterns") return mirrored.map((colour, index) => {
    const position = (index - 8) / 8, leftWidth = .28 + state.audioLeft * .12, rightWidth = .28 + state.audioRight * .12;
    const leftLobe = Math.exp(-(((position + .55) / leftWidth) ** 2)) * state.audioLeft;
    const rightLobe = Math.exp(-(((position - .55) / rightWidth) ** 2)) * state.audioRight;
    const mono = Math.exp(-((position / .20) ** 2)) * Math.max(0, impact - .36) * .46;
    return audioOpticalScale(colour, .035 + (leftLobe + rightLobe) * .52 + mono, brightness);
  });

  if (style === "constellation") {
    const levels = Array(17).fill(0);
    [[8, impact * .76], [4, attack * .57], [12, attack * .57], [1, texture * .48], [15, texture * .48]]
      .sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([index, strength]) => {
        if (strength < .12) return;
        levels[index] = Math.max(levels[index], strength);
        if (index > 0) levels[index - 1] = Math.max(levels[index - 1], strength * .24);
        if (index < 16) levels[index + 1] = Math.max(levels[index + 1], strength * .24);
      });
    return mirrored.map((colour, index) => audioOpticalScale(colour, levels[index], brightness));
  }

  if (style === "slow-prism") {
    const step = state.audioHistory.length;
    if (step % 8 === 1) state.audioHueTarget = clamp((texture - bass) * (26 / 360), -26 / 360, 26 / 360);
    state.audioHueShift = (state.audioHueShift || 0) + ((state.audioHueTarget || 0) - (state.audioHueShift || 0)) * .08;
    const roles = [mirrored[0], mirrored[4], mirrored[8]].map((colour) => {
      const [hue, lightness, saturation] = rgbToHsl(colour);
      return hslToRgb([hue + state.audioHueShift, lightness, saturation]);
    });
    const shifted = Array.from({ length: 17 }, (_, index) => {
      const distance = Math.abs(index - 8) / 8;
      return distance <= .5 ? blend(roles[2], roles[1], distance * 2) : blend(roles[1], roles[0], (distance - .5) * 2);
    });
    const spread = .20 + bed * .86;
    return shifted.map((colour, index) => {
      const distance = Math.abs(index - 8) / 8, edge = clamp((spread - distance) / .22, 0, 1);
      const side = index < 8 ? state.audioLeft : state.audioRight;
      return audioOpticalScale(colour, .035 + edge * (.22 + side * .30), brightness);
    });
  }

  const motion = punchy ? [.12, 1 / .12, .18] : [.24, 2.75, .52];
  if (impact > .70 && nowSeconds - (state.audioLastHifiCrest || -10) >= motion[0] - .000001) {
    state.audioHifiCrests = [...(state.audioHifiCrests || []), [nowSeconds, clamp(.45 + impact * .55, 0, 1)]];
    state.audioLastHifiCrest = nowSeconds;
  }
  state.audioHifiCrests = (state.audioHifiCrests || []).filter(([started]) => nowSeconds - started < motion[2] + .02);
  return mirrored.map((colour, index) => {
    const x = index / 8 - 1, distance = Math.abs(x), centre = Math.exp(-((distance / .24) ** 2));
    const shoulders = Math.exp(-(((distance - .48) / .24) ** 2)), edges = Math.exp(-(((distance - .93) / .22) ** 2));
    const stereoBalance = clamp((state.audioRight - state.audioLeft) * 2, -.45, .45), side = x < 0 ? 1 - stereoBalance : 1 + stereoBalance;
    const ring = state.audioHifiCrests.reduce((best, [started, strength]) => {
      const age = nowSeconds - started, radius = age * motion[1];
      return Math.max(best, Math.exp(-(((distance - radius) / .14) ** 2)) * Math.max(0, 1 - age / motion[2]) * strength);
    }, 0);
    const level = clamp(.025 + bed * .20 + centre * impact * .62 + shoulders * attack * .42 * side + edges * texture * .28 * side + ring * .44, 0, .90);
    return scale(colour, (level ** .68) * brightness / 255);
  });
}
function audioSyncFrame() {
  analyseAudioNow();
  const video = $("#audioSyncVideo"), colours = audioPaletteFrame();
  const frame = renderAudioPattern(colours, state.audioSyncBrightness, video.currentTime || clock / 1000);
  const playing = !video.paused && !video.ended && Boolean(audioContext);
  const position = Number.isFinite(video.currentTime) ? formatTime(video.currentTime) : "0:00";
  const duration = Number.isFinite(video.duration) ? formatTime(video.duration) : "0:00";
  const paletteName = state.audioSyncPalette.replaceAll("-", " ").toUpperCase();
  const colourSource = state.audioSyncPalette === "screen-sync"
    ? audioVideoSourceActive ? "SCREEN SYNC" : "SAPPHIRE FALLBACK"
    : state.audioSyncPalette === "artwork" ? state.audioArtworkPalette ? "ARTWORK" : "SAPPHIRE FALLBACK" : `${paletteName} PALETTE`;
  return {
    logical: frame, physical: frame,
    name: `Audio Sync · ${AUDIO_PATTERN_LABELS[state.audioSyncStyle]}`,
    readout: playing ? `${colourSource} · 60 ms · ${position} / ${duration}` : "Press play to analyse the soundtrack",
    explain: "All patterns share the same adaptive 10.2-second programme analysis. Only the spatial choreography changes.",
    badge: playing ? "LIVE AUDIO" : "AUDIO READY",
  };
}
function witcherVitalsFrame() {
  const frame = blank(), seconds = clock / 1000;
  const healthLit = state.witcherHealth > 0 ? Math.ceil(state.witcherHealth * 8 / 100) : 0;
  const staminaLit = state.witcherStamina > 0 ? Math.ceil(state.witcherStamina * 8 / 100) : 0;
  let healthBrightness = state.witcherCombat ? 205 : 155;
  if (state.witcherCombat && state.witcherHealth > 0 && state.witcherHealth <= 25) {
    healthBrightness = Math.round(125 + 65 * (.5 + .5 * Math.sin(seconds * Math.PI * 2)));
  }
  for (let index = 0; index < healthLit; index++) frame[index] = [healthBrightness, 10, 8];
  for (let offset = 0; offset < staminaLit; offset++) frame[16 - offset] = [190, 130, 18];
  if (state.witcherAdrenaline) {
    const brightness = [75, 135, 205][state.witcherAdrenaline - 1];
    frame[8] = [brightness, Math.round(brightness * .48), 8];
  }
  const toxicEdges = state.witcherToxicity > 0 ? Math.ceil(state.witcherToxicity * 4 / 100) : 0;
  const toxicGreen = Math.round(85 + state.witcherToxicity * 1.1);
  for (let index = 0; index < toxicEdges; index++) {
    frame[index] = [20, toxicGreen, 22]; frame[16 - index] = [20, toxicGreen, 22];
  }
  return { logical: frame, physical: frame, name: "The Witcher 3 · experimental HUD", readout: `Vitality ${state.witcherHealth}% · stamina ${state.witcherStamina}%`, explain: "Left: vitality. Centre: adrenaline. Right: stamina. Green edges: toxicity. Live use requires the verified companion script; this page is manual simulation only.", badge: "EXPERIMENTAL" };
}
function witcherSignFrame(overlay) {
  const elapsed = Math.max(0, (clock - overlay.start) / 1000), colour = WITCHER_SIGNS[overlay.sign];
  const frame = blank(), radius = Math.min(8, Math.floor(elapsed / .9 * 10));
  for (const [distance, strength] of [[radius, 1], [radius - 1, .42]]) {
    if (distance < 0) continue;
    for (const index of new Set([8 - distance, 8 + distance])) if (index >= 0 && index < 17) frame[index] = scale(colour, strength);
  }
  return { logical: frame, physical: frame, name: `${overlay.sign[0].toUpperCase()}${overlay.sign.slice(1)} cast`, readout: "0.9 s centre-out wave", explain: "A Sign briefly replaces the HUD, then the current vitality and stamina values return.", badge: "WITCHER SIGN" };
}
function controllerGroupRaw(variant, age) {
  const zones = controllerZones(), percents = controllerPercents(), frame = blank();
  const tips = zones.map((zone, player) => {
    const lit = controllerGaugeInto(frame, zone, percents[player], false, player);
    return lit.at(-1);
  });
  const revealEnd = { twin: 1.45, focus: 3.3, "double-welcome": 3.4 }[variant];
  if (state.padCount === 2) {
    const [left, right] = zones, [leftTip, rightTip] = tips;
    if (variant === "twin" && age < revealEnd) {
      const leftCount = controllerRound(left.filter((index) => isLit(frame[index])).length * age / revealEnd);
      const rightCount = controllerRound(right.filter((index) => isLit(frame[index])).length * age / revealEnd);
      left.slice(leftCount).forEach((index) => put(frame, index, OFF));
      right.slice(rightCount).forEach((index) => put(frame, index, OFF));
    } else if (variant === "focus" && age < revealEnd) {
      if (age < 1.7) {
        let index = Math.min(7, Math.floor(age / 1.7 * 8));
        if (index === leftTip) index -= 1;
        if (index >= 0) put(frame, index, WHITE);
      } else {
        const count = Math.min(8, Math.floor((age - 1.7) / 1.6 * 8) + 1);
        let index = 17 - count;
        if (index === rightTip) index += 1;
        if (index < 17) put(frame, index, WHITE);
      }
    } else if (variant === "double-welcome" && age < revealEnd) {
      let step;
      if (age < 1.45) step = Math.min(7, Math.floor(age / 1.45 * 8));
      else if (age < 1.9) step = 7;
      else step = Math.max(0, Math.min(7, Math.floor((3.4 - age) / 1.5 * 8)));
      const leftIndex = step === leftTip ? step - 1 : step;
      const rightIndex = 16 - step === rightTip ? 17 - step : 16 - step;
      if (leftIndex >= 0) put(frame, leftIndex, WHITE);
      if (rightIndex < 17) put(frame, rightIndex, WHITE);
    }
    if (age >= revealEnd) { if (leftTip !== undefined) put(frame, leftTip, WHITE); if (rightTip !== undefined) put(frame, rightTip, WHITE); }
    put(frame, 8, OFF);
    return frame;
  }
  if (variant === "twin" && age < revealEnd) {
    zones.forEach((zone) => {
      const visible = controllerRound(zone.filter((index) => isLit(frame[index])).length * age / revealEnd);
      zone.slice(visible).forEach((index) => put(frame, index, OFF));
    });
  } else if (variant === "focus" && age < revealEnd) {
    const slot = revealEnd / zones.length;
    const player = Math.min(zones.length - 1, Math.floor(age / slot));
    const zone = zones[player], localAge = age - player * slot;
    let position = Math.min(zone.length - 1, Math.floor(localAge / slot * zone.length));
    if (zone[position] === tips[player]) position = Math.max(0, position - 1);
    put(frame, zone[position], WHITE);
  } else if (variant === "double-welcome" && age < revealEnd) {
    zones.forEach((zone, player) => {
      let step;
      if (age < 1.45) step = Math.min(zone.length - 1, Math.floor(age / 1.45 * zone.length));
      else if (age < 1.9) step = zone.length - 1;
      else step = Math.max(0, Math.min(zone.length - 1, Math.floor((3.4 - age) / 1.5 * zone.length)));
      if (zone[step] === tips[player]) step = Math.max(0, step - 1);
      put(frame, zone[step], WHITE);
    });
  }
  if (age >= revealEnd) tips.forEach((tip) => { if (tip !== undefined) put(frame, tip, WHITE); });
  return frame;
}
function controllerSignalRaw(kind, variant, elapsed, percent, player) {
  const frame = blank(), cyan = hexToRgb(state.padCharge), red = hexToRgb(state.padLow);
  if (kind === "connect") {
    const introEnd = { welcome: 1.3, orbit: 2.3, handshake: 1.65 }[variant];
    if (elapsed < introEnd) {
      if (variant === "welcome") {
        const step = Math.min(7, Math.floor(elapsed / 1.3 * 8));
        put(frame, step, cyan); put(frame, 16 - step, cyan);
        if (step) { put(frame, step - 1, controllerScale(cyan, .45)); put(frame, 17 - step, controllerScale(cyan, .45)); }
      } else if (variant === "orbit") {
        const phase = elapsed < 1.15 ? elapsed / 1.15 : 2 - elapsed / 1.15;
        const index = Math.min(16, Math.max(0, Math.floor(phase * 16)));
        put(frame, index, WHITE); put(frame, index - 1, cyan); put(frame, index + 1, cyan);
      } else {
        const step = Math.min(8, Math.floor(elapsed / 1.65 * 9));
        put(frame, 8 - step, WHITE); put(frame, 8 + step, WHITE);
      }
    } else if (elapsed < 1.75 && variant === "welcome") fill(frame, 6, 10, WHITE);
    else {
      const lit = controllerGaugeInto(frame, controllerZones(1)[0], percent, false, player);
      if (lit.length) put(frame, lit.at(-1), WHITE);
    }
  } else if (kind === "low") {
    if (variant === "beacon") {
      if (elapsed < 1.25) {
        const count = Math.max(controllerRound((1 - elapsed / 1.25) * 17), controllerRound((percent || 0) / 100 * 17));
        fill(frame, 0, count - 1, hexToRgb(state.padMedium));
      } else {
        const lit = controllerGaugeInto(frame, controllerZones(1)[0], percent, false, player);
        lit.forEach((index) => put(frame, index, red));
        if ((1.5 < elapsed && elapsed < 1.73 || 1.91 < elapsed && elapsed < 2.15) && lit.length) put(frame, lit.at(-1), WHITE);
      }
    } else if (variant === "drain") {
      const lit = controllerGaugeInto(frame, controllerZones(1)[0], percent, false, player);
      lit.forEach((index) => put(frame, index, red));
      if (elapsed < 2.4) {
        const phase = elapsed < 1.2 ? elapsed / 1.2 : 2 - elapsed / 1.2;
        put(frame, Math.min(16, Math.max(0, Math.floor(phase * 16))), WHITE);
      }
    } else {
      const beat = elapsed < 2.2 && (elapsed % .92 < .24 || .38 < elapsed % .92 && elapsed % .92 < .58);
      const lit = controllerGaugeInto(frame, controllerZones(1)[0], percent, false, player);
      lit.forEach((index) => put(frame, index, beat ? WHITE : controllerScale(red, .7)));
      if (beat) put(frame, 8, red);
    }
  } else if (kind === "charging") controllerChargeInto(frame, controllerZones(1)[0], percent, variant, elapsed, false, player);
  return frame;
}
function controllerPreviewFrame(overlay) {
  const elapsed = Math.max(0, (clock - overlay.start) / 1000), variant = overlay.variant;
  if (overlay.kind === "gauge") return controllerFrame();
  const percents = controllerPercents(), target = clamp(overlay.target ?? state.controllerTarget, 0, percents.length - 1);
  const percent = overlay.kind === "low" ? Math.min(percents[target], state.lowThreshold) : percents[target];
  const raw = overlay.kind === "duo" ? controllerGroupRaw(variant, elapsed) : controllerSignalRaw(overlay.kind, variant, elapsed, percent, target);
  const frame = raw.map((colour) => controllerScale(colour, state.padBrightness / 100));
  const seats = state.padCount === 2 ? "Two controllers" : state.padCount === 3 ? "Three Seats" : state.padCount === 4 ? "Four Seats" : "Controller";
  const label = CONTROLLER_OPTIONS[overlay.kind]?.find(([id]) => id === variant)?.[1] || "preview";
  const readout = overlay.kind === "duo" ? percents.map((value, index) => `P${index + 1} ${value}%`).join(" · ") : `P${target + 1} · ${percent}%`;
  const colourMeaning = state.controllerColourMode === "players" ? "player seat colours" : "battery-level colours";
  return { logical: frame, physical: frame, name: `${overlay.kind === "duo" ? seats : overlay.kind === "low" ? "Low battery" : overlay.kind === "connect" ? "Controller connected" : "Charging"} · ${label}`, readout, explain: overlay.kind === "duo" ? `The ${label} choreography reveals every active seat with ${colourMeaning}.` : `The official full-bar signal announces Controller ${target + 1}, then the ${state.padCount}-controller gauge returns.`, badge: "CONTROLLER EVENT" };
}
function eventFrame(overlay) {
  const data = eventFrames[overlay.key];
  const elapsed = Math.max(0, (clock - overlay.start) / 1000);
  const index = data ? Math.min(data.frames.length - 1, Math.floor(elapsed * data.fps)) : 0;
  const frame = data ? data.frames[index] : blank();
  const title = Object.values(EVENT_OPTIONS).flat().find(([key]) => key === overlay.key)?.[1] || overlay.key;
  return { logical: frame, physical: frame, name: title, readout: `${Math.max(0, overlay.duration - elapsed).toFixed(1)} s`, explain: "This short light event takes the bar, then the live display underneath returns.", badge: "LIGHT EVENT" };
}
function addGlow(frame, position, width, colour, strength = 1) {
  for (let index = 0; index < 17; index++) {
    const weight = Math.max(0, 1 - Math.abs(index - position) / Math.max(.1, width)) * strength;
    const candidate = scale(colour, weight);
    if (Math.max(...candidate) > Math.max(...frame[index])) frame[index] = candidate;
  }
}
function launchPatternFrame(pattern, palette, seconds, strength = 1) {
  const frame = blank();
  const colours = palette.length > 1 ? palette : [palette[0], palette[0]];
  const phase = Math.max(0, seconds);
  if (pattern === "arpege-crossed") {
    const travel = (phase * 5.1) % 32, left = travel <= 16 ? travel : 32 - travel;
    addGlow(frame, left, 3, colours[0], strength); addGlow(frame, 16 - left, 3, colours[1], strength);
    if (colours[2]) addGlow(frame, 8 + Math.sin(phase * 2.2) * 5, 2.1, colours[2], strength * .72);
  } else if (pattern === "two-hands") {
    const radius = Math.abs(8 - ((phase * 4) % 16));
    addGlow(frame, 8 - radius, 2.7, colours[0], strength); addGlow(frame, 8 + radius, 2.7, colours[1], strength);
    if (colours[2]) addGlow(frame, 8, 2.5, colours[2], strength * (1 - radius / 8) * .85);
  } else if (pattern === "legato") {
    for (let index = 0; index < 17; index++) {
      const wave = (Math.sin(index * .58 - phase * 2) + 1) / 2;
      const base = Math.floor(phase / 2) % colours.length;
      frame[index] = scale(colours[(base + (wave >= .5 ? 1 : 0)) % colours.length], strength * (.45 + .5 * wave));
    }
  } else if (pattern === "nocturne") {
    const breath = .32 + .45 * (Math.sin(phase * 1.15 - Math.PI / 2) + 1) / 2;
    for (let index = 0; index < 17; index++) frame[index] = scale(colours[index % colours.length], strength * breath * (.55 + .35 * Math.cos(index * .42) ** 2));
    const spark = Math.floor(phase * 2.3) % 17;
    addGlow(frame, spark, 1.4, colours[(spark + 1) % colours.length], strength * .75);
  } else if (pattern === "crescendo") {
    const cycle = (phase % 3.2) / 3.2, reach = cycle * 8.8;
    for (let index = 0; index < 17; index++) {
      const distance = Math.abs(index - 8);
      if (distance <= reach) frame[index] = scale(colours[Math.min(colours.length - 1, Math.floor(distance / 8 * colours.length))], strength * (.45 + .55 * cycle));
    }
    addGlow(frame, 8 - reach, 1.7, colours[0], strength); addGlow(frame, 8 + reach, 1.7, colours[1], strength);
  } else if (pattern === "color-wipe") {
    const raw = phase * 7, head = Math.floor(raw % 23) - 3, colourIndex = Math.floor(raw / 23) % colours.length;
    for (let index = 0; index < 17; index++) if (index <= head) frame[index] = scale(colours[colourIndex], strength * .82);
    addGlow(frame, head, 2.4, colours[(colourIndex + 1) % colours.length], strength);
  } else if (pattern === "scanner") {
    const travel = (phase * 6.4) % 32, position = travel <= 16 ? travel : 32 - travel, colourIndex = Math.floor(phase / 2.5) % colours.length;
    addGlow(frame, position, 3.2, colours[colourIndex], strength);
    addGlow(frame, position - (travel <= 16 ? 2 : -2), 3.8, colours[(colourIndex + 1) % colours.length], strength * .32);
  } else if (pattern === "theater-chase") {
    const step = Math.floor(phase * 7.5);
    for (let index = 0; index < 17; index++) {
      if ((index + step) % 3 === 0) frame[index] = scale(colours[(Math.floor(index / 3) + Math.floor(step / 3)) % colours.length], strength);
      else if ((index + step) % 3 === 1) frame[index] = scale(colours[(index + 1) % colours.length], strength * .18);
    }
  } else if (pattern === "twinkle") {
    const tick = Math.floor(phase * 8);
    for (let index = 0; index < 17; index++) {
      const seed = (index * 73 + tick * 47 + (index + tick) * 19) % 101;
      if (seed < 24) addGlow(frame, index, 1.25, colours[(index * 5 + tick) % colours.length], strength * (.4 + .6 * (1 - seed / 24)));
    }
  } else if (pattern === "ripple") {
    [0, 1.1, 2.2].forEach((offset, colourIndex) => {
      const age = ((phase - offset) % 3.3 + 3.3) % 3.3, radius = age / 3.3 * 9.5;
      addGlow(frame, 8 - radius, 1.8, colours[colourIndex % colours.length], strength * (1 - age / 3.3));
      addGlow(frame, 8 + radius, 1.8, colours[colourIndex % colours.length], strength * (1 - age / 3.3));
    });
  }
  return frame;
}
function activeLaunchPalette() {
  const profile = state.launchProfiles[state.launchGame];
  const key = `${state.launchGame}:${state.launchSource}`;
  const raw = profile.paletteMode === "custom"
    ? profile.custom[state.launchColourCount]
    : state.launchArtworkPalettes[key]?.[state.launchColourCount];
  return Array.isArray(raw)
    ? raw.map((colour) => typeof colour === "string" ? hexToRgb(colour) : colour)
    : [];
}
function launchReadyFrame() {
  const palette = activeLaunchPalette();
  const frame = palette.length
    ? Array.from({ length: 17 }, (_, index) => palette[Math.min(palette.length - 1, Math.floor(index * palette.length / 17))])
    : blank();
  const profile = state.launchProfiles[state.launchGame];
  return {
    logical: frame,
    physical: frame,
    name: palette.length ? `${GAME_DATA[state.launchGame].title} · launch palette ready` : `${GAME_DATA[state.launchGame].title} · analysing artwork`,
    readout: palette.length
      ? `${palette.length} ${profile.paletteMode === "custom" ? "custom" : "artwork"} colours · AppID ${GAME_DATA[state.launchGame].id}`
      : `AppID ${GAME_DATA[state.launchGame].id}`,
    explain: palette.length
      ? "These are the exact colours the selected launch animation will use. Choose a pattern, then preview it."
      : "The selected artwork is being decoded locally before the launch preview becomes available.",
    badge: palette.length ? "LAUNCH READY" : "ANALYSING",
  };
}
function launchFrame() {
  const elapsed = Math.max(0, (clock - state.launchStarted) / 1000);
  if (!state.launchPlaying || elapsed >= state.launchDuration) {
    state.launchPlaying = false;
    return launchReadyFrame();
  }
  const envelope = Math.min(1, elapsed / .45, Math.max(0, state.launchDuration - elapsed) / .65);
  const frame = launchPatternFrame(state.launchPattern, activeLaunchPalette(), elapsed, envelope);
  const label = LAUNCH_PATTERNS.find(([key]) => key === state.launchPattern)?.[1] || state.launchPattern;
  return { logical: frame, physical: frame, name: `${GAME_DATA[state.launchGame].title} · ${label}`, readout: `${Math.ceil(state.launchDuration - elapsed)} s · AppID ${GAME_DATA[state.launchGame].id}`, explain: "A temporary launch layer uses only the selected two or three hues, plus darker values towards black. The permanent display returns afterwards.", badge: "GAME LAUNCH" };
}
function recolourFrame(raw, palette, brightness, phase) {
  return raw.map((pixel, index) => {
    const level = Math.max(...pixel);
    return level <= 0 ? [...OFF] : scale(palette[(index + Math.floor(phase * .7)) % palette.length], brightness / 255 * level / 255);
  });
}
function customizationFrame() {
  const pattern = state.customPattern;
  const palette = state.customColours.slice(0, state.customPaletteCount).map(hexToRgb);
  const phase = clock / 1000 * (.2 + state.customSpeed * .028);
  let frame;
  if (pattern === "steady") frame = Array.from({ length: 17 }, () => scale(palette[0], state.customBrightness / 255));
  else if (pattern.startsWith("event:")) {
    const key = pattern.slice(6), data = eventFrames[key];
    const raw = data?.frames?.[Math.floor(phase * data.fps) % data.frames.length] || blank();
    frame = recolourFrame(raw, palette, state.customBrightness, phase);
  } else if (pattern.startsWith("controller:")) {
    const [, kind, variant] = pattern.split(":");
    const raw = controllerPreviewFrame({ kind, variant, start: clock - (phase % 3.2) * 1000, duration: 99 }).logical;
    frame = recolourFrame(raw, palette, state.customBrightness, phase);
  } else if (pattern.startsWith("weather:")) {
    const [, condition, rawVariant] = pattern.split(":"), variant = Number(rawVariant);
    const loop = weatherFrames?.frames?.[condition]?.[variant];
    const raw = loop?.[Math.floor(phase * weatherFrames.fps) % loop.length] || blank();
    frame = recolourFrame(raw, palette, state.customBrightness, phase);
  } else frame = launchPatternFrame(pattern, palette, phase, state.customBrightness / 255);
  if (state.customDirection === "reverse") frame.reverse();
  const label = [...CUSTOMIZATION_GROUPS.flatMap(([, choices]) => choices)].find(([key]) => key === pattern)?.[1] || pattern;
  return { logical: frame, physical: frame, name: `Customization+ · ${label}`, readout: `${state.customPaletteCount} colour${state.customPaletteCount === 1 ? "" : "s"} · ${state.customBrightness}/255 · speed ${state.customSpeed}`, explain: "A permanent GabeCubeAura display. Short alerts, launch animations and countdowns can temporarily take priority, then this scene returns.", badge: "CUSTOMIZATION+" };
}
 function activeContext(placement) { return placement === "everywhere" || (placement === "home" && state.context === "home"); }
function getCurrentOutput() {
  const countdownActive = state.timerRunning && state.timerRemaining > 0 && (state.timerSource !== "families" || state.context === "game");
  if (countdownActive && state.timerRemaining <= 300) return countdownFrame();
  if (state.overlay && (clock - state.overlay.start) / 1000 < state.overlay.duration) {
    if (state.overlay.type === "event") return eventFrame(state.overlay);
    if (state.overlay.type === "witcher-sign") return witcherSignFrame(state.overlay);
    return controllerPreviewFrame(state.overlay);
  }
  if (state.overlay) state.overlay = null;
  if (state.launchPlaying) return launchFrame();
  if (countdownActive) return countdownFrame();
  if (state.tab === "launches") return launchReadyFrame();
  if (state.tab === "audio-sync") return audioSyncFrame();
  if (state.tab === "screen-sync") return screenSyncFrame();
  if (state.tab === "witcher") return witcherVitalsFrame();
  if (state.display === "disabled") return { logical: blank(), physical: blank(), name: "GabeCubeAura Off", readout: "Steam keeps the bar", explain: "No permanent GabeCubeAura display is selected here. Temporary GabeCubeAura layers can still appear; the master switch in the real plugin is the control that stops everything.", badge: "GABECUBEAURA OFF" };
  const chargeContext = state.chargeMode === "continuous-everywhere" || (state.chargeMode === "continuous-home" && state.context === "home");
  const persistentContext = activeContext(state.controllerWhere);
  const activeControllerPercent = controllerPercents()[state.controllerTarget] ?? state.padOne;
  if ((state.padCharging && chargeContext && activeControllerPercent < 100) || persistentContext) return controllerFrame();
  if (state.weatherWhere === "everywhere" || state.weatherWhere === state.context) return weatherFrame();
  let output;
  if (state.display === "customization") output = customizationFrame();
  else if (state.display === "audio-sync") output = audioSyncFrame();
  else if (state.display === "performance" && (state.context === "game" || state.perfHome)) output = performanceFrames();
  else if (state.display === "artwork" && state.context === "game") output = artworkFrame();
  else output = { logical: blank(), physical: blank(), name: "GabeCubeAura Off", readout: "Steam keeps the bar", explain: "Choose a permanent display for this context, or leave GabeCubeAura Off to keep Steam's own light-bar behaviour.", badge: "GABECUBEAURA OFF" };
  if (state.recording && (output.badge === "PERFORMANCE" || output.badge === "ARTWORK")) {
    output.logical = output.logical.map((color) => [...color]);
    output.physical = output.physical.map((color) => [...color]);
    if (state.recordIsolation) for (const index of [7, 9]) { output.logical[index] = [...OFF]; output.physical[index] = [...OFF]; }
    output.logical[8] = [...RED]; output.physical[8] = [...RED];
    output.name += " · recording";
    output.explain = "The centre LED marks active recording. Its neighbours can be isolated for better contrast.";
  }
  return output;
}

function drawPhysical(frame) {
  const canvas = $("#ledCanvas");
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.round(bounds.width * ratio), height = Math.round(bounds.height * ratio);
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  // With reversal enabled, the hardware mapping corrects its native right-to-left order.
  // Show the viewer-facing result, not the byte order sent to sysfs.
  const ordered = state.reversePhysical ? frame : [...frame].reverse();
  // Raw PWM values look much darker on an LCD than the emitted light behind
  // the Steam Machine diffuser. Lift the physical illustration only; the
  // logical 17-pixel preview above keeps the exact renderer values.
  const pixels = ordered.map((colour) => emissivePreviewColour(colour, .50));
  const cell = width / 17, centreY = height * .48;
  ctx.globalCompositeOperation = "screen";
  pixels.forEach((color, index) => {
    if (!isLit(color)) return;
    const x = (index + .5) * cell;
    const radius = cell * 1.32;
    const glow = ctx.createRadialGradient(x, centreY, 0, x, centreY, radius);
    const rgb = color.join(",");
    glow.addColorStop(0, `rgba(${rgb},.68)`);
    glow.addColorStop(.4, `rgba(${rgb},.27)`);
    glow.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, centreY - radius, radius * 2, radius * 2);
  });
  ctx.globalCompositeOperation = "source-over";
  const diffuser = ctx.createLinearGradient(0, 0, width, 0);
  pixels.forEach((color, index) => diffuser.addColorStop((index + .5) / 17, `rgba(${color.join(",")},${isLit(color) ? 1 : 0})`));
  ctx.fillStyle = diffuser;
  ctx.fillRect(0, centreY - height * .045, width, height * .09);
}
function renderStage() {
  const output = getCurrentOutput();
  $("#audioSyncVideo").hidden = !["audio-sync", "screen-sync"].includes(state.tab);
  ledElements.forEach((element, index) => {
    const color = output.logical[index] || OFF;
    element.style.background = isLit(color) ? rgbToHex(color) : "#33454e";
    const glow = "";
    element.style.boxShadow = glow;
    mobileLedElements[index].style.background = element.style.background;
  });
  $("#logicalLeds").setAttribute("aria-label", `${output.name}: ${output.logical.filter(isLit).length} of 17 logical LEDs lit`);
  drawPhysical(output.physical || output.logical);
  $("#signalName").textContent = output.name;
  $("#signalReadout").textContent = output.readout;
  $("#stageExplain").textContent = output.explain;
  const controllerLegend = $("#controllerSeatLegend"), showControllerSeats = state.tab === "controllers";
  $("#logicalFoot").hidden = showControllerSeats;
  controllerLegend.hidden = !showControllerSeats;
  if (showControllerSeats) {
    const percents = controllerPercents();
    const legendKey = `${state.controllerColourMode}:${state.padPlayerColours.join(":")}:${percents.join(":")}`;
    if (controllerLegend.dataset.key !== legendKey) {
      controllerLegend.dataset.key = legendKey;
      controllerLegend.style.gridTemplateColumns = `repeat(${percents.length}, minmax(0, 1fr))`;
      controllerLegend.replaceChildren(...percents.map((percent, index) => {
        const seat = document.createElement("span");
        seat.innerHTML = `<b>P${index + 1}</b><small>${percent}%</small>`;
        if (state.controllerColourMode === "players") {
          const colour = state.padPlayerColours[index];
          seat.style.borderColor = colour;
          seat.style.background = `${colour}1f`;
          seat.querySelector("b").style.color = colour;
        }
        return seat;
      }));
    }
  }
  $("#providerBadge").textContent = output.badge;
  $("#mobileSignal").textContent = output.name;
  const stagedGame = state.tab === "launches" ? state.launchGame : state.game;
  if (["audio-sync", "screen-sync"].includes(state.tab)) {
    $("#contextLabel").textContent = `${state.tab === "audio-sync" ? "GAMEPLAY AUDIO" : "GAMEPLAY VIDEO"} · ${AUDIO_EXAMPLES[state.audioSyncExample].title}`;
    $("#contextSwitch").disabled = true;
    $("#contextSwitch").textContent = "LOCAL MEDIA";
  } else {
    $("#contextLabel").textContent = state.context === "home" ? "STEAM HOME" : `IN GAME · ${GAME_DATA[stagedGame].title}`;
    $("#contextSwitch").disabled = false;
    $("#contextSwitch").textContent = state.context === "home" ? "Go in game ↔" : "Go Home ↔";
    $("#pauseDemo").textContent = state.paused ? "▶" : "Ⅱ";
    $("#pauseDemo").setAttribute("aria-label", state.paused ? "Play animation" : "Pause animation");
  }
  if (state.tab === "launches") {
    const remaining = Math.max(0, state.launchDuration - (clock - state.launchStarted) / 1000);
    const paletteReady = activeLaunchPalette().length === state.launchColourCount;
    $("#launchStatus").textContent = state.launchPlaying ? `Playing · ${Math.ceil(remaining)} s` : paletteReady ? `Ready · ${state.launchDuration} s` : "Waiting for colours";
  }
  if (state.tab === "audio-sync") syncAudioPlaybackUI();
  if (state.tab === "screen-sync") syncScreenPlaybackUI();
}
function tick(realNow) {
  const elapsed = clamp(realNow - lastRealTime, 0, 100);
  lastRealTime = realNow;
  if (!state.paused) {
    clock += elapsed;
    const time = elapsed / 1000;
    if (state.timerRunning && state.timerRemaining > 0) {
      state.timerRemaining = Math.max(0, state.timerRemaining - time * state.timerSpeed);
      state.timerElapsed += time;
      if (state.timerRemaining === 0) state.timerRunning = false;
      $("#timerRemainingValue").textContent = formatTime(state.timerRemaining);
      $("#timerRemaining").value = String(Math.round(state.timerRemaining));
    }
    const smoothing = state.response === "responsive" ? .18 : state.response === "smooth" ? 2.5 : .7;
    const alpha = 1 - Math.exp(-time / smoothing);
    state.shownCpu += (state.cpu - state.shownCpu) * alpha;
    state.shownGpu += (state.gpu - state.shownGpu) * alpha;
  }
  renderStage();
  requestAnimationFrame(tick);
}

function getSampleRow() {
  return state.artMode === "center" ? 50 : state.artMode === "lower" ? 76 : state.artMode === "auto" ? state.autoRow : state.artRow;
}
function saveGameArtworkChoice() {
  if (state.artCustom) return;
  const settings = state.gameSettings[state.game];
  settings.source = state.artSource;
  settings.mode = state.artMode;
  settings.row = state.artRow;
}
function updateSampleLine() {
  const image = $("#artImage");
  const frame = $(".art-image-wrap").getBoundingClientRect();
  const rect = image.getBoundingClientRect();
  const line = $("#sampleLine");
  line.style.left = `${rect.left - frame.left}px`;
  line.style.width = `${rect.width}px`;
  line.style.top = `${rect.top - frame.top + rect.height * getSampleRow() / 100}px`;
  $("#artTypeLabel").textContent = `${state.artCustom ? "Your image" : IMAGE_LABELS[state.artSource]} · row ${getSampleRow()}%`;
  $("#artRowValue").textContent = `${getSampleRow()}%`;
}
function updateMobilePreviewVisibility() {
  const settings = $(".settings-shell").getBoundingClientRect();
  const stage = $(".stage-shell").getBoundingClientRect();
  const visible = window.innerWidth <= 850 && stage.bottom < 0 && settings.top < window.innerHeight && settings.bottom > 0;
  $("#mobilePreview").classList.toggle("visible", visible);
}
function sampleArtwork(image) {
  if (!image.naturalWidth || !image.naturalHeight) return;
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(image.naturalWidth, 680);
  canvas.height = Math.min(image.naturalHeight, 360);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const y = clamp(Math.round((canvas.height - 1) * getSampleRow() / 100), 0, canvas.height - 1);
  let data;
  try { data = context.getImageData(0, y, canvas.width, 1).data; }
  catch { updateSampleLine(); return; }
  state.artworkColors = Array.from({ length: 17 }, (_, index) => {
    const start = Math.floor(index * canvas.width / 17), end = Math.max(start + 1, Math.floor((index + 1) * canvas.width / 17));
    const sum = [0, 0, 0];
    for (let x = start; x < end; x++) for (let channel = 0; channel < 3; channel++) sum[channel] += data[x * 4 + channel];
    return sum.map((value) => Math.round(value / (end - start)));
  });
  updateSampleLine();
}
function findAutoRow(image) {
  const canvas = document.createElement("canvas");
  canvas.width = 170; canvas.height = 100;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let data;
  try { data = context.getImageData(0, 0, canvas.width, canvas.height).data; }
  catch { state.autoRow = state.gameSettings[state.game]?.row ?? 59; return; }
  let best = { row: 59, score: -1 };
  for (let row = 18; row <= 82; row += 4) {
    let saturation = 0, contrast = 0;
    for (let index = 0; index < 17; index++) {
      const x = Math.floor((index + .5) * canvas.width / 17);
      const offset = (row * canvas.width + x) * 4;
      const color = [data[offset], data[offset + 1], data[offset + 2]];
      saturation += Math.max(...color) - Math.min(...color);
      if (index) {
        const previous = (row * canvas.width + Math.floor((index - .5) * canvas.width / 17)) * 4;
        contrast += color.reduce((sum, value, channel) => sum + Math.abs(value - data[previous + channel]), 0);
      }
    }
    const score = saturation + contrast * .55;
    if (score > best.score) best = { row, score };
  }
  state.autoRow = best.row;
}
function loadArtwork() {
  const image = $("#artImage");
  const token = ++artworkLoadToken;
  const source = state.artCustom || `assets/${state.game}-${state.artSource}.jpg`;
  $("#artTitle").textContent = state.artCustom ? "Your image" : GAME_DATA[state.game].title;
  image.onload = () => { if (token === artworkLoadToken) { findAutoRow(image); sampleArtwork(image); requestAnimationFrame(updateSampleLine); } };
  image.onerror = () => { $("#artTypeLabel").textContent = "Artwork unavailable"; };
  if (image.src !== new URL(source, location.href).href) image.src = source;
  else if (image.complete) { findAutoRow(image); sampleArtwork(image); }
}
function dominantArtworkColours(image, count, fallbackKey) {
  const canvas = document.createElement("canvas"), context = canvas.getContext("2d", { willReadFrequently: true });
  const ratio = Math.min(1, 120 / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let data;
  try { data = context.getImageData(0, 0, canvas.width, canvas.height).data; }
  catch { return SAMPLE_ARTWORK_PALETTES[fallbackKey]?.[count]?.map((colour) => [...colour]) || []; }
  const samples = [];
  for (let offset = 0; offset < data.length; offset += 16) {
    const color = [data[offset], data[offset + 1], data[offset + 2]], max = Math.max(...color), min = Math.min(...color);
    if (data[offset + 3] > 200 && max > 18 && !(min > 238 && max - min < 9)) samples.push(color);
  }
  if (!samples.length) return Array.from({ length: count }, () => [120, 120, 120]);
  const vividness = (color) => Math.max(...color) - Math.min(...color) + Math.max(...color) * .14;
  const centres = [samples.reduce((best, color) => vividness(color) > vividness(best) ? color : best, samples[0])];
  while (centres.length < count) centres.push(samples.reduce((best, color) => {
    const distance = (candidate) => Math.min(...centres.map((centre) => centre.reduce((sum, channel, index) => sum + (channel - candidate[index]) ** 2, 0)));
    return distance(color) * (.5 + vividness(color) / 255) > distance(best) * (.5 + vividness(best) / 255) ? color : best;
  }, samples[0]));
  let groups = [];
  for (let pass = 0; pass < 8; pass++) {
    groups = Array.from({ length: count }, () => []);
    samples.forEach((color) => {
      const index = centres.map((centre) => centre.reduce((sum, channel, channelIndex) => sum + (channel - color[channelIndex]) ** 2, 0))
        .reduce((best, value, index, values) => value < values[best] ? index : best, 0);
      groups[index].push(color);
    });
    groups.forEach((group, index) => {
      if (group.length) centres[index] = [0, 1, 2].map((channel) => Math.round(group.reduce((sum, color) => sum + color[channel], 0) / group.length));
    });
  }
  return centres.map((colour, index) => ({ colour, size: groups[index].length }))
    .sort((a, b) => b.size - a.size).map(({ colour }) => colour);
}
function loadLaunchArtwork() {
  const image = $("#launchArtImage");
  const game = state.launchGame, artworkSource = state.launchSource;
  const source = `assets/${game}-${artworkSource}.jpg`, key = `${game}:${artworkSource}`;
  const token = ++launchArtworkLoadToken;
  $("#launchPaletteStatus").textContent = `Analysing ${IMAGE_LABELS[artworkSource]} for ${GAME_DATA[game].title}…`;
  if (!state.launchArtworkPalettes[key]) {
    $("#launchPalette").replaceChildren();
    $("#launchPalette").dataset.paletteKey = "";
    if (state.launchProfiles[game].paletteMode === "artwork") $("#launchPreview").disabled = true;
  }
  image.onload = () => {
    const palettes = { 2: dominantArtworkColours(image, 2, key), 3: dominantArtworkColours(image, 3, key) };
    state.launchArtworkPalettes[key] = palettes;
    if (token === launchArtworkLoadToken && game === state.launchGame && artworkSource === state.launchSource) syncLaunchUI();
  };
  image.onerror = () => {
    if (token !== launchArtworkLoadToken) return;
    $("#launchArtType").textContent = "Artwork unavailable";
    $("#launchPaletteStatus").textContent = "No colours available for this artwork source.";
    $("#launchPreview").disabled = state.launchProfiles[state.launchGame].paletteMode === "artwork";
  };
  if (image.src !== new URL(source, location.href).href) image.src = source;
  else if (image.complete) image.onload();
  $("#launchArtTitle").textContent = `${GAME_DATA[game].title} · AppID ${GAME_DATA[game].id}`;
}
function renderPalette(target, colours) {
  target.replaceChildren(...colours.map((colour, index) => {
    const item = document.createElement("span"), rgb = typeof colour === "string" ? hexToRgb(colour) : colour;
    item.style.background = rgbToHex(rgb); item.title = `Colour ${index + 1} · ${rgbToHex(rgb).toUpperCase()} · RGB ${rgb.join(", ")}`;
    return item;
  }));
}
function syncCustomizationUI() {
  const select = $("#customPattern");
  if (!select.options.length) select.replaceChildren(...CUSTOMIZATION_GROUPS.map(([label, choices]) => {
    const group = document.createElement("optgroup"); group.label = label;
    group.append(...choices.map(([value, text]) => new Option(text, value)));
    return group;
  }));
  select.value = state.customPattern;
  $("#customPaletteCount").value = String(state.customPaletteCount);
  $("#customDirection").value = state.customDirection;
  state.customColours.forEach((colour, index) => {
    $(`#customColour${index + 1}`).value = colour.toLowerCase();
    $(`#customHex${index + 1}`).value = colour.toUpperCase();
  });
  for (const index of [2, 3]) $(`[data-custom-colour="${index}"]`).hidden = state.customPaletteCount < index;
  const steady = state.customPattern === "steady";
  $("#customSpeed").disabled = steady;
  $("#customDirection").disabled = steady;
}
function syncLaunchUI() {
  const profile = state.launchProfiles[state.launchGame], count = state.launchColourCount;
  $("#launchSource").value = state.launchSource;
  $("#launchPaletteMode").value = profile.paletteMode;
  $("#launchColourCount").value = String(count);
  $("#launchPattern").value = state.launchPattern;
  $("#launchCustomColours").hidden = profile.paletteMode !== "custom";
  $("[data-launch-colour=\"3\"]").hidden = count < 3;
  profile.custom[count].forEach((colour, index) => {
    $(`#launchColour${index + 1}`).value = colour.toLowerCase();
    $(`#launchHex${index + 1}`).value = colour.toUpperCase();
  });
  $("#launchArtTitle").textContent = `${GAME_DATA[state.launchGame].title} · AppID ${GAME_DATA[state.launchGame].id}`;
  $("#launchArtType").textContent = `${IMAGE_LABELS[state.launchSource]} · ${profile.paletteMode === "custom" ? "custom AppID palette" : "artwork palette"}`;
  const palette = activeLaunchPalette(), ready = palette.length === count;
  renderPalette($("#launchPalette"), palette);
  $("#launchPalette").dataset.paletteKey = ready ? `${state.launchGame}:${state.launchSource}:${profile.paletteMode}:${count}` : "";
  $("#launchPaletteStatus").textContent = ready
    ? `${profile.paletteMode === "custom" ? "Saved for this AppID" : "Extracted locally"}: ${palette.map((colour) => rgbToHex(colour).toUpperCase()).join(" · ")}`
    : `Analysing ${IMAGE_LABELS[state.launchSource]} for ${GAME_DATA[state.launchGame].title}…`;
  $("#launchPreview").disabled = !ready;
  $$('[data-launch-game]').forEach((button) => button.classList.toggle("selected", button.dataset.launchGame === state.launchGame));
}
function startLaunchPreview() {
  if (activeLaunchPalette().length !== state.launchColourCount) return;
  state.launchStarted = clock; state.launchPlaying = true; state.context = "game"; state.overlay = null; state.timerRunning = false;
  $("#contextChoice").value = "game";
}
function syncAudioUI() {
  if (audioVideoStyle !== state.audioSyncStyle) {
    audioVideoStyle = state.audioSyncStyle;
    resetAudioVideoProcessor();
  }
  $("#audioSyncExample").value = state.audioSyncExample;
  $("#screenSyncExample").value = state.audioSyncExample;
  $("#audioSyncStyle").value = state.audioSyncStyle;
  $("#audioSyncReactivity").value = state.audioSyncReactivity;
  $("#audioSyncBrightness").value = String(state.audioSyncBrightness);
  $("#audioSyncPalette").value = state.audioSyncPalette;
  $("#audioSyncCustomColours").hidden = state.audioSyncPalette !== "custom";
  ["High", "Middle", "Low"].forEach((name, index) => {
    $(`#audioSyncColour${name}`).value = state.audioSyncColours[index];
  });
  const paletteName = state.audioSyncPalette.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
  $("#audioSyncPaletteHelp").textContent = state.audioSyncPalette === "screen-sync"
    ? "Screen Sync extracts three coherent colours from the live frame. Artwork is the first fallback, then Sapphire."
    : state.audioSyncPalette === "artwork"
      ? "Artwork holds three coherent colours from the active game's artwork. Sapphire is used when artwork is unavailable."
      : `${paletteName} assigns high texture to the edges, mid attack to the shoulders and low impact to the centre.`;
  const [recommendedBrightness, recommendedReactivity] = AUDIO_TUNING[state.audioSyncStyle];
  $("#audioTuningNote").textContent = `Recommended: ${recommendedReactivity[0].toUpperCase() + recommendedReactivity.slice(1)} · Brightness ${recommendedBrightness} / 255.`;
  updateAudioBands();
}
function syncAudioPlaybackUI() {
  const video = $("#audioSyncVideo");
  const example = AUDIO_EXAMPLES[state.audioSyncExample];
  const duration = Number.isFinite(video.duration) ? formatTime(video.duration) : "0:00";
  const position = Number.isFinite(video.currentTime) ? formatTime(video.currentTime) : "0:00";
  $("#audioSyncState").textContent = video.error ? "Video unavailable" : video.paused ? "Ready" : "Analysing live audio";
  $("#audioSyncTime").textContent = video.error
    ? "The local gameplay file could not be decoded"
    : video.paused ? `${example.title} · ${position} / ${duration} · playback paused` : `${example.title} · ${position} / ${duration} · ${Math.round((audioContext?.sampleRate || 48000) / 1000)} kHz decoded locally`;
  $("#audioSyncPlay").textContent = video.paused ? "Play Audio Sync" : "Pause Audio Sync";
  if (state.tab === "audio-sync") {
    $("#pauseDemo").textContent = video.paused ? "▶" : "Ⅱ";
    $("#pauseDemo").setAttribute("aria-label", video.paused ? "Play gameplay audio" : "Pause gameplay audio");
  }
}
function syncScreenPlaybackUI() {
  const video = $("#audioSyncVideo");
  $("#screenSyncPlay").textContent = video.paused ? "Play Screen Sync" : "Pause Screen Sync";
  if (state.tab === "screen-sync") {
    $("#pauseDemo").textContent = video.paused ? "▶" : "Ⅱ";
    $("#pauseDemo").setAttribute("aria-label", video.paused ? "Play gameplay video" : "Pause gameplay video");
  }
}
function selectGameplayExample(key) {
  const video = $("#audioSyncVideo"), example = AUDIO_EXAMPLES[key] || AUDIO_EXAMPLES.silksong;
  video.pause();
  state.audioSyncExample = key in AUDIO_EXAMPLES ? key : "silksong";
  state.audioLevels.fill(0); state.audioLeft = 0; state.audioRight = 0;
  state.audioHistory = []; state.audioCrests = []; state.audioHifiCrests = []; state.audioArtworkPalette = null;
  state.audioLastImpact = 0; state.audioLastPulse = -10; state.audioLastHifiCrest = -10; state.audioHueShift = 0; state.audioHueTarget = 0;
  state.audioMetrics = { impact: 0, attack: 0, texture: 0, stereo: 0, window: 0 };
  resetAudioVideoProcessor();
  video.src = example.source;
  video.setAttribute("aria-label", `${example.title} gameplay used for the Audio Sync and Screen Sync demonstrations`);
  video.load();
  $("#audioSyncExample").value = state.audioSyncExample;
  $("#screenSyncExample").value = state.audioSyncExample;
  syncAudioPlaybackUI();
  syncScreenPlaybackUI();
}
async function ensureAudioGraph() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) throw new Error("Web Audio is unavailable in this browser");
  if (!audioContext) {
    const video = $("#audioSyncVideo");
    audioContext = new Context({ sampleRate: 48000 });
    audioMediaSource = audioContext.createMediaElementSource(video);
    const splitter = audioContext.createChannelSplitter(2);
    audioLeftAnalyser = audioContext.createAnalyser();
    audioRightAnalyser = audioContext.createAnalyser();
    audioLeftAnalyser.fftSize = 2048;
    audioRightAnalyser.fftSize = 2048;
    audioLeftAnalyser.smoothingTimeConstant = 0;
    audioRightAnalyser.smoothingTimeConstant = 0;
    const silent = audioContext.createGain();
    silent.gain.value = 0;
    audioMediaSource.connect(audioContext.destination);
    audioMediaSource.connect(splitter);
    splitter.connect(audioLeftAnalyser, 0);
    splitter.connect(audioRightAnalyser, 1);
    audioLeftAnalyser.connect(silent);
    audioRightAnalyser.connect(silent);
    silent.connect(audioContext.destination);
    audioLeftData = new Float32Array(audioLeftAnalyser.fftSize);
    audioRightData = new Float32Array(audioRightAnalyser.fftSize);
  }
  if (audioContext.state === "suspended") await audioContext.resume();
}
async function toggleAudioPlayback() {
  const video = $("#audioSyncVideo");
  try {
    await ensureAudioGraph();
    if (video.paused) await video.play();
    else video.pause();
  } catch (error) {
    $("#audioSyncState").textContent = "Audio analysis unavailable";
    $("#audioSyncTime").textContent = error instanceof Error ? error.message : String(error);
  }
  syncAudioPlaybackUI();
  syncScreenPlaybackUI();
}
function setTab(tab, configure = true) {
  if (["audio-sync", "screen-sync"].includes(state.tab) && !["audio-sync", "screen-sync"].includes(tab)) $("#audioSyncVideo").pause();
  state.tab = tab;
  $$(".tab").forEach((button) => { const active = button.dataset.tab === tab; button.classList.toggle("active", active); button.setAttribute("aria-selected", String(active)); });
  $$(".pane").forEach((pane) => pane.classList.toggle("active", pane.dataset.pane === tab));
  if (configure) {
    state.overlay = null;
    if (tab === "customization") { state.display = "customization"; state.context = "home"; state.timerRunning = false; state.launchPlaying = false; state.controllerWhere = "off"; state.weatherWhere = "off"; state.padCharging = false; $("#controllerWhere").value = "off"; $("#weatherWhere").value = "off"; $("#padCharging").checked = false; }
    if (tab === "artwork") { const chosen = state.gameSettings[state.game].display; state.display = chosen === "inherit" ? "artwork" : chosen; state.context = "game"; state.timerRunning = false; state.launchPlaying = false; }
    if (tab === "performance") { state.display = "performance"; state.context = "game"; state.timerRunning = false; }
    if (tab === "launches") { state.display = "artwork"; state.context = "game"; state.timerRunning = false; state.launchPlaying = false; syncLaunchUI(); }
    if (tab === "playtime") { state.display = "performance"; state.context = "game"; state.timerRunning = true; }
    if (tab === "controllers") { state.display = "performance"; state.context = "home"; state.timerRunning = false; state.padCharging = false; state.controllerWhere = "home"; state.weatherWhere = "off"; $("#controllerWhere").value = "home"; $("#weatherWhere").value = "off"; $("#padCharging").checked = false; }
    if (tab === "weather") { state.display = "performance"; state.context = "home"; state.timerRunning = false; state.padCharging = false; state.controllerWhere = "off"; state.weatherWhere = "home"; state.weatherStart = clock; $("#controllerWhere").value = "off"; $("#weatherWhere").value = "home"; $("#padCharging").checked = false; }
    if (tab === "audio-sync") { state.display = "audio-sync"; state.context = "game"; state.timerRunning = false; state.launchPlaying = false; state.controllerWhere = "off"; state.weatherWhere = "off"; }
    if (tab === "screen-sync") { state.context = "game"; state.timerRunning = false; state.launchPlaying = false; state.controllerWhere = "off"; state.weatherWhere = "off"; state.screenSyncStart = clock; resetAudioVideoProcessor(); }
    if (tab === "witcher") { state.game = "witcher"; state.context = "game"; state.timerRunning = false; state.launchPlaying = false; state.controllerWhere = "off"; state.weatherWhere = "off"; }
    if (tab === "events") { state.display = "performance"; state.context = "game"; state.timerRunning = false; playEvent(); }
    $("#contextChoice").value = state.context;
    $("#displayChoice").value = state.display;
  }
  requestAnimationFrame(updateSampleLine);
}
function choosePreset(preset) {
  if (preset === "customization") setTab("customization");
  if (preset === "artwork") setTab("artwork");
  if (preset === "performance") setTab("performance");
  if (preset === "launches") { setTab("launches"); startLaunchPreview(); }
  if (preset === "playtime") setTab("playtime");
  if (preset === "controllers") setTab("controllers");
  if (preset === "weather") setTab("weather");
  if (preset === "audio-sync") setTab("audio-sync");
  if (preset === "screen-sync") setTab("screen-sync");
  if (preset === "witcher") setTab("witcher");
  if (preset === "notification" || preset === "achievement") {
    state.eventKind = preset;
    setTab("events", false);
    state.context = "game"; state.display = "performance"; state.timerRunning = false;
    syncEventUI(); playEvent();
  }
}
function syncEventUI() {
  $$("[data-event-kind]").forEach((button) => button.classList.toggle("selected", button.dataset.eventKind === state.eventKind));
  const choices = EVENT_OPTIONS[state.eventKind];
  $("#eventVariant").replaceChildren(...choices.map(([key, label]) => new Option(label, key)));
  $("#eventVariant").value = state.eventVariants[state.eventKind];
  const selected = choices.find(([key]) => key === state.eventVariants[state.eventKind]) || choices[0];
  $("#eventEyebrow").textContent = state.eventKind.toUpperCase();
  $("#eventName").textContent = selected[1];
  $("#eventDescription").textContent = selected[2];
  $("#recordToggle").hidden = state.eventKind !== "recording";
  $("#recordIsolationRow").hidden = state.eventKind !== "recording";
  $("#recordingHelp").hidden = state.eventKind !== "recording";
  $("#recordToggle").textContent = state.recording ? "Stop recording" : "Start recording";
  $("#eventPlay").textContent = state.eventKind === "recording" ? "Replay cue" : "Play this signal";
}
function playEvent(key = state.eventVariants[state.eventKind]) {
  const duration = eventFrames[key]?.duration || 2.5;
  state.overlay = { type: "event", key, start: clock, duration };
}
function syncControllerUI() {
  state.controllerTarget = clamp(state.controllerTarget, 0, state.padCount - 1);
  const groupOption = $('#controllerScene option[value="duo"]');
  groupOption.textContent = state.padCount === 2 ? "Two controllers" : state.padCount === 3 ? "Three Seats" : state.padCount === 4 ? "Four Seats" : "Multiple controllers";
  groupOption.disabled = state.padCount === 1;
  if (state.padCount === 1 && state.controllerScene === "duo") state.controllerScene = "gauge";
  $("#controllerScene").value = state.controllerScene;
  $$('[data-controller-row]').forEach((row) => { row.hidden = Number(row.dataset.controllerRow) > state.padCount; });
  $("#controllerTarget").replaceChildren(...Array.from({ length: state.padCount }, (_, index) => new Option(`Controller ${index + 1}`, String(index))));
  $("#controllerTarget").value = String(state.controllerTarget);
  $("#padChargingLabel").textContent = `Controller ${state.controllerTarget + 1} charging`;
  $$('[data-controller-colour-mode]').forEach((button) => {
    const selected = button.dataset.controllerColourMode === state.controllerColourMode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  $("#controllerBatteryColours").hidden = state.controllerColourMode !== "battery";
  $("#controllerPlayerColours").hidden = state.controllerColourMode !== "players";
  const choices = CONTROLLER_OPTIONS[state.controllerScene];
  $("#controllerVariant").replaceChildren(...choices.map(([id, label]) => new Option(label, id)));
  $("#controllerVariant").value = state.controllerVariants[state.controllerScene];
}
function syncWeatherUI() {
  const choices = WEATHER_OPTIONS[state.weatherCondition];
  $("#weatherVariant").replaceChildren(...choices.map((label, index) => new Option(label, String(index))));
  $("#weatherVariant").value = String(state.weatherVariants[state.weatherCondition]);
  const degrees = state.weatherUnit === "fahrenheit" ? "64°F" : "18°C";
  $("#weatherTopbarSample").textContent = `Top-bar example: ${WEATHER_ICONS[state.weatherCondition]} ${degrees} · ${state.weatherTopbar ? "enabled" : "optional"} beside the clock. The real plugin needs a chosen city; this demo uses sample data only.`;
}
function playController() {
  state.timerRunning = false;
  const kind = state.controllerScene;
  const duration = kind === "duo" ? 6 : kind === "gauge" ? 3 : kind === "charging" ? 2.8 : 3.2;
  state.overlay = { type: "controller", kind, variant: state.controllerVariants[kind], target: state.controllerTarget, start: clock, duration };
}
function updateOutputs() {
  const outputs = { customBrightness: `${state.customBrightness} / 255`, customSpeed: `${state.customSpeed} / 100`, launchDuration: `${state.launchDuration} s`, artRow: `${getSampleRow()}%`, cpuLoad: `${state.cpu}%`, cpuTemp: `${state.cpuTemp}°C`, gpuLoad: `${state.gpu}%`, gpuTemp: `${state.gpuTemp}°C`, coolTemp: `${state.coolTemp}°C`, hotTemp: `${state.hotTemp}°C`, timerRemaining: formatTime(state.timerRemaining), padOne: `${state.padOne}%`, padTwo: `${state.padTwo}%`, padThree: `${state.padThree}%`, padFour: `${state.padFour}%`, lowThreshold: `${state.lowThreshold}%`, padBrightness: `${state.padBrightness}%`, weatherBrightness: `${state.weatherBrightness}%`, weatherCutoff: String(state.weatherCutoff), audioSyncBrightness: `${state.audioSyncBrightness} / 255`, screenSyncBrightness: `${state.screenSyncBrightness} / 255`, screenSyncBlackThreshold: String(state.screenSyncBlackThreshold), witcherHealth: `${state.witcherHealth}%`, witcherStamina: `${state.witcherStamina}%`, witcherToxicity: `${state.witcherToxicity}%`, extraDark: String(state.extraDark) };
  Object.entries(outputs).forEach(([key, value]) => { const element = $(`#${key}Value`); if (element) element.textContent = value; });
}
function bindValue(id, stateKey, transform = (value) => value, callback) {
  const element = $(`#${id}`);
  element.addEventListener(element.tagName === "SELECT" ? "change" : "input", () => {
    state[stateKey] = transform(element.value);
    callback?.();
    updateOutputs();
  });
}
function normaliseHex(value) {
  const raw = String(value).trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(raw) ? raw : null;
}
function bindControls() {
  $$(".tab").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.tab)));
  $$("[data-preset]").forEach((button) => button.addEventListener("click", () => choosePreset(button.dataset.preset)));
  $("#customPattern").addEventListener("change", (event) => { state.customPattern = event.target.value; syncCustomizationUI(); });
  $("#customPaletteCount").addEventListener("change", (event) => { state.customPaletteCount = Number(event.target.value); syncCustomizationUI(); });
  $("#customDirection").addEventListener("change", (event) => { state.customDirection = event.target.value; });
  bindValue("customBrightness", "customBrightness", Number);
  bindValue("customSpeed", "customSpeed", Number);
  for (let index = 0; index < 3; index++) {
    const picker = $(`#customColour${index + 1}`), hex = $(`#customHex${index + 1}`);
    picker.addEventListener("input", () => { state.customColours[index] = picker.value.toUpperCase(); hex.value = state.customColours[index]; });
    hex.addEventListener("input", () => { const value = normaliseHex(hex.value); if (value) { state.customColours[index] = value; picker.value = value.toLowerCase(); } });
    hex.addEventListener("blur", () => { hex.value = state.customColours[index]; });
  }
  $("#customPreview").addEventListener("click", () => { state.display = "customization"; state.context = "home"; state.overlay = null; state.timerRunning = false; state.controllerWhere = "off"; state.weatherWhere = "off"; state.padCharging = false; $("#contextChoice").value = "home"; $("#displayChoice").value = "customization"; $("#controllerWhere").value = "off"; $("#weatherWhere").value = "off"; $("#padCharging").checked = false; });
  $$("[data-launch-game]").forEach((button) => button.addEventListener("click", () => {
    state.launchGame = button.dataset.launchGame; state.launchPlaying = false; syncLaunchUI(); loadLaunchArtwork();
  }));
  $("#launchSource").addEventListener("change", (event) => { state.launchSource = event.target.value; state.launchPlaying = false; loadLaunchArtwork(); });
  $("#launchPaletteMode").addEventListener("change", (event) => { state.launchProfiles[state.launchGame].paletteMode = event.target.value; syncLaunchUI(); });
  $("#launchColourCount").addEventListener("change", (event) => { state.launchColourCount = Number(event.target.value); syncLaunchUI(); });
  $("#launchPattern").addEventListener("change", (event) => { state.launchPattern = event.target.value; });
  bindValue("launchDuration", "launchDuration", Number);
  for (let index = 0; index < 3; index++) {
    const picker = $(`#launchColour${index + 1}`), hex = $(`#launchHex${index + 1}`);
    const setLaunchColour = (value) => {
      state.launchProfiles[state.launchGame].custom[state.launchColourCount][index] = value;
      picker.value = value.toLowerCase(); hex.value = value; syncLaunchUI();
    };
    picker.addEventListener("input", () => setLaunchColour(picker.value.toUpperCase()));
    hex.addEventListener("input", () => { const value = normaliseHex(hex.value); if (value) setLaunchColour(value); });
    hex.addEventListener("blur", () => { hex.value = state.launchProfiles[state.launchGame].custom[state.launchColourCount][index] || "#000000"; });
  }
  $("#launchPreview").addEventListener("click", startLaunchPreview);
  $$("[data-game]").forEach((button) => button.addEventListener("click", () => {
    saveGameArtworkChoice();
    state.game = button.dataset.game;
    state.artCustom = null;
    if (customObjectUrl) { URL.revokeObjectURL(customObjectUrl); customObjectUrl = null; }
    const settings = state.gameSettings[state.game];
    state.artSource = settings.source; state.artMode = settings.mode; state.artRow = settings.row;
    state.display = settings.display === "inherit" ? "artwork" : settings.display;
    $("#artSource").value = state.artSource; $("#artMode").value = state.artMode;
    $("#artRow").value = String(state.artRow); $("#artRow").disabled = state.artMode !== "manual";
    $("#gameDisplay").value = settings.display;
    $("#displayChoice").value = state.display;
    $$("[data-game]").forEach((choice) => choice.classList.toggle("selected", choice === button));
    loadArtwork();
  }));
  bindValue("artSource", "artSource", String, () => { saveGameArtworkChoice(); loadArtwork(); });
  bindValue("artMode", "artMode", String, () => { saveGameArtworkChoice(); sampleArtwork($("#artImage")); $("#artRow").disabled = state.artMode !== "manual"; });
  bindValue("artRow", "artRow", Number, () => { saveGameArtworkChoice(); sampleArtwork($("#artImage")); });
  $("#gameDisplay").addEventListener("change", (event) => {
    state.gameSettings[state.game].display = event.target.value;
    state.display = event.target.value === "inherit" ? "artwork" : event.target.value;
    $("#displayChoice").value = state.display;
  });
  $("#artUpload").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (customObjectUrl) URL.revokeObjectURL(customObjectUrl);
    customObjectUrl = URL.createObjectURL(file);
    state.artCustom = customObjectUrl;
    state.context = "game"; state.display = "artwork";
    loadArtwork();
  });
  for (const [id, key] of [["perfMetric", "metric"], ["perfDirection", "direction"], ["perfPalette", "palette"], ["perfResponse", "response"]]) bindValue(id, key, String, id === "perfPalette" ? () => { $("#customColours").hidden = state.palette !== "custom"; } : undefined);
  for (const [id, key] of [["cpuLoad", "cpu"], ["cpuTemp", "cpuTemp"], ["gpuLoad", "gpu"], ["gpuTemp", "gpuTemp"], ["coolTemp", "coolTemp"], ["hotTemp", "hotTemp"]]) bindValue(id, key, Number);
  for (const [id, key] of [["coolColor", "coolColor"], ["middleColor", "middleColor"], ["hotColor", "hotColor"]]) bindValue(id, key);
  $("#perfHome").addEventListener("change", (event) => { state.perfHome = event.target.checked; });
  $$("[data-timer-source]").forEach((button) => button.addEventListener("click", () => {
    state.timerSource = button.dataset.timerSource;
    $$("[data-timer-source]").forEach((choice) => choice.classList.toggle("selected", choice === button));
    state.context = "game";
  }));
  bindValue("timerDuration", "timerDuration", Number, () => { state.timerRemaining = Math.min(state.timerRemaining, state.timerDuration * 60); $("#timerRemaining").max = String(state.timerDuration * 60); $("#timerRemaining").value = String(Math.round(state.timerRemaining)); });
  bindValue("timerScale", "timerScale", Number);
  bindValue("timerRemaining", "timerRemaining", Number, () => { state.timerElapsed = 0; });
  bindValue("timerColor", "timerColor"); bindValue("timerSpeed", "timerSpeed", Number);
  $("#timerStart").addEventListener("click", () => { state.context = "game"; state.timerRunning = true; state.timerElapsed = 0; state.overlay = null; $("#contextChoice").value = "game"; });
  $("#timerStop").addEventListener("click", () => { state.timerRunning = false; });
  $("#timerFinal").addEventListener("click", () => { state.timerRemaining = 8; state.timerElapsed = 0; state.timerRunning = true; state.context = "game"; state.overlay = null; updateOutputs(); });
  $$("[data-event-kind]").forEach((button) => button.addEventListener("click", () => { state.eventKind = button.dataset.eventKind; syncEventUI(); playEvent(); }));
  $("#eventVariant").addEventListener("change", (event) => { state.eventVariants[state.eventKind] = event.target.value; syncEventUI(); playEvent(); });
  $("#eventPlay").addEventListener("click", () => playEvent());
  $("#recordToggle").addEventListener("click", () => { state.recording = !state.recording; playEvent(state.recording ? "record-start" : "record-stop"); syncEventUI(); });
  $("#recordIsolation").addEventListener("change", (event) => { state.recordIsolation = event.target.checked; });
  for (const [id, key] of [["controllerCount", "padCount"], ["padOne", "padOne"], ["padTwo", "padTwo"], ["padThree", "padThree"], ["padFour", "padFour"], ["lowThreshold", "lowThreshold"], ["padBrightness", "padBrightness"]]) bindValue(id, key, Number, id === "controllerCount" ? () => { syncControllerUI(); playController(); } : undefined);
  bindValue("controllerWhere", "controllerWhere", String, () => { if (state.controllerWhere !== "off") { state.weatherWhere = "off"; $("#weatherWhere").value = "off"; } });
  for (const [id, key] of [["chargeMode", "chargeMode"], ["alertWhere", "alertWhere"], ["padHealthy", "padHealthy"], ["padMedium", "padMedium"], ["padLow", "padLow"], ["padCharge", "padCharge"]]) bindValue(id, key);
  $("#controllerScene").addEventListener("change", (event) => { state.controllerScene = event.target.value; syncControllerUI(); playController(); });
  $("#controllerVariant").addEventListener("change", (event) => { state.controllerVariants[state.controllerScene] = event.target.value; playController(); });
  $("#controllerTarget").addEventListener("change", (event) => { state.controllerTarget = Number(event.target.value); syncControllerUI(); playController(); });
  $$('[data-controller-colour-mode]').forEach((button) => button.addEventListener("click", () => { state.controllerColourMode = button.dataset.controllerColourMode; syncControllerUI(); }));
  ["padPlayerOne", "padPlayerTwo", "padPlayerThree", "padPlayerFour"].forEach((id, index) => {
    $(`#${id}`).addEventListener("input", (event) => { state.padPlayerColours[index] = event.target.value.toLowerCase(); $("#controllerSeatLegend").dataset.key = ""; });
  });
  $("#controllerPlay").addEventListener("click", playController);
  $("#padCharging").addEventListener("change", (event) => { state.padCharging = event.target.checked; state.overlay = null; });
  $("#weatherCondition").addEventListener("change", (event) => { state.weatherCondition = event.target.value; state.weatherStart = clock; syncWeatherUI(); });
  $("#weatherVariant").addEventListener("change", (event) => { state.weatherVariants[state.weatherCondition] = Number(event.target.value); state.weatherStart = clock; });
  $("#weatherWhere").addEventListener("change", (event) => { state.weatherWhere = event.target.value; if (state.weatherWhere !== "off") { state.controllerWhere = "off"; $("#controllerWhere").value = "off"; } });
  $("#weatherTopbar").addEventListener("change", (event) => { state.weatherTopbar = event.target.checked; syncWeatherUI(); });
  $("#weatherUnit").addEventListener("change", (event) => { state.weatherUnit = event.target.value; syncWeatherUI(); });
  bindValue("weatherBrightness", "weatherBrightness", Number);
  bindValue("weatherCutoff", "weatherCutoff", Number);
  $("#weatherReplay").addEventListener("click", () => { state.weatherStart = clock; });
  $("#audioSyncExample").addEventListener("change", (event) => selectGameplayExample(event.target.value));
  $("#screenSyncExample").addEventListener("change", (event) => selectGameplayExample(event.target.value));
  bindValue("audioSyncStyle", "audioSyncStyle", String, () => { state.audioCrests = []; state.audioHifiCrests = []; syncAudioUI(); });
  bindValue("audioSyncReactivity", "audioSyncReactivity");
  bindValue("audioSyncBrightness", "audioSyncBrightness", Number);
  bindValue("audioSyncPalette", "audioSyncPalette", String, syncAudioUI);
  ["High", "Middle", "Low"].forEach((name, index) => {
    $(`#audioSyncColour${name}`).addEventListener("input", (event) => {
      state.audioSyncColours[index] = event.target.value.toLowerCase();
      updateAudioBands();
    });
  });
  const audioVideo = $("#audioSyncVideo");
  $("#audioSyncPlay").addEventListener("click", toggleAudioPlayback);
  $("#audioSyncRestart").addEventListener("click", async () => {
    audioVideo.currentTime = 0;
    resetAudioVideoProcessor();
    if (audioVideo.paused) await toggleAudioPlayback();
  });
  audioVideo.addEventListener("play", () => { void ensureAudioGraph().then(() => { syncAudioPlaybackUI(); syncScreenPlaybackUI(); }).catch((error) => {
    $("#audioSyncState").textContent = "Audio analysis unavailable";
    $("#audioSyncTime").textContent = error instanceof Error ? error.message : String(error);
  }); });
  for (const event of ["loadedmetadata", "timeupdate", "pause", "ended", "error"]) audioVideo.addEventListener(event, () => { syncAudioPlaybackUI(); syncScreenPlaybackUI(); });
  bindValue("screenSyncStyle", "screenSyncStyle", String, resetAudioVideoProcessor);
  bindValue("screenSyncBrightness", "screenSyncBrightness", Number);
  bindValue("screenSyncReactivity", "screenSyncReactivity");
  bindValue("screenSyncIntensity", "screenSyncIntensity");
  bindValue("screenSyncBlackThreshold", "screenSyncBlackThreshold", Number);
  $("#screenSyncBlackBars").addEventListener("change", (event) => { state.screenSyncBlackBars = event.target.checked; });
  $("#screenSyncPlay").addEventListener("click", toggleAudioPlayback);
  $("#screenSyncReplay").addEventListener("click", async () => {
    audioVideo.currentTime = 0;
    resetAudioVideoProcessor();
    if (audioVideo.paused) await toggleAudioPlayback();
  });
  bindValue("witcherHealth", "witcherHealth", Number);
  bindValue("witcherStamina", "witcherStamina", Number);
  bindValue("witcherToxicity", "witcherToxicity", Number);
  bindValue("witcherAdrenaline", "witcherAdrenaline", Number);
  $("#witcherCombat").addEventListener("change", (event) => { state.witcherCombat = event.target.checked; });
  $$('[data-witcher-sign]').forEach((button) => button.addEventListener("click", () => {
    state.overlay = { type: "witcher-sign", sign: button.dataset.witcherSign, start: clock, duration: .9 };
  }));
  bindValue("contextChoice", "context"); bindValue("displayChoice", "display"); bindValue("extraDark", "extraDark", Number);
  $("#reversePhysical").addEventListener("change", (event) => { state.reversePhysical = event.target.checked; });
  $("#contextSwitch").addEventListener("click", () => { state.context = state.context === "home" ? "game" : "home"; $("#contextChoice").value = state.context; });
  $("#priorityDemo").addEventListener("click", () => { state.display = "performance"; state.context = "game"; state.timerRemaining = 240; state.timerRunning = true; state.timerElapsed = 0; state.eventKind = "notification"; state.overlay = null; $("#contextChoice").value = "game"; $("#displayChoice").value = "performance"; $("#priorityFeedback").textContent = "Four minutes remain. Now send a notification to test the protected countdown."; });
  $("#priorityNotify").addEventListener("click", () => {
    if (state.timerRunning && state.timerRemaining <= 300) $("#priorityFeedback").textContent = "Notification held: the final five minutes keep the countdown visible.";
    else { playEvent("notification-beacon"); $("#priorityFeedback").textContent = "Notification shown briefly. The previous signal returns when it finishes."; }
  });
  $("#resetDemo").addEventListener("click", resetDemo);
  $("#pauseDemo").addEventListener("click", () => {
    if (["audio-sync", "screen-sync"].includes(state.tab)) { void toggleAudioPlayback(); return; }
    state.paused = !state.paused; $("#pauseDemo").textContent = state.paused ? "▶" : "Ⅱ"; $("#pauseDemo").setAttribute("aria-label", state.paused ? "Play animation" : "Pause animation");
  });
  $("#resetView").addEventListener("click", () => { if (state.overlay) state.overlay.start = clock; else if (state.tab === "events") playEvent(); else if (state.tab === "controllers") playController(); else if (state.tab === "weather") state.weatherStart = clock; else if (["audio-sync", "screen-sync"].includes(state.tab)) { audioVideo.currentTime = 0; state.audioLevels.fill(0); state.audioLeft = 0; state.audioRight = 0; resetAudioVideoProcessor(); } else state.timerElapsed = 0; });
  window.addEventListener("resize", () => { updateSampleLine(); updateMobilePreviewVisibility(); });
  window.addEventListener("scroll", updateMobilePreviewVisibility, { passive: true });
}
function resetDemo() {
  const audioVideo = $("#audioSyncVideo");
  audioVideo.pause();
  audioVideo.currentTime = 0;
  state = defaultState();
  resetAudioVideoProcessor();
  clock = 0;
  if (customObjectUrl) { URL.revokeObjectURL(customObjectUrl); customObjectUrl = null; }
  for (const [id, value] of Object.entries({ customBrightness: state.customBrightness, customSpeed: state.customSpeed, launchDuration: state.launchDuration, artSource: state.artSource, artMode: state.artMode, artRow: state.artRow, gameDisplay: "inherit", perfMetric: state.metric, perfDirection: state.direction, cpuLoad: state.cpu, cpuTemp: state.cpuTemp, gpuLoad: state.gpu, gpuTemp: state.gpuTemp, perfPalette: state.palette, perfResponse: state.response, coolColor: state.coolColor, middleColor: state.middleColor, hotColor: state.hotColor, coolTemp: state.coolTemp, hotTemp: state.hotTemp, timerDuration: state.timerDuration, timerScale: state.timerScale, timerRemaining: state.timerRemaining, timerColor: state.timerColor, timerSpeed: state.timerSpeed, controllerCount: state.padCount, padOne: state.padOne, padTwo: state.padTwo, padThree: state.padThree, padFour: state.padFour, controllerTarget: state.controllerTarget, controllerWhere: state.controllerWhere, chargeMode: state.chargeMode, alertWhere: state.alertWhere, lowThreshold: state.lowThreshold, padBrightness: state.padBrightness, padHealthy: state.padHealthy, padMedium: state.padMedium, padLow: state.padLow, padCharge: state.padCharge, padPlayerOne: state.padPlayerColours[0], padPlayerTwo: state.padPlayerColours[1], padPlayerThree: state.padPlayerColours[2], padPlayerFour: state.padPlayerColours[3], weatherCondition: state.weatherCondition, weatherWhere: state.weatherWhere, weatherUnit: state.weatherUnit, weatherBrightness: state.weatherBrightness, weatherCutoff: state.weatherCutoff, audioSyncExample: state.audioSyncExample, audioSyncStyle: state.audioSyncStyle, audioSyncReactivity: state.audioSyncReactivity, audioSyncBrightness: state.audioSyncBrightness, audioSyncPalette: state.audioSyncPalette, audioSyncColourHigh: state.audioSyncColours[0], audioSyncColourMiddle: state.audioSyncColours[1], audioSyncColourLow: state.audioSyncColours[2], screenSyncStyle: state.screenSyncStyle, screenSyncScene: state.screenSyncScene, screenSyncBrightness: state.screenSyncBrightness, screenSyncReactivity: state.screenSyncReactivity, screenSyncIntensity: state.screenSyncIntensity, screenSyncBlackThreshold: state.screenSyncBlackThreshold, witcherHealth: state.witcherHealth, witcherStamina: state.witcherStamina, witcherToxicity: state.witcherToxicity, witcherAdrenaline: state.witcherAdrenaline, extraDark: state.extraDark, contextChoice: state.context, displayChoice: state.display })) { const element = $(`#${id}`); if (element) element.value = String(value); }
  audioVideo.src = AUDIO_EXAMPLES[state.audioSyncExample].source;
  audioVideo.setAttribute("aria-label", `${AUDIO_EXAMPLES[state.audioSyncExample].title} gameplay used for the Audio Sync and Screen Sync demonstrations`);
  audioVideo.load();
  $("#timerRemaining").max = String(state.timerDuration * 60);
  for (const [id, checked] of Object.entries({ perfHome: state.perfHome, recordIsolation: state.recordIsolation, padCharging: state.padCharging, weatherTopbar: state.weatherTopbar, screenSyncBlackBars: state.screenSyncBlackBars, witcherCombat: state.witcherCombat, reversePhysical: state.reversePhysical })) $(`#${id}`).checked = checked;
  $$("[data-game]").forEach((button) => button.classList.toggle("selected", button.dataset.game === state.game));
  $$("[data-timer-source]").forEach((button) => button.classList.toggle("selected", button.dataset.timerSource === state.timerSource));
  $("#padCharging").checked = false;
  $("#customColours").hidden = true;
  $("#artRow").disabled = false;
  $("#pauseDemo").textContent = "Ⅱ";
  syncEventUI(); syncControllerUI(); syncWeatherUI(); syncAudioUI(); syncCustomizationUI(); syncLaunchUI(); updateOutputs(); loadArtwork(); loadLaunchArtwork(); setTab("overview", false);
}
function openTabFromHash() {
  const tab = window.location.hash.slice(1);
  if (!tab || !$(`.tab[data-tab="${tab}"]`)) return;
  setTab(tab);
  requestAnimationFrame(() => $("#lab")?.scrollIntoView({ block: "start" }));
}
function init() {
  $("#launchPattern").replaceChildren(...LAUNCH_PATTERNS.map(([value, label]) => new Option(label, value)));
  syncCustomizationUI(); syncLaunchUI(); loadLaunchArtwork();
  bindControls();
  openTabFromHash();
  window.addEventListener("hashchange", openTabFromHash);
  syncEventUI(); syncControllerUI(); syncWeatherUI(); syncAudioUI(); updateOutputs(); loadArtwork();
  updateMobilePreviewVisibility();
  requestAnimationFrame(tick);
}
init();

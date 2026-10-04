/* Mobile-safe Audio Sync route patch.
   Uses the playing media element directly instead of decoding the full MP4 again. */
(() => {
  let sourceNode = null;
  let spectrumAnalyser = null;
  let leftAnalyser = null;
  let rightAnalyser = null;
  let splitter = null;
  let frequencyData = null;
  let leftTimeData = null;
  let rightTimeData = null;
  let graphError = null;

  const rms = (values) => {
    let sum = 0;
    for (let index = 0; index < values.length; index++) sum += values[index] * values[index];
    return Math.sqrt(sum / Math.max(1, values.length));
  };

  const graphReady = () => Boolean(spectrumAnalyser && leftAnalyser && rightAnalyser && audioContext);

  ensureAudioGraph = async function ensureAudioGraphMobile() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("Web Audio is unavailable in this browser");
    const video = $("#audioSyncVideo");
    if (!audioContext) audioContext = new Context({ sampleRate: 48000 });

    if (!sourceNode) {
      sourceNode = audioContext.createMediaElementSource(video);
      spectrumAnalyser = audioContext.createAnalyser();
      spectrumAnalyser.fftSize = 2048;
      spectrumAnalyser.smoothingTimeConstant = 0;
      splitter = audioContext.createChannelSplitter(2);
      leftAnalyser = audioContext.createAnalyser();
      rightAnalyser = audioContext.createAnalyser();
      leftAnalyser.fftSize = 2048;
      rightAnalyser.fftSize = 2048;
      leftAnalyser.smoothingTimeConstant = 0;
      rightAnalyser.smoothingTimeConstant = 0;

      sourceNode.connect(spectrumAnalyser);
      sourceNode.connect(splitter);
      splitter.connect(leftAnalyser, 0);
      splitter.connect(rightAnalyser, 1);
      sourceNode.connect(audioContext.destination);

      frequencyData = new Float32Array(spectrumAnalyser.frequencyBinCount);
      leftTimeData = new Float32Array(leftAnalyser.fftSize);
      rightTimeData = new Float32Array(rightAnalyser.fftSize);
    }

    if (audioContext.state === "suspended") await audioContext.resume();
    graphError = null;
  };

  analyseAudioNow = function analyseAudioNowMobile() {
    const video = $("#audioSyncVideo");
    const now = performance.now();
    const processInterval = 60;
    if (video.paused || video.ended || !graphReady() || audioContext.state !== "running") {
      if (now - audioLastAnalysis >= processInterval) {
        audioLastAnalysis = now;
        decayAudioAnalysis();
      }
      return;
    }
    if (now - audioLastAnalysis < processInterval) return;
    audioLastAnalysis = now;

    spectrumAnalyser.getFloatFrequencyData(frequencyData);
    leftAnalyser.getFloatTimeDomainData(leftTimeData);
    rightAnalyser.getFloatTimeDomainData(rightTimeData);

    const sampleRate = audioContext.sampleRate || 48000;
    const fftSize = spectrumAnalyser.fftSize;
    const minimumHz = 45;
    const maximumHz = Math.min(16000, sampleRate / 2 - 1);
    const rawDb = Array.from({ length: 17 }, (_, index) => {
      const lowHz = minimumHz * ((maximumHz / minimumHz) ** (index / 17));
      const highHz = minimumHz * ((maximumHz / minimumHz) ** ((index + 1) / 17));
      const start = Math.max(1, Math.floor(lowHz * fftSize / sampleRate));
      const end = Math.min(frequencyData.length, Math.max(start + 1, Math.ceil(highHz * fftSize / sampleRate)));
      let power = 0;
      let count = 0;
      for (let bin = start; bin < end; bin++) {
        const db = Number.isFinite(frequencyData[bin]) ? frequencyData[bin] : -160;
        const amplitude = 10 ** (db / 20);
        power += amplitude * amplitude;
        count++;
      }
      const energy = Math.sqrt(power / Math.max(1, count));
      return 20 * Math.log10(Math.max(1e-8, energy));
    });

    state.audioHistory.push(rawDb);
    if (state.audioHistory.length > 170) state.audioHistory.shift();
    const anchors = state.audioHistory.map((row) => audioPercentile(row, .76));
    const low = audioPercentile(anchors, .15) - 7;
    const high = Math.max(low + 18, audioPercentile(anchors, .92) + 3);
    const anchor = audioPercentile(rawDb, .76);
    const span = Math.max(18, high - low);
    const programme = clamp((anchor - low) / span, 0, 1.18);
    const current = rawDb.map((value) => clamp(programme + (value - anchor) / 34, 0, 1));
    const [attack, decay] = AUDIO_SMOOTHING[state.audioSyncReactivity] || AUDIO_SMOOTHING.balanced;
    const previousLevels = [...state.audioLevels];
    state.audioLevels = current.map((value, index) => {
      const previous = state.audioLevels[index] || 0;
      const alpha = value >= previous ? attack : decay;
      return previous + (value - previous) * alpha;
    });

    const left = clamp(rms(leftTimeData) * 4.6, 0, 1);
    let right = clamp(rms(rightTimeData) * 4.6, 0, 1);
    if (right < .0001 && left > .001) right = left;
    state.audioLeft += (left - state.audioLeft) * (left >= state.audioLeft ? attack : decay);
    state.audioRight += (right - state.audioRight) * (right >= state.audioRight ? attack : decay);

    const mean = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    const bass = mean(state.audioLevels.slice(0, 5));
    const mid = mean(state.audioLevels.slice(5, 12));
    const highBand = mean(state.audioLevels.slice(12));
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
  };

  const originalSyncAudioPlaybackUI = syncAudioPlaybackUI;
  syncAudioPlaybackUI = function syncAudioPlaybackUIMobile() {
    originalSyncAudioPlaybackUI();
    const video = $("#audioSyncVideo");
    if (!video.paused && graphReady()) {
      $("#audioSyncState").textContent = audioContext.state === "running" ? "Analysing source audio" : "Tap play to enable audio analysis";
      $("#audioSyncTime").textContent = `${AUDIO_EXAMPLES[state.audioSyncExample].title} · ${formatTime(video.currentTime)} / ${Number.isFinite(video.duration) ? formatTime(video.duration) : "0:00"} · live media analysis`;
    } else if (graphError) {
      $("#audioSyncState").textContent = "Audio analysis unavailable";
      $("#audioSyncTime").textContent = graphError.message || String(graphError);
    }
  };

  const armAudio = () => {
    void ensureAudioGraph().then(() => {
      syncAudioPlaybackUI();
      syncScreenPlaybackUI();
    }).catch((error) => {
      graphError = error instanceof Error ? error : new Error(String(error));
      syncAudioPlaybackUI();
    });
  };

  document.addEventListener("pointerdown", armAudio, { passive: true });
  document.addEventListener("touchstart", armAudio, { passive: true });
  document.addEventListener("keydown", armAudio);
  $("#audioSyncVideo")?.addEventListener("play", armAudio);
  armAudio();
})();

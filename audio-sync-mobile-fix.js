/* Mobile-safe Audio Sync route patch.
   Analyses a silent, synchronized media clone instead of decoding the full MP4. */
(() => {
  let analysisVideo = null;
  let analysisSourceUrl = "";
  let sourceNode = null;
  let silenceGain = null;
  let spectrumAnalyser = null;
  let leftAnalyser = null;
  let rightAnalyser = null;
  let splitter = null;
  let frequencyData = null;
  let leftTimeData = null;
  let rightTimeData = null;
  let graphError = null;
  let userActivated = false;

  const visibleVideo = () => $("#audioSyncVideo");

  const rms = (values) => {
    let sum = 0;
    for (let index = 0; index < values.length; index++) sum += values[index] * values[index];
    return Math.sqrt(sum / Math.max(1, values.length));
  };

  const currentSource = () => {
    const video = visibleVideo();
    return video.currentSrc || new URL(video.getAttribute("src"), document.baseURI).href;
  };

  const ensureAnalysisVideo = () => {
    const video = visibleVideo();
    if (!analysisVideo) {
      analysisVideo = document.createElement("video");
      analysisVideo.preload = "auto";
      analysisVideo.playsInline = true;
      analysisVideo.loop = true;
      analysisVideo.muted = false;
      analysisVideo.volume = 1;
      analysisVideo.tabIndex = -1;
      analysisVideo.setAttribute("aria-hidden", "true");
      analysisVideo.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px;top:-9999px";
      document.body.append(analysisVideo);
    }

    const source = currentSource();
    if (source && source !== analysisSourceUrl) {
      analysisSourceUrl = source;
      analysisVideo.src = source;
      analysisVideo.load();
      const seek = () => {
        try { analysisVideo.currentTime = video.currentTime || 0; } catch (_error) {}
      };
      if (analysisVideo.readyState >= 1) seek();
      else analysisVideo.addEventListener("loadedmetadata", seek, { once: true });
    }
    return analysisVideo;
  };

  const graphReady = () => Boolean(spectrumAnalyser && leftAnalyser && rightAnalyser && audioContext && analysisVideo);

  const syncAnalysisPlayback = () => {
    const video = visibleVideo();
    const analyserVideo = ensureAnalysisVideo();
    analyserVideo.loop = video.loop;
    analyserVideo.playbackRate = video.playbackRate || 1;

    if (Number.isFinite(video.currentTime) && Number.isFinite(analyserVideo.currentTime)
      && Math.abs(analyserVideo.currentTime - video.currentTime) > .12) {
      try { analyserVideo.currentTime = video.currentTime; } catch (_error) {}
    }

    if (video.paused || video.ended) {
      if (!analyserVideo.paused) analyserVideo.pause();
      return;
    }

    if (userActivated && analyserVideo.paused) {
      void analyserVideo.play().catch((error) => {
        if (error?.name !== "NotAllowedError") graphError = error instanceof Error ? error : new Error(String(error));
      });
    }
  };

  ensureAudioGraph = async function ensureAudioGraphMobile() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("Web Audio is unavailable in this browser");
    if (navigator.userActivation?.isActive) userActivated = true;
    const analyserVideo = ensureAnalysisVideo();
    if (!audioContext) audioContext = new Context({ sampleRate: 48000 });

    if (!sourceNode) {
      sourceNode = audioContext.createMediaElementSource(analyserVideo);
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
      silenceGain = audioContext.createGain();
      silenceGain.gain.value = 0;

      sourceNode.connect(spectrumAnalyser);
      sourceNode.connect(splitter);
      splitter.connect(leftAnalyser, 0);
      splitter.connect(rightAnalyser, 1);
      sourceNode.connect(silenceGain);
      silenceGain.connect(audioContext.destination);

      frequencyData = new Float32Array(spectrumAnalyser.frequencyBinCount);
      leftTimeData = new Float32Array(leftAnalyser.fftSize);
      rightTimeData = new Float32Array(rightAnalyser.fftSize);
    }

    if (audioContext.state === "suspended" && userActivated) await audioContext.resume();
    syncAnalysisPlayback();
    graphError = null;
  };

  analyseAudioNow = function analyseAudioNowMobile() {
    const video = visibleVideo();
    syncAnalysisPlayback();
    const now = performance.now();
    const processInterval = 60;
    if (video.paused || video.ended || !graphReady() || audioContext.state !== "running" || analysisVideo.paused) {
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
    const video = visibleVideo();
    if (!video.paused && graphReady()) {
      const active = userActivated && audioContext.state === "running" && !analysisVideo.paused;
      $("#audioSyncState").textContent = active ? "Analysing source audio" : "Tap play to enable audio analysis";
      $("#audioSyncTime").textContent = `${AUDIO_EXAMPLES[state.audioSyncExample].title} · ${formatTime(video.currentTime)} / ${Number.isFinite(video.duration) ? formatTime(video.duration) : "0:00"} · ${active ? "live media analysis" : "audio gesture required"}`;
    } else if (graphError) {
      $("#audioSyncState").textContent = "Audio analysis unavailable";
      $("#audioSyncTime").textContent = graphError.message || String(graphError);
    }
  };

  const armAudio = (event) => {
    if (event) userActivated = true;
    void ensureAudioGraph().then(() => {
      syncAudioPlaybackUI();
      syncScreenPlaybackUI();
    }).catch((error) => {
      if (error?.name !== "NotAllowedError") graphError = error instanceof Error ? error : new Error(String(error));
      syncAudioPlaybackUI();
    });
  };

  document.addEventListener("pointerdown", armAudio, { passive: true });
  document.addEventListener("touchstart", armAudio, { passive: true });
  document.addEventListener("keydown", armAudio);
  visibleVideo()?.addEventListener("play", () => armAudio());
  void ensureAudioGraph().catch(() => {});
})();

#!/usr/bin/env python3
"""Generate compact 60 ms Audio Sync analysis frames for the bundled demo videos.

This avoids decoding an entire MP4 through Web Audio in the browser. The generated
frames preserve the existing 17 logarithmic bands plus stereo RMS targets; app.js
still performs its adaptive programme matching, smoothing and choreography live.
"""

from pathlib import Path
import base64
import json
import math
import re
import subprocess

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SAMPLE_RATE = 48_000
FFT_SIZE = 2_048
STEP_MS = 60
STEP_SAMPLES = round(SAMPLE_RATE * STEP_MS / 1000)
BANDS = 17
FRAME_BYTES = BANDS + 2
DB_OFFSET = 120

SOURCES = {
    "silksong": ROOT / "assets/karmelita-prime.mp4",
    "witcher-bear": ROOT / "assets/witcher-3-remastered-bear.mp4",
}


def band_ranges():
    minimum_hz = 45.0
    maximum_hz = min(16_000.0, SAMPLE_RATE / 2 - 1)
    result = []
    for index in range(BANDS):
        low = minimum_hz * ((maximum_hz / minimum_hz) ** (index / BANDS))
        high = minimum_hz * ((maximum_hz / minimum_hz) ** ((index + 1) / BANDS))
        start = max(1, math.floor(low * FFT_SIZE / SAMPLE_RATE))
        end = min(FFT_SIZE // 2, max(start + 1, math.ceil(high * FFT_SIZE / SAMPLE_RATE)))
        result.append((start, end))
    return result


def decode_stereo(path: Path) -> np.ndarray:
    proc = subprocess.run(
        [
            "ffmpeg", "-v", "error", "-i", str(path),
            "-f", "f32le", "-acodec", "pcm_f32le", "-ac", "2",
            "-ar", str(SAMPLE_RATE), "pipe:1",
        ],
        check=True,
        stdout=subprocess.PIPE,
    )
    pcm = np.frombuffer(proc.stdout, dtype="<f4")
    if pcm.size % 2:
        pcm = pcm[:-1]
    return pcm.reshape((-1, 2))


def analyse(path: Path):
    pcm = decode_stereo(path)
    window = np.hanning(FFT_SIZE).astype(np.float32)
    ranges = band_ranges()
    frame_count = max(1, math.ceil(len(pcm) / STEP_SAMPLES) + 1)
    encoded = bytearray(frame_count * FRAME_BYTES)
    zero = np.zeros((FFT_SIZE, 2), dtype=np.float32)

    for frame_index in range(frame_count):
        end_sample = min(len(pcm), frame_index * STEP_SAMPLES)
        start_sample = end_sample - FFT_SIZE
        if start_sample >= 0:
            chunk = pcm[start_sample:end_sample]
        else:
            chunk = zero.copy()
            available = pcm[:end_sample]
            if len(available):
                chunk[-len(available):] = available
        if len(chunk) < FFT_SIZE:
            padded = zero.copy()
            if len(chunk):
                padded[-len(chunk):] = chunk
            chunk = padded

        left = chunk[:, 0]
        right = chunk[:, 1]
        mono = (left + right) * 0.5
        magnitudes = np.abs(np.fft.rfft(mono * window)) / (FFT_SIZE / 2)

        offset = frame_index * FRAME_BYTES
        for band_index, (start, end) in enumerate(ranges):
            values = magnitudes[start:end]
            energy = float(np.sqrt(np.mean(values * values))) if len(values) else 0.0
            db = 20.0 * math.log10(max(1e-8, energy))
            encoded[offset + band_index] = max(0, min(DB_OFFSET, round(db + DB_OFFSET)))

        left_level = min(1.0, float(np.sqrt(np.mean(left * left))) * 4.6)
        right_level = min(1.0, float(np.sqrt(np.mean(right * right))) * 4.6)
        encoded[offset + BANDS] = round(left_level * 255)
        encoded[offset + BANDS + 1] = round(right_level * 255)

    return {
        "duration": round(len(pcm) / SAMPLE_RATE, 3),
        "frameCount": frame_count,
        "data": base64.b64encode(bytes(encoded)).decode("ascii"),
    }


def generate_analysis_file():
    tracks = {key: analyse(path) for key, path in SOURCES.items()}
    payload = {
        "version": 1,
        "stepMs": STEP_MS,
        "sampleRate": SAMPLE_RATE,
        "bands": BANDS,
        "frameBytes": FRAME_BYTES,
        "dbOffset": DB_OFFSET,
        "tracks": tracks,
    }
    target = ROOT / "audio-analysis.js"
    target.write_text(
        "/* Generated from the bundled demo soundtracks. Do not edit by hand. */\n"
        "window.GABECUBEAURA_AUDIO_ANALYSIS = Object.freeze("
        + json.dumps(payload, separators=(",", ":"))
        + ");\n",
        encoding="utf-8",
    )
    return tracks, target


def patch_app():
    path = ROOT / "app.js"
    app = path.read_text(encoding="utf-8")

    marker = "let audioDecodePromise = null;\n"
    if "function getPrecomputedAudioTrack(" not in app:
        if marker not in app:
            raise RuntimeError("Could not find audio decode state marker in app.js")
        helper = r'''let audioDecodePromise = null;
const precomputedAudioCache = new Map();
function getPrecomputedAudioTrack(key = state.audioSyncExample) {
  const dataset = window.GABECUBEAURA_AUDIO_ANALYSIS;
  const track = dataset?.tracks?.[key];
  if (!dataset || !track) return null;
  if (!precomputedAudioCache.has(key)) {
    const binary = atob(track.data);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    precomputedAudioCache.set(key, { ...track, bytes, dataset });
  }
  return precomputedAudioCache.get(key);
}
function readPrecomputedAudioFrame(currentTime, key = state.audioSyncExample) {
  const track = getPrecomputedAudioTrack(key);
  if (!track || !Number.isFinite(currentTime)) return null;
  const { dataset, bytes } = track;
  const frame = clamp(Math.round(currentTime * 1000 / dataset.stepMs), 0, track.frameCount - 1);
  const offset = frame * dataset.frameBytes;
  if (offset < 0 || offset + dataset.frameBytes > bytes.length) return null;
  return {
    rawDb: Array.from({ length: dataset.bands }, (_, index) => bytes[offset + index] - dataset.dbOffset),
    left: bytes[offset + dataset.bands] / 255,
    right: bytes[offset + dataset.bands + 1] / 255,
  };
}
'''
        app = app.replace(marker, helper, 1)

    ensure_pattern = re.compile(
        r"async function ensureAudioGraph\(\) \{.*?\n\}\nasync function toggleAudioPlayback\(\)",
        re.S,
    )
    ensure_replacement = r'''async function ensureAudioGraph() {
  if (getPrecomputedAudioTrack()) return;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) throw new Error("Web Audio is unavailable in this browser");
  if (!audioContext) audioContext = new Context({ sampleRate: 48000 });
  if (audioContext.state === "suspended") await audioContext.resume().catch(() => {});
  const video = $("#audioSyncVideo");
  const source = video.currentSrc || new URL(video.getAttribute("src"), document.baseURI).href;
  if (audioDecodedBuffer && audioDecodedSource === source) return;
  if (audioDecodePromise && audioDecodedSource === source) return audioDecodePromise;
  audioDecodedSource = source;
  audioDecodedBuffer = null;
  const pending = fetch(source, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Audio source request failed (${response.status})`);
      return response.arrayBuffer();
    })
    .then((encoded) => audioContext.decodeAudioData(encoded))
    .then((decoded) => {
      if (audioDecodedSource === source) audioDecodedBuffer = decoded;
      return decoded;
    });
  audioDecodePromise = pending;
  try {
    await pending;
  } finally {
    if (audioDecodedSource === source) audioDecodePromise = null;
  }
}
async function toggleAudioPlayback()'''
    app, count = ensure_pattern.subn(ensure_replacement, app, count=1)
    if count != 1:
        raise RuntimeError("Could not replace ensureAudioGraph in app.js")

    analysis_pattern = re.compile(
        r"function analyseAudioNow\(\) \{.*?\n\}\nfunction audioOpticalScale\(",
        re.S,
    )
    analysis_replacement = r'''function analyseAudioNow() {
  const video = $("#audioSyncVideo");
  const now = performance.now();
  const processInterval = 60;
  if (video.paused || video.ended) {
    if (now - audioLastAnalysis >= processInterval) {
      audioLastAnalysis = now;
      decayAudioAnalysis();
    }
    return;
  }
  if (now - audioLastAnalysis < processInterval) return;

  let rawDb = null;
  let leftLevel = 0;
  let rightLevel = 0;
  const precomputed = readPrecomputedAudioFrame(video.currentTime);
  if (precomputed) {
    rawDb = precomputed.rawDb;
    leftLevel = precomputed.left;
    rightLevel = precomputed.right;
  } else if (audioDecodedBuffer && readDecodedAudioWindow(audioDecodedBuffer, video.currentTime)) {
    const magnitudes = audioFftMagnitudes(audioLeftData, audioRightData);
    const sampleRate = 48000;
    const minimumHz = 45, maximumHz = Math.min(16000, sampleRate / 2 - 1);
    rawDb = Array.from({ length: 17 }, (_, index) => {
      const low = minimumHz * ((maximumHz / minimumHz) ** (index / 17));
      const high = minimumHz * ((maximumHz / minimumHz) ** ((index + 1) / 17));
      const start = Math.max(1, Math.floor(low * 2048 / sampleRate));
      const end = Math.min(magnitudes.length, Math.max(start + 1, Math.ceil(high * 2048 / sampleRate)));
      let power = 0;
      for (let bin = start; bin < end; bin++) power += magnitudes[bin] * magnitudes[bin];
      const energy = Math.sqrt(power / Math.max(1, end - start));
      return 20 * Math.log10(Math.max(1e-8, energy));
    });
    leftLevel = clamp(audioRms(audioLeftData) * 4.6, 0, 1);
    rightLevel = clamp(audioRms(audioRightData) * 4.6, 0, 1);
  }

  if (!rawDb) {
    audioLastAnalysis = now;
    decayAudioAnalysis();
    return;
  }

  audioLastAnalysis = now;
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
  state.audioLeft += (leftLevel - state.audioLeft) * (leftLevel >= state.audioLeft ? attack : decay);
  state.audioRight += (rightLevel - state.audioRight) * (rightLevel >= state.audioRight ? attack : decay);
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
function audioOpticalScale('''
    app, count = analysis_pattern.subn(analysis_replacement, app, count=1)
    if count != 1:
        raise RuntimeError("Could not replace analyseAudioNow in app.js")

    app = app.replace(
        'video.paused ? "Ready" : audioDecodedBuffer ? "Analysing source audio" : "Loading independent audio analysis"',
        'video.paused ? "Ready" : (getPrecomputedAudioTrack() || audioDecodedBuffer) ? "Analysing source audio" : "Loading independent audio analysis"',
        1,
    )
    app = app.replace(
        "const playing = !video.paused && !video.ended && Boolean(audioContext);",
        "const playing = !video.paused && !video.ended && Boolean(getPrecomputedAudioTrack() || audioDecodedBuffer);",
        1,
    )
    path.write_text(app, encoding="utf-8")


def patch_html():
    old_copy = (
        "Audio analysis reads the decoded source track, so the player's volume and mute controls "
        "never reduce the modelled LED response."
    )
    new_copy = (
        "Audio analysis reads compact 60 ms frames generated from the bundled source track, so the "
        "player's volume and mute controls never reduce the modelled LED response."
    )
    for relative in ["index.html", "audio-sync/index.html"]:
        path = ROOT / relative
        html = path.read_text(encoding="utf-8")
        needle = '  <script src="app.js" defer></script>'
        if "audio-analysis.js" not in html:
            if needle not in html:
                raise RuntimeError(f"Could not find app.js script in {relative}")
            html = html.replace(
                needle,
                '  <script src="audio-analysis.js" defer></script>\n' + needle,
                1,
            )
        html = html.replace(old_copy, new_copy)
        path.write_text(html, encoding="utf-8")


def main():
    tracks, target = generate_analysis_file()
    patch_app()
    patch_html()
    print(f"Generated {target.relative_to(ROOT)}: {target.stat().st_size} bytes")
    for key, track in tracks.items():
        print(f"{key}: {track['duration']:.3f}s, {track['frameCount']} frames")


if __name__ == "__main__":
    main()

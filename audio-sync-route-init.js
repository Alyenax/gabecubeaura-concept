/* Route bootstrap loaded after app.js and the mobile Audio Sync analyser patch. */
(() => {
  const requestedUrl = window.__GABECUBEAURA_AUDIO_SYNC_ROUTE__;
  if (requestedUrl) history.replaceState(null, "", requestedUrl);

  state.audioSyncExample = "silksong";
  state.audioSyncStyle = "slow-prism";
  state.audioSyncPalette = "screen-sync";
  state.audioSyncReactivity = "fast";
  state.audioSyncBrightness = AUDIO_TUNING["slow-prism"][0];

  syncAudioUI();
  setTab("audio-sync");

  const video = $("#audioSyncVideo");
  video.muted = true;
  video.pause();
  try { video.currentTime = 0; } catch (_error) {}

  syncAudioPlaybackUI();
  syncScreenPlaybackUI();
  $("#audioSyncState").textContent = "Ready";
  $("#audioSyncTime").textContent = "Tap Play Audio Sync to start the demo and enable audio analysis.";

  requestAnimationFrame(() => $("#lab")?.scrollIntoView({ block: "start" }));
})();

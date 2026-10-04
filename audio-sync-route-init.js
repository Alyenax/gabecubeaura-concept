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
  syncAudioPlaybackUI();
  syncScreenPlaybackUI();

  const video = $("#audioSyncVideo");
  video.muted = true;
  void video.play().catch(() => {
    $("#audioSyncState").textContent = "Ready";
    $("#audioSyncTime").textContent = "Autoplay was blocked. Tap play to start the demo and enable audio analysis.";
  });

  requestAnimationFrame(() => $("#lab")?.scrollIntoView({ block: "start" }));
})();

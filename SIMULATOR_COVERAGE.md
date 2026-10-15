# Lighting simulator coverage

Reference: GabeCubeAura Lab 121, commit
`9f52a3251bc15b21ea1318a5b1768c3f613fd1f5`.
This covers the visual families, not every administration screen or hardware API.
The production plugin is not installed or started by this site.

| Family | Available examples | Fidelity |
| --- | --- | --- |
| Customization+ | All 65 catalog entries, 1–3 colours, HEX, speed, direction | Existing browser choreography, weather/event frame sampling |
| Events | 6 notifications, 6 achievements, 5 screenshots, recording start/stop | Sampled production renderer |
| Controllers | 15 patterns, 1–4 seats, batteries, charging, low warnings | Existing renderer port, manually supplied telemetry |
| Weather bar | 9 conditions, all 22 variants | Production sequences sampled at 8 fps |
| Launches | All 10 patterns, per-sample AppID colours and duration | Browser choreography, local image analysis |
| Artwork bar | Three games, Hero/Header/Capsule, upload, sampled row | Real bundled image pixels; no Steam discovery |
| Performance bar | CPU/GPU load, temperatures, palettes, directions, response | Existing visual model, sample readings |
| Playtime | Family/personal timer, thresholds, countdown, speed | Visual timer model; no Steam Families query |
| Audio Sync | 10 patterns, 22 palettes, reactivity, brightness | Actual bundled soundtrack analysis; browser/FFT approximation |
| Screen Sync | Panorama/Ambient, response, intensity, black bars | Actual bundled video sampling, not Gamescope |
| Witcher 3 | Vitality, stamina, toxicity, adrenaline, Signs | Experimental visual model, not game telemetry |
| Faceplate weather | All 22 Realistic V2 banks | Exact RGB frames and delays from runtime packs |
| Faceplate artwork | Three games, 3 image kinds, crop | Browser crop to exactly 64 × 54 |
| Dashboard | Weather/artwork, notch, clock, forecast, batteries, CPU/GPU, session, timer | Shared native font and marks; controller reference overlay matches native RGB pixel by pixel; performance/session/timer are labelled example layouts |
| Gabe Assistant | 3 mounts × 3 amplitudes × 3 reactions | All 27 authored RGB banks, native delays, semantic eye/frame recolouring |
| Companion | Calm/lively × wake/listen/question/success | All 8 authored RGB banks, native delays, no repeated one-shot spin, actual GIF byte count |
| Assistant mouth | Two colours, centre width, conversation steps | Explicitly synthetic envelope, silent; not voice analysis |
| Image extension | 17 source zones, excludes Dashboard text rows | Explicit browser approximation, not semantic runtime projection |
| Ambience | Evening, daytime, gaming examples | Coordinated demonstration choices, not imported saved profiles |
| Routing | Independent Home/game routes for bar and Faceplate | Browser-local model; current route restored after conversation |
| Brightness | Global bar level, Day/Night gain, independent Faceplate | Independent controls; profile changes do not overwrite global brightness |
| Safety/ownership | Master off, asleep, critical red, Steam ownership | Manual scenarios; Valve firmware patterns intentionally not invented |

## Deliberately not emulated

No microphone, wake-word recognition, transcription, voice playback, language
understanding, shell, CEC, launch/close command, sleep/shutdown command, USB,
serial acknowledgement, flash writing, real sensors, Steam API, weather API,
SteamGridDB API, module downloads or private settings are accessed. The assistant
command list describes the installed plugin, not executable browser actions.

Native 64 × 54 pixels are drawn as separate dots. LCD brightness and diffuser
glow remain illustrations, not a calibrated prediction of emitted hardware light.
No browser preview can establish physical timing, flash wear or microphone accuracy.

## Verification

`test_site.mjs` retains the existing light-bar, controller, artwork, media,
experimental HUD, direct Audio Sync route and file-opening checks.

`test_simulator.mjs` compares all 58 PNG atlases against the source RGB SHA-256
hashes (22 weather + 35 assistant + 1 overlay fixture), checks the approved
Dashboard overlay pixel by pixel, exercises all weather variants and assistant
reactions, validates current-route restoration, safety, brightness, reset and
320–1440 px layouts. Asset export is an offline build step, never a page task.

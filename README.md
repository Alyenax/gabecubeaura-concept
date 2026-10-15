# GabeCubeAura Concept Lab

A standalone, interactive product preview for [GabeCubeAura](https://github.com/Alyenax/GabeCubeAura). It simulates the official Steam Machine's 17-pixel light bar without installing Decky Loader, reading a Steam account, or writing to hardware.

[Open Audio Sync directly](https://alyenax.github.io/gabecubeaura-concept/audio-sync/) with Silksong, Slow Prism, Screen Sync colours and the Fast response preset already selected.

[Try the development interface preview](https://alyenax.github.io/gabecubeaura-concept/interface-preview/):
the Decky quick panel, full settings and three artwork examples. This is a
code-based draft reconstruction, not a SteamOS screenshot or live hardware.

The simulator now covers the **Lab 121 visual families**, while keeping real
hardware and service behaviour explicitly outside the browser. See
[SIMULATOR_COVERAGE.md](SIMULATOR_COVERAGE.md) for the per-feature fidelity and limits.
It includes:

- Customization+ as an independent permanent display, with all 65 effects grouped under Steady, Light Events, Controllers, Weather and Game Launches;
- one, two or three exact colours, hexadecimal editing, raw 34–255 brightness, speed and direction;
- per-AppID Game Launches using two or three dominant colours extracted locally from Hero, Header or Capsule artwork;
- custom two- and three-colour launch palettes retained separately per sample AppID, ten patterns and a 3–45 second timer;
- Artwork, Performance, Playtime, Light Events, Weather and the complete priority explanation;
- controller gauges for one to four players, automatic mirrored layouts for two and four players, a left-to-right Three Seats layout, Battery level or fixed Player seats colour meaning, editable P1 to P4 colours, three official choices in every animation family and dedicated Three Seats and Four Seats previews;
- a live Audio Sync presentation driven by the bundled Silksong and The Witcher 3 Remastered gameplay videos, with real browser-side stereo analysis, 17 logarithmic frequency bands and all ten current patterns;
- independent Pattern and Palette selectors, the 22 current palettes, Calm, Balanced, Fast and Punchy response, per-pattern recommended settings and the shared 34–255 brightness control;
- the current defaults: Slow Prism with Screen Sync at Home and Hi-Fi Crest with Screen Sync in game;
- a live Screen Sync presentation using the same Silksong and The Witcher 3 videos, with the production 34 by 18, 10 fps processing model, Panorama and Ambient mappings, brightness, colour intensity and cinematic black-bar controls;
- an explicitly experimental The Witcher 3 Lab for Steam AppID 292030, including vitality, stamina, toxicity, adrenaline and Sign previews plus the required setup commands;
- the `GabeCubeAura Off` wording, distinct from disabling every GabeCubeAura output.
- a native 64 × 54 dot-matrix Faceplate using all 22 Realistic V2 weather loops, including cloudy nights;
- a common Dashboard overlay for weather and game artwork, six bottom-row examples, Celsius/Fahrenheit, 12/24-hour clocks, P1/P2 percentages or battery bars;
- Gabe Assistant's 27 authored face banks and Companion's 8 interactive banks, preserving frame delays and one-shot/loop semantics; a silent conversation preview restores the current Home/game route;
- two-colour adjustable-width Slow Prism mouth examples, independent eye/frame colours and Companion heart colour;
- local artwork crop, Faceplate image extension, coordinated ambience examples and independent Home/in-game routes for both displays;
- master on/off, light-bar brightness, Night gain, Faceplate brightness and explicitly simulated sleep, critical-temperature and Steam-ownership states.

Native atlases are lossless PNG strips exported from the prepared runtime RGB
frames. They load on selection, not all at startup. No GIF decoder, model,
speech process or conversion job runs in the page. The Companion byte counts
describe the original runtime GIFs (all at most 12,000 bytes), not the PNG
transport or real serial latency. The assistant sequence is silent and never
executes a command. The six Dashboard bottom-row modes include illustrative
session/timer/performance layouts as well as ports of the approved native rows.

Steam's native Patrol, Breathe, Rainbow and Solid presets are deliberately not imitated. GabeCubeAura Off is presented as the route that leaves Steam's authentic effect visible between temporary GabeCubeAura layers. Native download activity, repeated Valve writes and the fixed red critical thermal warning remain above the simulated permanent displays in the priority explanation.

The Audio Sync page is not a prerecorded LED animation. Web Audio decodes the bundled video's AAC stereo soundtrack and updates the 17-pixel renderer live. The browser model follows the production architecture: 48 kHz stereo, a 2,048-sample FFT window, one analysis block every 60 ms, 17 logarithmic bands from about 45 Hz to 16 kHz and adaptive programme matching over a 10.2-second rolling window. It exposes the same Impact, Attack, Texture and Stereo concepts used by the current engine. It is a faithful visual model, not a claim that browser Web Audio and PipeWire produce bit-identical samples.

Patterns and palettes are independent. The available patterns are 17-band spectrum, Audio pulse, Bass pulse, Constellation, Hi-Fi Crest, Negative Bloom, Slow Prism, Stereo field, Stereo Lanterns and Velvet Relay. Screen Sync reduces the live video to three harmonised optical roles for the Steam Machine diffuser: dark high-frequency edges, darker mid-frequency shoulders and a brighter low-frequency centre. If live colour capture is unavailable, the plugin tries Artwork and then Sapphire. Artwork holds a stable three-colour palette from the active game. Audio and sampled video colours stay in the browser. The production plugin uses the system's mixed PipeWire output and Gamescope capture instead of this demonstration file.

The Screen Sync page uses those same two gameplay files as real frame sources rather than generated colour scenes. The browser downsamples each frame to 34 by 18 pixels at 10 fps, discards the brightest five percent before averaging, detects cinematic black bars across three stable frames, maps Panorama to 17 horizontal zones or Ambient to one shared colour, applies spatial blur, brightness and colour intensity, and then uses the production asymmetric response values. The production plugin receives equivalent BGRx frames from Gamescope through PipeWire.

Light-event and weather frames are sampled from GabeCubeAura's real renderers by `export_frames.py` and `export_weather_frames.py`. Each exporter writes both JSON and a matching JavaScript data file so every Customization+ family also works when `index.html` is opened directly through `file://`. Controller previews use the plugin's real pattern names, timings and 17-pixel choreography. Three Seats and Four Seats extend those multiplayer patterns across fixed player zones. Battery level keeps the status palette used by the plugin. Player seats is a proposed alternative that assigns a persistent editable colour to P1, P2, P3 and P4 while low-battery and charging alerts keep their warning colours. Customization+ remaps that choreography to its chosen palette. Screen Sync and Witcher 3 are faithful visual explainers of the beta controls, not Gamescope capture or live game telemetry. Launch patterns and other modes are also interactive browser simulations.

Sample artwork is from the public Steam store pages for [Deep Rock Galactic](https://store.steampowered.com/app/548430/), [The Witcher 3](https://store.steampowered.com/app/292030/) and [Balatro](https://store.steampowered.com/app/2379780/); each image belongs to its respective publisher. Uploaded images stay in the browser and are not sent anywhere.

The front-on console silhouette uses the **156 mm width × 152 mm height** ratio in [Valve's Steam Machine specifications](https://store.steampowered.com/hardware/steammachine). Valve lists 162.4 mm depth, which a front view cannot show. Lighting and diffuser details remain an illustration, not a hardware-accuracy claim.

The website has no runtime dependencies, analytics or third-party runtime requests. Serve this directory over HTTP to test locally. HTTP is required for native Faceplate canvas reads, media and Web Audio behaviour:

```sh
python3 -m http.server 8765
```

To refresh weather frames from an explicit checkout, set `GCA_PLUGIN_SOURCE`
and run `python3 export_weather_frames.py`. To regenerate Faceplate/assistant
atlases, run `python3 export_simulator_assets.py /absolute/plugin/checkout`.
The exporter records the exact source commit. Only RGB assets and visual
metadata are published, not plugin credentials, settings or speech models.
The Playwright checks are `node test_site.mjs` and `node test_simulator.mjs`
when Playwright is available in the parent workspace.

GitHub Pages serves this repository directly from the root of its `main` branch. See [PUBLICATION_NOTES.md](PUBLICATION_NOTES.md) for the publication and beta-preview record.

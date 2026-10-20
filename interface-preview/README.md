# GabeCubeAura interface preview

A browser-local documentation preview linked from the public README. The default
view now proposes a compact quick-access panel in French. Full settings and setup
remain the historical English Lab 131 demonstration, not the current plugin.
It is not a SteamOS screenshot or an installed plugin.

## Compact quick panel proposal · October 20, 2026

The default route shows the new proposal, without an extra product installation:

- One narrow 340px surface: lighting switch, timer, global brightness, ambience.
- Timer duration presets / 1–240 minutes, then remaining time, +15 minutes and Stop
  in the same place. Optional sleep/shutdown is explicitly confirmed and simulated
  only; cancelling or stopping disarms it. The timer continues when visiting settings.
- Ambience never changes the global brightness. Switching lighting off leaves the
  timer and assistant microphone preference alone.
- Assistant shortcut appears only when the external simulation control marks it
  configured. Stop speaking leaves listening enabled. No microphone is opened.
- JSAUX shortcut appears only for connected/recently detected hardware scenarios.
  Busy/disconnected controls are disabled, preferences survive reconnection, and
  Home/game selections remain separate. No USB transaction takes place.
- No permanent artwork image, performance readout or stack of settings buttons.
  The gear keeps historical full settings accessible; per-game display has one link.

The new surface uses scoped `compact-panel.css` / `compact-panel.js` and the existing
browser-local state adapter. It does not import or edit any plugin source. It
demonstrates ordinary browser keyboard focus, not Valve's actual Gamescope focus
engine. No controller compatibility or hardware delivery is claimed by this test.

Run `node test_compact_panel.mjs` with Playwright resolvable by Node and a static
server on port 4202 (`GCA_INTERFACE_URL` and `GCA_CHROME` may override). Covers timer
validation/confirmation/cancel/expiry, focus, brightness isolation, context gates,
reset, settings return, and 24 responsive states. Existing settings/Studio suites
remain separate regression gates.

## Animated Screensaver Studio (Lab 131)

Open `?page=screensaver` for direct access. This section uses the **actual
Lab 131 React component**, not a separately drawn approximation. The four spaces,
labels, controls, conditional faceplate framing, advanced disclosure, progress,
pause/resume and two-step Steam installation confirmation come from that source.
Only Decky's native controls and service calls are adapted for the browser.
No plugin backend, settings, credentials or user library is copied.

Collection cards are stills. The player starts only on request, uses the actual
shared Lab 131 player, and stops when the section closes. It supports previous,
next, play/pause, transition, title, cover and framing settings. Same-origin
illustrative 3-second, 30-frame GIFs pan over the already-public Witcher, Deep
Rock Galactic and Balatro stills; these are **not downloaded SteamGridDB
animations**. Their 64 × 54 counterparts demonstrate the prepared faceplate
preview. There are no fabricated game logos. Neither USB playback nor inactivity
launch in Steam is claimed to be tested here.

All service operations are in-memory rehearsals, identified visibly. Password
fields reject input; an explicit dummy-key control unlocks the example search
and preparation paths. A real key must never be entered on this public page.
The optional Steam owned-library import is disabled. No diagnostic is sent.

Rebuild from the private source checkout (at the verified commit below):

```sh
cd interface-preview
npm ci
npm run build -- /absolute/path/to/GabeCubeAura-Lab-consolidation
node export_catalog.cjs /absolute/path/to/GabeCubeAura-Lab-consolidation
```

The builder imports only the named frontend component, replacing its four
runtime imports with local adapters. It retains the shared player's MIT licence
and React's licence. The bundle is served statically by existing GitHub Pages;
there is no new Actions workflow, application server or standalone background UI.
Inline CSS is allowed solely to render the unchanged component's styling;
inline scripts remain blocked by the page's Content Security Policy.

Additional regression: `node test_studio_interface.mjs` from the site root with
the site served on port 4201. Covers player controls/teardown, real local GIF
loading, filters/candidates, dummy credentials, tools/progress/pause/resume,
faceplate preview, install confirmation and 320–1024 px overflow checks.

The page is isolated from the lighting simulator. GitHub Pages serves this
directory from the existing `main` branch. No new hosting or Actions workflow
is added. This update changes only the interface-preview route and its tests.

## Preview states

- Quick panel: Home/in game, connected, absent for ten minutes, recently
  disconnected or serial port busy. Artwork/readings are not permanently displayed.
- All eight sidebar sections; six Light bar and six Signals and automation
  subpages, with actual controls instead of navigation-only placeholders.
- First-run preset, brightness/location and review steps.
- Source-derived control definitions including expanded dynamic families. This is not a
  count of separate features; shared settings can appear in more than one flow.
- Colours with independent picker, HEX and RGB inputs. Options, labels, ranges
  and descriptive text come from the inspected Lab 121 JSX/constants.
- Local artwork library: choose a sample installed game, source type, adjustment,
  progress rehearsal, apply to game/Dashboard, assignment and immediate deletion.
- Assistant readiness/module rehearsals, advanced disclosures, FR/EN command
  glossary and silent native character previews. No audio capture or voice playback.
- Ambience profile create/save/duplicate/try/delete. The quick panel proposes an
  ambience preset selector, not the advanced named-profile editor.
- Explicit CPU/GPU risk dialog: Cancel does not select Performance.
- Example update, rollback, diagnostic export and safe preview-JSON import flows.

Choose The Witcher 3, Deep Rock Galactic or Balatro. The real bundled Steam
header image changes with the selected title. Its 60-percent-height row is
sampled into seventeen horizontal RGB averages in a browser-local canvas,
following the existing concept simulator's `sampleArtwork` approach. This
fixed row is illustrative, not a claim to reproduce production auto-row selection.
Readings, selected routes and hardware status are simulated. Inputs do not change
Steam settings, run processes, open a microphone or contact hardware. Ordinary
example edits remain in memory while navigating; a page reload resets them.
Per-game overrides are independent for the three samples.

The standalone HTML, CSS and JavaScript use only same-site assets, without a
host iframe, external runtime dependencies, API requests or analytics. No real
API key can be entered; only explicitly labelled example-key states are available.
External SteamGridDB preferences open only after the corresponding user action.

Source catalogue rebuild (offline; TypeScript must be available in the source checkout):

```sh
node interface-preview/export_catalog.cjs /absolute/path/to/plugin-checkout
```

The generator parses JSX and evaluates only six allowlisted data-only TypeScript
modules, never the plugin runtime. It exports no account data or real settings.
Source commit: `d7d82350392018e7226822f003cb22a044667ce1`.

Run `node test_interface.mjs` with a local server on port 4200 (or override
`GCA_INTERFACE_URL`). The regression suite covers every page, conditional fields,
cancel/accept, state retention, library prepare/delete/assignment, assistant
readiness, native previews, profiles, onboarding and 320–1024 px layouts.

## Artwork credit

These are the same sample header files already supplied by this concept site:

- `assets/witcher-header.jpg`: [The Witcher 3](https://store.steampowered.com/app/292030/).
- `assets/drg-header.jpg`: [Deep Rock Galactic](https://store.steampowered.com/app/548430/).
- `assets/balatro-header.jpg`: [Balatro](https://store.steampowered.com/app/2379780/).

Game images belong to their respective publishers. Reuse here does not imply
endorsement. Source and timing limitations remain visible in the preview.

The older conversation fragment remains a historical navigation sketch. The
maintained, complete website implementation is now `index.html`, `interface.css`,
`interface.js` and the generated `source-catalog.js` in this directory. Neither
view is a claim of exact SteamOS control geometry or physical-device behaviour.

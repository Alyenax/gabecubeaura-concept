# GabeCubeAura interface preview

An English, browser-local documentation preview linked from the public README.
It reconstructs the development quick panel and settings organisation from
Lab 121. It is not a SteamOS screenshot or an installed plugin.

The page is isolated from the lighting simulator. GitHub Pages serves this
directory from the existing `main` branch. No new hosting or Actions workflow
is added. This update changes only the interface-preview route and its tests.

## Preview states

- Quick panel: Home/in game, connected, absent for ten minutes, recently
  disconnected or serial port busy. The heavy in-game artwork/readings are
  hidden when the Faceplate is connected, including a busy port.
- All seven sidebar sections; six Light bar and six Signals and automation
  subpages, with actual controls instead of navigation-only placeholders.
- First-run preset, brightness/location and review steps.
- 303 control definitions including expanded dynamic families. This is not a
  count of separate features; shared settings can appear in more than one flow.
- Colours with independent picker, HEX and RGB inputs. Options, labels, ranges
  and descriptive text come from the inspected Lab 121 JSX/constants.
- Local artwork library: choose a sample installed game, source type, adjustment,
  progress rehearsal, apply to game/Dashboard, assignment and immediate deletion.
- Assistant readiness/module rehearsals, advanced disclosures, FR/EN command
  glossary and silent native character previews. No audio capture or voice playback.
- Ambience profile create/save/duplicate/try/delete; no profiles in the quick panel.
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
Source commit: `9f52a3251bc15b21ea1318a5b1768c3f613fd1f5`.

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

# GabeCubeAura interface preview

An English, browser-local documentation preview linked from the public README.
It reconstructs the development quick panel and settings organisation from
Lab 121. It is not a SteamOS screenshot or an installed plugin.

The page is isolated from the older lighting simulator. No existing home-page
markup, renderer or media changes are needed. GitHub Pages serves this directory
from the existing `main`-branch source; no new Actions workflow is added.

## Preview states

- Home, with a connected Faceplate.
- Home, with no Faceplate detected for ten minutes.
- In game, without a Faceplate, showing the selected game's artwork.
- Full settings, with the Light bar and Signals and automation groups.

Choose The Witcher 3, Deep Rock Galactic or Balatro. The real bundled Steam
header image changes with the selected title. Its 60-percent-height row is
sampled into seventeen horizontal RGB averages in a browser-local canvas,
following the existing concept simulator's `sampleArtwork` approach. This
fixed row is illustrative, not a claim to reproduce production auto-row selection.
Readings, selected route and hardware status are simulated. Inputs do not change
Steam settings, run processes, open a microphone or contact hardware.

The standalone export embeds the three small JPEGs so no artwork API, account,
key or third-party image request is needed. Its rendering support uses the
exporter's pinned public static dependencies. No analytics is added.

## Artwork credit

These are the same sample header files already supplied by this concept site:

- `assets/witcher-header.jpg`: [The Witcher 3](https://store.steampowered.com/app/292030/).
- `assets/drg-header.jpg`: [Deep Rock Galactic](https://store.steampowered.com/app/548430/).
- `assets/balatro-header.jpg`: [Balatro](https://store.steampowered.com/app/2379780/).

Game images belong to their respective publishers. Reuse here does not imply
endorsement. Source and timing limitations remain visible in the preview.

The editable fragment is retained in the task's authoring workspace; `index.html`
is the standalone exported document. The surrounding export only provides local
preview state; it does not require a signed-in host application.

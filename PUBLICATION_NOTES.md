# GabeCubeAura Concept Lab publication notes

## 1.2.0 beta preview update, 2026-09-30

The public Concept Lab now includes two additional simulations used by the
1.2.0 beta documentation:

- Screen Sync offers Panorama and Ambient output, three generated scenes,
  brightness and colour-intensity controls, and the cinematic black-bar option;
- The Witcher 3 Lab is labelled experimental throughout, targets Steam AppID
  292030, previews vitality, stamina, toxicity, adrenaline and all five Signs,
  and shows the exact `-net -debugscripts` and
  `DebugScriptsForceFlush=true` requirements.

Neither simulation connects to Gamescope, The Witcher 3 or the physical LED
bar. The page says so directly. The priority explanation continues to place
Steam-native activity, safety signals, countdowns and short alerts above
permanent displays. The controller simulator update below is included in the
same public Concept Lab revision and supplies the four-controller documentation
capture for the beta README.

## Release scope

This website began as the public showcase for **GabeCubeAura 1.0.0** and now
also hosts the **1.2.0 beta** feature preview. It uses the same public identity
throughout.

The mockup now covers the product changes that were missing from the previous
SignalBar showcase:

- the GabeCubeAura name and `Alyenax/GabeCubeAura` links;
- Customization+ as a separate permanent display;
- the complete 61-effect library, grouped by origin;
- exact one-, two- or three-colour controls, raw brightness from 34 to 255,
  speed and direction;
- Game Launches as a temporary layer, with sample AppIDs, local artwork colour
  extraction, custom per-AppID palettes, ten patterns and a visible timer;
- GabeCubeAura Off wording and the revised priority hierarchy;
- explicit omission of Valve's Patrol, Breathe, Rainbow and Solid effects;
- no embedded LED game or unrelated game tab.

## Publication checks

1. The final behaviour was validated on the physical Steam Machine by the
   project owner.
2. The plugin repository and all public links use `Alyenax/GabeCubeAura`.
3. GabeCubeAura 1.0.0 is published with a ZIP archive and SHA-256 checksums.
4. The concept repository is published from its `main` branch with GitHub
   Pages.
5. The live landing page, every simulator tab, repository links, desktop
   layout and the 390 px mobile layout are verified after deployment.
6. The 1.2.0 beta additions are explicitly presented as simulations; The
   Witcher 3 feature is explicitly marked experimental.

The concept site is published after the GabeCubeAura repository so its source
and download links resolve immediately.

## Mockup functional audit, 2026-09-27

The audit following the rebrand found and corrected two functional gaps:

- direct `file://` opening could not fetch the JSON choreography files, leaving
  35 Customization+ Light Event and Weather choices dark; the exporters now
  generate matching JavaScript datasets loaded before `app.js`, with no runtime
  fetch dependency;
- Game Launches reused one global artwork palette, which allowed a completed
  image load to overwrite another game or artwork source; palettes are now
  stored by `game:source`, stale asynchronous loads are ignored, and the UI
  exposes an explicit analysing/ready state with the extracted hexadecimal
  colours. Because browsers forbid canvas pixel reads from local `file://`
  images, the nine bundled sample artworks also have a per-game/per-source
  palette cache; HTTP mode still performs the extraction dynamically.

The one-colour Customization+ choice now hides both unused colour fields, and
Steady disables controls that cannot affect it. The automated check now verifies
actual LED output for Steady and representative Event, Controller, Weather and
Launch families; all 19 event datasets and all 18 weather loops contain lit
frames; Hero/Header palettes differ where the sample artwork differs; custom
launch colours are the only hues rendered, and all ten launch patterns light
the bar; direct `file://`, desktop HTTP and 390 px mobile layouts are all
covered.

## Controller simulator update, 2026-09-29

The Controllers tab now exposes one, two, three and four active controllers in
the same simulator instead of sending visitors to a separate mockup. Each
controller has its own battery value and can be selected for connection,
low-battery and charging previews. Three Seats and Four Seats keep every player
visible in a fixed section of the 17-pixel bar. The live preview replaces its
generic left-centre-right caption with an explicit P1 to P4 seat legend.

The Colour meaning control from the earlier controller-system prototype is
kept in the integrated mockup. Battery level uses Healthy, Medium, Low and
Charge colours. Player seats assigns an editable persistent colour to P1, P2,
P3 and P4. The LED renderer and the seat legend both update immediately, while
low-battery and charging events retain their semantic alert colours.

Seat direction is automatic instead of becoming another user setting. Two
controllers keep the established mirrored halves. Four Seats mirrors the two
players on each side of the centre LED. Three Seats uses three ordinary
left-to-right zones, so P2's white endpoint advances consistently instead of
jumping from one side of its centre zone to the other.

All five controller animation families retain the plugin's three public pattern
names. Existing one-controller signals and two-controller choreography use the
same timing and pixel rules as the plugin renderer. The new three-player and
four-player layouts extend the multiplayer choreography across the additional
fixed seats without changing those names.

The browser test covers the four battery controls, automatic direction for two,
three and four controllers, both colour meanings, all four editable player
colours, target selector, Three Seats and Four Seats labels, every controller
pattern option, one-controller fallback and the mobile layout.

## Complete comparison with the original public mockup

Before this controller pass, the public concept site offered one or two
controllers, two battery sliders, one two-player preview and an external link to
a separate controller mockup. This local revision changes the following:

- the Explore card now advertises up to four controllers and fixed-seat gauges;
- Connected controllers now accepts one, two, three or four and reveals the
  matching battery sliders;
- the two-player layout remains 8 LEDs, a dark centre and 8 mirrored LEDs;
- Three Seats uses three 5-LED zones with two separators, with P2 filling from
  the centre out as in the earlier controller-system prototype;
- Four Seats uses four 4-LED zones around the centre LED;
- the live preview shows P1 to P4 labels and reported percentages instead of
  only Left, Centre and Right while the Controllers tab is open;
- the selected controller can be targeted for connection, low-battery and
  charging previews;
- multiplayer, permanent gauge, connection, low-battery and charging are
  presented in one Visual situation control;
- every controller family exposes the three names and timings used by the
  current plugin renderer;
- Two controllers, Three Seats and Four Seats reuse the multiplayer
  choreography across every active seat;
- Colour meaning restores the Battery level and Player seats choice from the
  earlier prototype;
- Battery level retains the Healthy, Medium, Low and Charge palette;
- Player seats restores four editable colours for P1, P2, P3 and P4;
- Bright tip, Quiet fill and Soft horizon now apply consistently to the
  permanent one-to-four-player gauge;
- seat direction is automatic: two and four controllers are mirrored, while
  Three Seats fills every player zone from left to right;
- low-battery red and charging blue remain semantic alert colours in Player
  seats mode;
- the obsolete link to the separate controller mockup has been removed;
- canonical, header, project, release and footer links now use Alyenax;
- README and publication notes describe the integrated controller proposal;
- the browser suite now checks all controller counts, both colour meanings,
  editable player colours, all pattern choices, desktop, mobile and direct
  file opening.

## Expanded lighting simulator, 2026-10-15

Expanded the existing lighting simulator to the Lab 121 visual
  families without creating a plugin release or a new hosting workflow.
  Native 64 × 54 atlases include all 22 Realistic V2 weather loops and 35
  assistant banks; RGB hashes and authored delays are retained. Added weather
  and artwork Dashboards, both characters, image extension, ambience examples,
  Home/game routes, independent brightness and explicit safety scenarios.
  The assistant preview is silent and never opens a microphone or performs an
  action. The page explains fidelity and hardware-only limits in
  `SIMULATOR_COVERAGE.md`. Images load on selection. Kept the direct Audio Sync
  route on manual Play and corrected its canonical URL/title. Existing media,
  front-on chassis and the separate interface preview remain intact.

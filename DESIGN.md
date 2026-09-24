# Design

Documented from the built interface (impeccable `new-work` → code-led build → critique, two review rounds, verdict 34/40 → verdict fixes → detector clean). The direction contract lives in `.impeccable/surfaces/index-html.md` (seed `3c09331c`; the roll ran degraded, without challengers, because its service is outside the build VM's network allowlist). Tokens: `src/styles/tokens.css`, mirrored in `.impeccable/design.json`.

## Design read

An **Operate** tool whose first screen also has to persuade, for a vegetable seller on a phone in a sunny market and three student judges on laptops. The language is **the seasonal crop almanac**: the FAO-style crop calendar (crops down the side, twelve months across, flat colour bars), the agricultural extension poster (flat fields, numbered drawings, plain words) and a wall calendar in a market stall. Dials: variance 6 · motion 5 · density 5.

## World

- **The year is the grid.** On wide screens the right column is twelve month columns: the dumbbell strip and the crop calendar share them. The left column is the "station": town, the year in one sentence, today, this month, and the pot.
- **One temperature frame on screen: the hottest hours.** The pot's tags, the year strip's dumbbells and the hero numeral all show the hottest part of the day, which is when food spoils fastest and when a seller can check her pot with a thermometer. The day average (what the calibration and shelf life use) appears once, as a secondary line that says why it matters, and in the numbers table.
- **Honest states are designed, not defaulted.** A month that doesn't work gets a muted numeral, its reason directly under the month name, and a build card that leads with "Not worth building for August… [Plan for April]". A town where it never works says so and folds the steps away. The first line under the headline always says what *this* month is.
- **Flat fields, no chrome.** Colour arrives as whole cells, bars and dots. No shadows (the town list uses a 2 px ink rule instead), no gradients, no glass, no side stripes.
- **Drawn like an extension manual.** The pot is an SVG cross-section drawn from the model: sand darkens with water, the inside tints indigo as it cools, droplets rise from the outer wall at a rate set by the water estimate, and the air/inside tags retarget. Leader-line labels on wide screens become numbered callouts 1–4 with a key on phones.
- **Colour is never the only signal (WCAG 1.4.1).** Verdicts are colour *and* texture everywhere they appear (strip bands, chip swatch, now-line swatch, map key): works = solid indigo, helps a little = millet with ink dots, too humid = diagonal hatch, mild = pale outline.

## Colour (Full palette: four roles on ground and ink)

| Token | Role | Value |
|---|---|---|
| `--lime` | Ground (limewash, not cream) | `#F3F4EE` |
| `--lime-2` | Second layer: selection, panels, table rows | `#E8EADF` |
| `--ink` | Text, rules (Kano indigo-black) | `#12162B` |
| `--ink-2` | Secondary text | `#3C4160` |
| `--indigo` | Cooling, "works", primary action, links | `#2A3A8F` |
| `--indigo-mark` | Chart marks for "inside the pot" (validated with tomato by the dataviz palette checker) | `#3B4FB8` |
| `--tomato` | Heat, "air", warnings | `#C8252C` |
| `--millet` | "Helps a little" fields | `#E6B02E` |
| `--millet-ink` | Millet-coloured text | `#7A5500` |
| `--leaf` | Crop notes | `#2F7D4F` |
| `--sand` | Dry sand in the drawing | `#D9C9A3` |

Measured contrast (`tests/contrast.test.ts`): ink/lime 16.2 · ink-2/lime 9.0 · indigo/lime 9.0 · tomato/lime 5.1 · millet-ink/lime 6.1 · ink/millet 9.0 · indigo-mark/lime 6.3 (marks) · leaf/lime 4.6. Chart pair indigo-mark/tomato: CVD ΔE 22.7, normal-vision ΔE 31.4 (dataviz `validate_palette.js`, all checks pass).

## Type

- **Anybody** (variable, width 50–150 %, weight 100–900; OFL) for the wordmark, headings, month names and numerals. Months and headings sit around 100–135 % width; numerals are heavy and wide. Degree signs are set in the text face so they don't turn into rings at heavy weights.
- **Atkinson Hyperlegible Next** (Braille Institute; OFL) for all reading and UI text, chosen for glare and low vision. Its slashed zero is kept on purpose (0 vs O).
- Scale: 0.8125 · 0.9375 · 1.0625 (body) · 1.35 · 1.62 · 2.25 rem; the hero numeral clamps between 2.8 and 5.75 rem.
- No eyebrow labels, no tracked-mono costume, no italic serif.

## Space and layout

- 4 px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 72.
- ≥ 1100 px: station (5 fr, sticky) + year field (11 fr); header in one row (wordmark · tagline · section nav · language · unit). At 1366×768 and up, the first screen holds the tagline, the headline, today, the month verdict, the hero numeral, the pot, the full year strip and the top of the crop calendar.
- < 1100 px: one column in reading order: town → headline → today → **year strip** → month + pot → crops (so scrubbing the year updates what's on the same screen).
- ≤ 700 px: the crop calendar becomes a one-tap list for the selected month with each crop's own multiplier.
- Gutters 16 / 32 / 48 px.

## Components

- **Town combobox** (ARIA 1.2, listbox popup, accent-insensitive, country names match), search glyph, "Use my location" → nearest bundled town with its distance.
- **Now line**: today's verdict and the next good month, with "Show {month}".
- **Month strip**: 12 radios with roving tabindex; click, arrow keys, Home/End, or drag to scrub; hover tooltip; a visible ▼ NOW marker; table view under "Month-by-month numbers".
- **Pot**: SVG cross-section, `role="img"` with a text alternative stating the numbers.
- **Crop calendar**: a real `<table>`; bars from 1× to the town's best; the selected month's values printed, others in accessible text; per-crop detail leads with days ("4–5 days") from the seller's own baseline; grouped "Never put these in the pot".
- **Build card**: verdict-aware notice, capacity slider (10–100 L), six steps from MIT D-Lab's Best Practices, water estimate, "Save as image" (1080×1350 PNG for WhatsApp) and print.
- **Check my pot**: two readings → efficiency on a 0–100 % scale with the band labelled "Pots D-Lab measured"; errors under the fields with `aria-invalid`.
- **Map**: Equal Earth, 492 towns, verdict key, "Works well in N of 492 towns this month".
- **Validation table** in "How Zeer knows": model vs D-Lab measurements it wasn't tuned on.

## Motion (emil animate)

- Scrubbing the year: frequent action, state purpose. CSS transitions only: sand and inside tint (opacity, 220 ms, `cubic-bezier(0.23, 1, 0.32, 1)`), crop bars (`transform: scaleX`, 220 ms). No keyframes on anything the user triggers repeatedly.
- Evaporation droplets: the one ambient loop, rate tied to the model, paused under `prefers-reduced-motion` (static droplets instead).
- Buttons: `scale(0.97)` on press, 120 ms. Hover effects gated to `(hover: hover) and (pointer: fine)`.
- Reduced motion: all transitions and animations cut to 1 ms; smooth scrolling off.

## Browser surfaces

Selection (indigo/lime), caret (indigo), focus ring (2 px lime gap + 3 px indigo), scrollbar colours, underline offsets, number-input spinners removed, tabular numerals in data.

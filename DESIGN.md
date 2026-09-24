# Design

> First written before the build from the direction contract (impeccable `new-work`, code-led, seed `3c09331c`, a degraded roll with no challengers because the roll service is outside this VM's network allowlist). Re-documented from the built world at finish; the tokens below are the ones in `src/styles/tokens.css`.

## Design read

An **Operate** tool with a demonstrative first screen, for a vegetable seller on a phone in a sunny market and for three student judges on laptops. The language is **the seasonal crop almanac**: the FAO-style crop calendar (crops down the side, twelve months across, flat colour bars), the agricultural extension poster (bold flat fields, numbered drawings, plain words) and the wall calendar in a market stall. Dials: variance 6 · motion 5 · density 5.

## World

- **The year is the grid.** On wide screens the page runs on 12 columns that *are* the twelve months; the month strip, the crop calendar and the build card all snap to it. Anything that isn't about time sits in the left margin (the "station": town, pot, headline).
- **Flat fields, no chrome.** Colour arrives as whole cells and bars, the way a printed calendar does it. No cards, no shadows used as decoration, no gradients, no glass.
- **Drawn like an extension manual.** The pot is a cross-section line drawing (inner pot, wet sand, outer pot, cloth), labelled with leader lines, drawn in SVG from the model's numbers (water level, beads of evaporation, inside thermometer).
- **Honest by pattern as well as colour.** Months that work are solid indigo; marginal months are millet gold with a dotted texture; months that don't are open with a diagonal hatch. Colour is never the only signal (WCAG 1.4.1).

## Colour (Full palette, 4 named roles + ink and ground)

| Token | Role | Value | Why it's this colour |
|---|---|---|---|
| `--lime` | Ground | `#F3F4EE` | Limewashed wall, not cream paper; cool enough to stay crisp in sunlight |
| `--ink` | Text, rules | `#12162B` | Indigo-black, the shade of Kano's dye-pit cloth |
| `--indigo` | Cooling, "works", water, primary action | `#2A3A8F` | Water and cold; Kano/Ségou indigo |
| `--tomato` | Heat, the outside air, alerts | `#C8252C` | The crop the seller is trying to save |
| `--millet` | Marginal months, highlights | `#E6B02E` | Millet and dry-season grass |
| `--leaf` | Crops that suit the cooler | `#2F7D4F` | Okra, amaranth, greens |

Contrast (checked in `tests/contrast.test.ts`): ink on lime 16.9:1 · indigo on lime 9.4:1 · tomato on lime 5.3:1 · lime on indigo 9.4:1 · ink on millet 9.6:1 · leaf on lime 5.0:1.

## Type

- **Anybody** (variable width 50–150, weight 100–900; Etcetera Type, OFL) for months, numerals and headings. Months are set condensed (they must fit twelve across a phone); temperatures are set wide and heavy. Tabular figures everywhere numbers align.
- **Atkinson Hyperlegible Next** (Braille Institute, OFL) for all reading and UI text. Chosen for legibility at small sizes, in glare and for low-vision readers, which is the actual use scene.
- Scale (rem, fixed, ratio ≈1.2): 0.8125 · 0.9375 · 1.125 · 1.35 · 1.62 · 2.25 · display clamps only on the headline numeral.
- No eyebrow labels, no tracked-mono costume labels, no italic serif.

## Space and layout

- 4 px base; steps 4 · 8 · 12 · 16 · 24 · 32 · 48 · 72.
- Wide (≥1100 px): station column (≈ 4/16) + year field (12 month columns). Medium: stacked, year field full width. Phone (≥360 px): stacked; month strip stays 12 across in condensed Anybody.
- Hairlines 1 px ink at 20% for table rules; 2 px ink for section rules.

## Components

- **Town search**: a combobox (ARIA 1.2 pattern) over the bundled towns, diacritic-insensitive; "Use my location" picks the nearest bundled town.
- **Month strip**: 12 buttons in a `radiogroup`; arrow keys, Home/End; drag to scrub.
- **Pot**: SVG cross-section with a live thermometer; `role="img"` with a text alternative that states the numbers.
- **Crop calendar**: a real `<table>`: crops × months, each cell the shelf-life gain range.
- **Build card**: a printable/shareable panel with numbered steps, dimensions and daily water.
- **Check my pot**: two number inputs → efficiency → a plain-language diagnosis.

## Motion

- One authored moment: **scrubbing the year.** Changing month retargets the pot (inside level and colour, thermometer, evaporation beads) with CSS transitions, 220 ms, `cubic-bezier(0.23, 1, 0.32, 1)`; numbers tween over the same curve.
- Evaporation beads rise from the outer wall at a rate proportional to the modelled evaporation; paused off-screen and static under `prefers-reduced-motion`.
- First load: the month strip's bars grow once (30 ms stagger). Nothing else animates on load.

## Browser surfaces

Selection, caret, focus rings (3 px indigo, 2 px offset), scrollbars and underline offsets are themed from the palette.

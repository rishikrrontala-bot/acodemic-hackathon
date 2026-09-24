# Product

<!-- impeccable:product-schema 1 -->

> Written unattended. Rishik delegated every product decision for this entry ("I'm not available to answer questions. Every decision the hackathon-win skill reserves for me is yours"), so the facts below come from his brief (CLAUDE.md, HACKATHON.md, PROMPT.md), the research in `research/`, and the chosen concept in CONCEPT.md. Anything inferred rather than stated is marked *(inferred)*.

## Platform

web

## Stack

delegated: Vite + TypeScript, no framework (CLAUDE.md's default for "static-first, no required backend, no required API key"). Pure-function domain logic tested with Vitest, Playwright e2e on the demo path, deployed to GitHub Pages with relative asset paths. Plain DOM + SVG + CSS keeps the first load small for judges and for the intended users' low-end Android phones.

## Users

1. **The vegetable seller (primary user the product is designed for).** A woman who sells tomatoes, okra, peppers and leafy greens in a hot market town (the Sahel, the Horn of Africa, north-western India, northern Mexico), without electricity for a fridge. She loses produce to heat within days. She uses a shared or entry-level Android phone with patchy data, reads some English or French, and would build a cooler from local clay pots, sand and water. Her job: decide whether a pot-in-pot cooler is worth building for her stall this season, build it right, and keep it working. *(Persona derived from FAO and MIT D-Lab sources; no real user was interviewed, and none may be quoted or invented.)*
2. **The extension worker or NGO trainer (secondary, inferred).** Runs clay-pot-cooler trainings (MIT D-Lab's Mali programme is the model) and needs a site-specific answer and a printable build card for a group.
3. **The hackathon judges (the evaluation audience).** Three students (two from Acodemic, one the founder of the SDG-5 nonprofit G.I.R.L.S.) scoring SDG impact, creativity and execution in a few minutes each, mostly from the video and the first screen.

## Product Purpose

Zeer tells a seller, for her town and month, whether a two-clay-pot evaporative cooler will keep her produce cooler, by how much, how much longer each crop will last, how to size and build it, and whether the one she built is performing. Success: she can decide and build from one screen, offline, and the numbers are honest (ranges, sources, stated limits).

## Positioning

The pot-in-pot cooler is an old, proven, no-electricity technology (Mohammed Bah Abba's Nigerian pot-in-pot; MIT D-Lab and the World Vegetable Center's field evaluations in Mali). Guidance about it exists as PDFs and one-size-fits-all rules ("works when it's hot and dry"). Zeer is the first tool, as far as the research found, that turns that rule into a **site-specific, month-by-month answer** from open climate data and psychrometric physics, sized to what she sells, and that checks her real pot against the model.

## Operating Context

- Used outdoors or in a market, on a phone, in bright sun, often offline after first load. *(inferred)*
- Materials are local: two unglazed clay pots (or bricks for a larger chamber), sand, water, a wet cloth.
- Measurements a user can actually take: two readings from a cheap thermometer (inside and outside the pot).
- Judges open it on a laptop, from a Devpost link, logged out, possibly never past the first screen.

## Capabilities and Constraints

- Static site; no account, no backend, no API key. Works offline after first visit.
- Climate: NASA POWER long-term monthly climatology for ~490 bundled towns in 76 countries, fetched by a GitHub Actions data job and committed as a snapshot.
- Physics: wet-bulb temperature from dry-bulb temperature and humidity; cooler performance as an evaporative efficiency calibrated against published field measurements; shelf life as a range using the postharvest rule that deterioration speeds up two- to threefold per 10 °C (Kader).
- Not a food-safety or medical tool: never for medicines, vaccines, milk, meat or cooked food; says so.
- Honest failure: in humid months or places the app says the cooler won't help much.
- Languages: English first; French and Spanish build cards when accurate translation can be ensured. *(inferred scope)*

## Brand Commitments

- Name: **Zeer** (the Arabic-derived name for the pot-in-pot cooler).
- Credit: a visible "Built by Rishik Rontala" and `<meta name="author" content="Rishik Rontala">`.
- Rishik's portfolio uses an Archivo / JetBrains Mono / bone-ink-terra system; **this entry must not reuse it** (CLAUDE.md: every one of his 15 entries gets its own art direction). Banned: purple/blue gradients, centered-card SaaS templates, emoji section headers, Playfair + drop shadows, generic 3D blobs, stock hero illustrations.
- AI disclosure: built with Claude Code (Anthropic) as the coding agent, directed by Rishik. The product itself uses no AI.

## Evidence on Hand

- `research/` : winner briefs, research brief, concept scoring.
- `data/towns.json` : 492 towns selected from GeoNames (script: `scripts/data/select_towns.py`).
- `data/raw/power/` : NASA POWER climatology per town (snapshot from `.github/workflows/data.yml`).
- `data/raw/sources/` : downloaded source documents (MIT D-Lab reports, USDA Handbook 66, Kader chapter, UNEP key messages) where the data job could reach them.
- **Absent and never to be fabricated:** user interviews, testimonials, adoption numbers, prices of pots in any market, measured results from anyone's own pot.

## Product Principles

1. **Tell her when it won't work.** An honest "not this month" is the most valuable output.
2. **Ranges, not fake precision.** Every predicted number carries its uncertainty and its source.
3. **Built from what's in her market.** Every instruction uses local materials and a thermometer at most.
4. **One screen, offline, no account.** The decision fits in a glance on a small phone.
5. **Show the physics, then get out of the way.** A one-line "why" beside each number; no jargon required to act.

## Accessibility & Inclusion

WCAG 2.2 AA; readable in direct sunlight (high contrast), usable at 375 px, keyboard paths, visible focus, `prefers-reduced-motion`, plain language, units in °C with °F available, no reliance on colour alone for "works / doesn't work".

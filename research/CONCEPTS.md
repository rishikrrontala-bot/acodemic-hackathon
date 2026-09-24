# Concepts: three scored against the rubric

Criteria weights are unpublished, so they are equal (⅓ each). Scores are 1–5. The research behind the scores is in [`RESEARCH-BRIEF.md`](RESEARCH-BRIEF.md). Sibling check: `bash scripts/siblings.sh` on 2026-09-23 showed **no concept claimed yet** by any of Rishik's other 14 entries; none of the three below repeats a past project (the nearest, *Shade Debt*, is about street heat and tree planting, not food).

## A · Zeer: a fridge made of two clay pots, planned for your town, month and crop

**SDG 12.3** (post-harvest loss) · **SDG 2.3** (incomes of small-scale food producers, "in particular women") · works without electricity (SDG 7 context).

- **Pitch:** A clay-pot cooler (two nested pots, wet sand between them) can hold vegetables 8 °C or more below the afternoon heat in dry weather, with no electricity. Zeer tells a vegetable seller whether it will work *in her town, this month*, how cold it will get, how much longer her tomatoes will last, how big to build it and how much water it drinks, then checks her pot against her own thermometer.
- **Person:** a woman selling tomatoes and greens in a hot, dry market town (Mopti, Kano, Kassala, Jodhpur). FAO: 66% of women's employment in sub-Saharan Africa is in agrifood systems.
- **Wow moment:** pick "Mopti · March" and a cross-section of the pot fills with water; the inside reading falls well below the afternoon heat while the tomato-life bar grows. Flip to August (the rains) and the pot barely cools, and the app says so. (Real numbers come from the model once the climate data lands; none are quoted here in advance.)
- **Why it's real:** deterministic psychrometrics (wet-bulb temperature from NASA POWER climatology), a cooling efficiency calibrated against **MIT D-Lab's field measurements from Mali**, Kader's 2–3× deterioration rule per 10 °C for shelf life (shown as a range, not a fake number). No AI, no key, works offline.
- **Riskiest unknown:** getting climate data and D-Lab's measurements into a VM whose network blocks NASA and USAID. Plan: a GitHub Actions data job fetches them and commits the snapshot (reproducible, documented).
- **Cut first if short on time:** the "check my pot" calibration mode, then French/Spanish build cards, then the world suitability map.

## B · Hours Back: what one water tap returns to one girl

**SDG 6.1** (safe drinking water) × **SDG 5.4** (unpaid care and domestic work).

- **Pitch:** Where water isn't on the premises, women and girls do most of the collecting. Hours Back turns WHO/UNICEF JMP data into one girl's year: the hours a round trip costs in her country and what they add up to.
- **Wow moment:** a clock that fills with the year's water walks.
- **Riskiest unknown:** the action is weak. The output informs a donor or a reader, not the person carrying the water. This is the "awareness dashboard" shape the research says doesn't win, and it drifts toward SDG 4 (school days lost), which Rishik reserves for a sibling.
- **Cut first:** country comparisons.

## C · Roof to Tank: size a rain tank from your roof and your rainfall

**SDG 6.1 / 6.4** (water access and efficiency) · **13.1** (resilience to drought).

- **Pitch:** Measure your roof, pick your town; a daily water-balance simulation over real rainfall says how many dry-season days a given tank covers and which size is worth buying.
- **Wow moment:** a tank filling and draining across a real year of rain.
- **Riskiest unknown:** originality. Rainwater calculators are common; *Access Rain* (HackSMU VII 2026, Best Use of AI) already did rainwater-harvesting prospecting. The roof-tracing step needs map tiles this VM can't load for testing or recording.
- **Cut first:** roof tracing (fall back to typed area).

## Scoring

| Criterion (weight) | A · Zeer | B · Hours Back | C · Roof to Tank |
|---|---|---|---|
| SDG Impact & Relevance (⅓) | **5**: one named user, a cheap intervention with published field results, directly on target 12.3's "post-harvest losses"; honest about where it fails | 3: real and significant, but the output is awareness, with no action for the person affected | 4: actionable for a household; tank cost is a real barrier the tool doesn't solve |
| Creativity & Originality (⅓) | **5**: a 1990s invention (Mohammed Bah Abba's pot-in-pot, a Rolex Award for Enterprise laureate) made site-specific with open climate data; nothing like it among the known entries or recent winners | 4: fresh as an experience; the data story itself is well known | 2: established genre; a 2026 winner already did it |
| Execution & Functionality (⅓) | 4: static, deterministic, offline-capable; risk is the data pipeline, mitigated by GitHub Actions | 4: straightforward data-viz | 4: straightforward simulation; map dependency |
| **Weighted total** | **4.67** | **3.67** | **3.33** |
| Tie-break: judge fit | Strong and true: FAO's gender data, SDG 2.3's "in particular women" | Strongest on SDG 5, weakest on action | Neutral |
| Tie-break: field differentiation | No overlap with the 5 known entries | No overlap | No overlap |

## The pick: **A · Zeer**

It wins on all three criteria or ties, and it has the property the research says places here: a specific person, one core act that visibly works, an honest "not here, not this month", and an output she can build with things from her own market.

### Pre-mortem: "it's judging day and Zeer lost. Why?"

| Failure | Prevention |
|---|---|
| Judges saw a calculator | A sensory first screen: the animated pot and the dropping reading before any form; art direction from clay, sand and field-manual drawings, not a SaaS template |
| The physics went over their heads | Every number has a one-line plain-language "why" next to it; the video shows it in 15 s |
| "Is this even accurate?" | Validation page: the model's prediction against D-Lab's measured Mali data, with the error stated; ranges instead of fake precision |
| "Where's the SDG?" | Target 12.3 with indicator 12.3.1, target 2.3 with indicator 2.3.2, named in the app footer, README and Devpost |
| It broke on a judge's phone | Static, offline-first, tested at 375 px, zero console errors, no key, no backend |
| No video | The video is a planned deliverable with its own slot |

# CONCEPT: Zeer

**A fridge made of two clay pots and wet sand, planned for your town, your month and your crop.**

*Rishik Rontala's entry for the Acodemic X G.I.R.L.S. Global SDG Hackathon. Chosen over two alternatives in [`research/CONCEPTS.md`](research/CONCEPTS.md) (4.67 vs 3.67 vs 3.33 on the equal-weighted rubric).*

## The person
A woman who sells tomatoes, okra and greens in a hot, dry market town, with no electricity for a fridge. Whatever doesn't sell by the second or third day of heat is lost. (FAO: about 13% of the world's food is lost between harvest and retail; in sub-Saharan Africa 66% of women's employment is in agrifood systems; 565 million people there had no electricity in 2023.)

## The idea
The zeer, or pot-in-pot cooler, is a small clay pot set inside a larger one with wet sand between them. As the water evaporates through the outer pot it pulls heat out of the inner one. MIT D-Lab's field work in Mali found drops of more than 8 °C in real use, **but only in hot, dry weather**. Whether it's worth building depends on *where* and *when*, and nobody tells the seller that.

**Zeer answers four questions for her, offline, in one screen:**
1. **Will it work here, this month?** Month-by-month cooling from 20-year NASA POWER climatology for her town (wet-bulb physics), with the humid months called out honestly.
2. **How cold, and how much longer will my food last?** Predicted inside temperature (day average and afternoon peak) and a shelf-life multiplier *range* per crop (Kader: deterioration speeds up 2–3× per 10 °C), plus "don't put onions in it".
3. **How do I build it?** A build card sized to the kilograms she sells: pot diameters, sand gap, litres of water per day, where to put it. Printable and shareable as an image.
4. **Is mine working?** She types two thermometer readings; Zeer computes her pot's efficiency against the expected one and says what to fix.

## Why it scores
- **SDG Impact:** Target **12.3** (halve food waste and reduce food losses, "including post-harvest losses"; indicator 12.3.1) and target **2.3** (incomes of small-scale food producers, "in particular women"; indicator 2.3.2). A $0-electricity intervention with published field results.
- **Creativity:** a 1990s invention (Mohammed Bah Abba's pot-in-pot, Rolex Award for Enterprise) made site-specific with open climate data. None of the five entries already public in this event, and none of the seven winners researched, does anything like it.
- **Execution:** static site, deterministic physics, no key, no backend, works offline; the model is checked against D-Lab's measured Mali data and the error is published.

## Wow moment (first 15 s of the video)
"Mopti, March": the pot fills, the inside reading drops, the tomato-life bar grows. "Mopti, August": the rains come, the pot barely cools, and Zeer says don't bother this month.

## Built with
Vite + TypeScript, pure-function physics with Vitest, Playwright e2e, SVG + CSS motion; NASA POWER climatology and D-Lab measurements snapshotted by a GitHub Actions data job. No AI in the product; built with Claude Code as the coding agent, directed by Rishik.

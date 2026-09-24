---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: Zeer app (index.html)

Scope: the whole single-page tool. Visitor mode: **Operate** (with a first viewport that demonstrates the mechanism for judges).
Audience/job: a vegetable seller deciding whether and how to build a clay-pot cooler for her town and season; an extension trainer; three student judges.
Action: pick town → read the year → pick month/crop → build card → check my pot.
Proof: NASA POWER climatology per town; D-Lab field measurements for calibration; Kader's Q10 rule for shelf life. No invented users, prices or results.
Constraints: static, offline-capable, 375 px, WCAG 2.2 AA, sunlight-legible, no key.
Assumptions (unattended run, Rishik delegated all decisions): mode Operate; English first; default town Mopti (D-Lab field region).
Impeccable roll ran degraded (no challengers: impeccable.style is outside the VM allowlist). Own ranked list: 1 extension field guide · 2 psychrometric chart · **3 seasonal crop almanac (assigned)** · 4 hand-painted market signage · 5 bògòlanfini · 6 feature-phone/USSD UI · 7 instrument dial and field log. Impeccable's pick would have been #1; its discipline (numbered drawings, plain words) lives inside the almanac as the build card, in the almanac's own type and colour.

## Direction contract

THESIS: The year is the interface. Zeer is an almanac for one clay fridge: twelve months across, crops down the side, the town as the station. It refuses the category default, a climate dashboard of cards and charts behind a form.

OWN-WORLD: Limewash ground #F3F4EE, indigo-black ink, flat indigo fields for months that cool, millet-gold dotted fields for marginal months, open hatched cells for months that don't, tomato red for heat. Anybody (condensed months, wide heavy numerals) + Atkinson Hyperlegible Next. Line-drawn pot cross-section with leader-line labels. No cards, no shadows, no gradients.

STORY: The visitor sees at once that two wet clay pots cool food without electricity, but only in some months; learns how many months in her town, how cold, how much longer each crop lasts; then gets a build card and a way to check her own pot.

FIRST VIEWPORT: Left station column: town combobox at top, then the headline sentence with a wide heavy numeral ("7 months a year your pot keeps food about 10° cooler"), then the pot cross-section with its thermometer. Right: the twelve-month strip, each month a column with outside-afternoon and inside bars, the current month selected; under it the first rows of the crop calendar. On phones the station stacks above the strip; the strip stays twelve across.

FORM: Seasonal crop almanac, #3 of the ordered list, seed key 3c09331c. Signature interaction: scrub the year (drag or arrow keys across the months; the pot, thermometer and crop row retarget together).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

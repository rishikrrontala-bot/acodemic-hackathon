# PROGRESS: Acodemic × G.I.R.L.S. Global SDG Hackathon

Running log for the unattended cloud build. A resumed session continues from the last unchecked phase.

## Countdown

| | |
|---|---|
| Deadline | **Sun Sep 27, 2026 · 12:45 AM EDT** (`2026-09-27T00:45:00-04:00`) |
| Hard stop for all deliverables (≥24 h buffer) | **Sat Sep 26, 2026 · 12:45 AM EDT** |
| Session start | Wed Sep 23, 2026 · 10:31 PM EDT → **74.2 h left**, ~50 h of working window |

## Phase plan (budgeted backwards, hackathon-win Phase 4 table)

| Phase | Share | Budget | Done by (ET) | Status |
|---|---|---|---|---|
| 0 Setup, countdown, tool check | fixed | 0.5 h | Wed 11:00 PM | ✅ |
| 1–2 Research (winners, brief) | fixed | 2 h | Thu 1:00 AM | ✅ |
| 3 Concept (3 scored, pick, CONCEPT.md) | fixed | 0.5 h | Thu 1:30 AM | ✅ Zeer |
| 4 Design direction (PRODUCT.md, DESIGN.md) | fixed | 1 h | Thu 2:30 AM | ✅ |
| 5 Core build: wow moment → demo path → rest, tests, CI, deploy | ~50% | 23 h | Fri Sep 25 1:30 AM | ⏳ started |
| 6 Quality passes (critique → audit → polish) | buffer | — | Fri 5:00 AM | ☐ |
| 7 Demo video (1:30–3:00, captioned) | ~20% | 9 h | Fri 10:30 AM | ☐ |
| 8 Submission kit (docs, DEVPOST.md, gallery, checklist) | ~15% | 7 h | Fri 5:30 PM | ☐ |
| 9 Ship: merge to main, verify deploy, HANDOFF.md | buffer | 7 h | **Sat Sep 26 12:45 AM** | ☐ |

## Environment findings (Phase 0)

- Node v22.22.2, npm 10.9.7. Playwright Chromium at `/opt/pw-browsers/chromium-1194`.
- ffmpeg: none on PATH; installed `imageio-ffmpeg` (ffmpeg 7.0.2 with libx264 + aac) and symlinked to `/usr/local/bin/ffmpeg`. Re-run `pip install imageio-ffmpeg && ln -sf $(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") /usr/local/bin/ffmpeg` on a fresh VM.
- **n8n:** `N8N_BASE_URL` is unset in this environment, so there is no API access. Any workflow ships as an importable `n8n/*.json`.
- **Network is allowlisted, not Full.** Reachable: github.com, api.github.com, raw.githubusercontent.com, registry.npmjs.org, pypi.org, fonts.googleapis.com, storage.googleapis.com. **Blocked:** devpost.com (incl. the event page), rishikrrontala-bot.github.io (the live site), huggingface.co, web.archive.org, UN/World Bank/OWID/NASA/OSM hosts, YouTube, jsDelivr/unpkg/cdnjs. Consequences:
  - Devpost facts and winners are verified through WebSearch (index snippets of the live pages) plus the winners' GitHub repos; each brief says so.
  - Datasets come from GitHub-hosted mirrors (e.g. `owid/*` repos) and are snapshotted into the repo at build time.
  - The live URL can't be loaded from this VM: the deploy is verified through the GitHub Actions/Pages API, and Playwright runs against `vite preview` of the identical `dist/`.
- Design skills: `impeccable`, `emil-design-skills:animate`, taste-skill and `hypersite` are not loaded in this session → cloned the fallbacks into `/tmp/skills` (impeccable, emil-skills, taste-skill) and read their SKILL.md files directly. `ui-demo`, `dataviz` and `make-interfaces-feel-better` are loaded.

## Log

- **Wed 10:31 PM ET** (74.2 h left): session start, read CLAUDE.md, HACKATHON.md, hackathon-win skill + references + templates. Tool check done (above).
- **Wed 10:45 PM ET** (74 h left): research done. 7 winner briefs (HackWinnerDB + GitHub repos; Devpost blocked), RESEARCH-BRIEF.md, CONCEPTS.md → **Zeer** (4.67 vs 3.67 vs 3.33). CONCEPT.md pushed.
- **Wed 10:50 PM ET**: data job `.github/workflows/data.yml` pushed: fetches NASA POWER climatology for the 492 towns in `data/towns.json` + source PDFs/datasets listed in `data/sources.txt`, commits them to `data/raw/` on this branch (commit message "Data snapshot …"). `git pull` after it finishes.
- **Wed 10:53 PM ET**: impeccable context + concept-seed ran (degraded roll, no challengers; seed 3c09331c, assigned #3 = seasonal crop almanac). PRODUCT.md, DESIGN.md, `.impeccable/surfaces/index-html.md` (direction contract) written. Vite+TS scaffold, `src/domain/psychro.ts` + 15 passing tests.

## ▶ RESUME HERE (next session starts at this list)

1. `git pull` — check `data/raw/power/*.json` (expect 492) and `data/raw/sources/` arrived from the data job (Actions run "Data snapshot"). If sources are missing (404s), edit URLs in `data/sources.txt` and push to re-run (the job is incremental).
2. Write `scripts/data/build_climate.py`: raw POWER JSON → compact `public/data/climate.json` (per town: T2M, T2M_MAX, T2M_MIN, T2MDEW, RH2M, QV2M, PS, PRECTOTCORR × 12 months) + record the climatology period from the response header.
3. `src/domain/cooler.ts`: per month W from QV2M; wet bulb at T2M (day mean) and T2M_MAX (afternoon) via `psychro.wetBulb` with PS; inside = T − ε(T − Twb), ε as a range calibrated on MIT D-Lab Mali measurements if the dataset arrived (else literature range, stated); classify month: works (afternoon drop ≥ 8 °C and T_max ≥ 25), some help (≥ 5), too humid, cool month. Tests.
4. `src/domain/shelf.ts`: Kader Q10 2–3 per 10 °C → multiplier range from day-mean temps; crop table (tomato, okra, leafy greens, peppers, eggplant, carrot, cabbage, cucumber, mango; NOT onions/garlic/grain/milk/meat/medicine) with sources checked against USDA HB66 text in `data/raw/sources/usda-hb66.txt`.
5. `src/domain/sizing.ts` (pot diameters from kg, sand gap, water/day from energy balance h·A·ΔT/L, range h 5–10 W/m²K) and `check.ts` (measured ε → diagnosis).
6. UI per `.impeccable/surfaces/index-html.md` + DESIGN.md: station column (town combobox, headline, pot SVG), 12-month strip (scrub), crop calendar table, build card, check-my-pot, world map (d3-geo + world-atlas), EN/FR/ES, °C/°F, offline SW, "Built by Rishik Rontala".
7. Then phases 6–9 of the plan above (quality passes, video, submission kit, merge to main, HANDOFF.md).

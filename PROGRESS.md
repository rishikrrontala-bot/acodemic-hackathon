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

- **Wed 11:00 PM ET** (73.7 h left): **SAVE POINT** (Rishik asked for everything saved by 11:20 PM ET). Everything below is pushed to `claude/admiring-heisenberg-4lkdwi`.
  - Data snapshot landed: `data/raw/power/` (492 towns), `data/raw/sources/` (D-Lab exec summary + clay pot report + training impact study, USDA HB66, UNEP key messages, POWER docs, Wikipedia, DSpace pages).
  - Finding: NASA POWER climatology `T2M_MAX`/`T2M_MIN` are monthly **extremes**, and `T2MWET` is only (T2M+T2MDEW)/2. Zeer computes its own thermodynamic wet bulb and gets the typical afternoon from `T2M_RANGE` (second data run fetches it into `data/raw/power_range/`).
  - Calibration: `scripts/data/calibrate.ts` → `src/data/calibration.json`: ε = 0.319 / 0.455 / 0.543, reproducing D-Lab's measured 4.7 / 6.7 / 8 °C average decreases (Mopti + Bamako study months).
  - Domain: `src/domain/{psychro,cooler,crops,shelf}.ts`, 42 Vitest tests passing. Verdicts on day-average drop: works ≥ 5 °C, some ≥ 2.5 °C, mild if typical max < 25 °C.

- **Wed 11:02 PM ET**: `src/domain/sizing.ts` + `src/domain/check.ts` done (53 tests passing). **Session stopped here at Rishik's request; everything pushed.** Resume step 3 below is complete; start at step 1, then step 4.

- **Thu 2:30 PM ET** (58.3 h left): resumed. Rebuilt climate with `T2M_RANGE` (typical afternoon), model sanity-checked on 16 real towns (Mopti works Nov–May, fails in the Aug rains; Lagos/Jakarta never work).
- **Thu ~2:40 PM ET**: crops rebuilt from USDA HB66 (storage groups, lowest safe temps, per-crop Q10 from respiration table 1). Town search + nearest. EN/FR/ES copy with verified facts (565 M without power in SSA 2023; 66 %/71 % of women's employment in agrifood, SSA/S. Asia).
- **Thu ~2:45 PM ET**: full UI built (station + pot, year dumbbell strip, crop calendar, build card with print/PNG, check-my-pot, lazy world map, about, footer), service worker (offline), manifest + icons. 69 unit tests; 29 Playwright e2e (desktop + 375 px phone, axe WCAG 2.2 AA, offline) all passing. CI (`ci.yml`) and live verification (`verify-live.yml`, run after every Pages deploy from a GitHub runner) pushed.

## ▶ RESUME HERE (next session starts at this list)

1. Check Actions: CI green, Pages deploy green, the "verify" job (live e2e + 4G LCP) green. Fix anything red.
2. Quality passes: impeccable critique → audit → polish (read `/tmp/skills/impeccable/.claude/skills/impeccable/reference/{critique,audit,polish}.md`), fix every material finding, rerun tests.
3. Demo video 1:30–3:00 (`submission/video/demo.mp4`), captions burned in + `.srt`; `submission/VIDEO-SCRIPT.md`.
4. Docs + kit: README (hero, live link, video, SDG alignment, Mermaid), docs/ARCHITECTURE.md, docs/LIMITATIONS.md, docs/EXPLAIN-IT.md, submission/DEVPOST.md, gallery ≥5 PNG 1500×1000 + thumbnail + og.png, CHECKLIST.md, LICENSE.
5. Merge to main, confirm live verify job on main, HANDOFF.md.

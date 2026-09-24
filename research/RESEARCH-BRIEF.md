# Research brief: Acodemic X G.I.R.L.S. Global SDG Hackathon

*Written Wed Sep 23, 2026, ~11 PM ET, 74 h before the deadline. Evidence: 7 winner briefs in [`winners/`](winners/README.md), five competing entries in this event, and the event page as seen through search-index snippets (devpost.com is blocked from this VM; see [`winners/README.md`](winners/README.md) for how each fact was checked).*

## The event, as far as it can be verified

| Fact | Value | How verified |
|---|---|---|
| Deadline | Sat Sep 26, 2026, 11:45 PM CDT = **Sun Sep 27, 12:45 AM EDT** | Search snippet of the event page ("September 26, 2026 at 11:45 p.m. CDT"); matches HACKATHON.md |
| Theme | "Create a project aligned to any SDG. Be creative and make it count!" / "What can you build that matters?", looking for projects that make people say *"This could actually change something."* | Event page title + snippet |
| Criteria | **SDG Impact & Relevance** ("how clearly a project addresses a real problem tied to a Sustainable Development Goal… the significance of the issue, the thoughtfulness of the approach, and the potential for meaningful impact"); **Creativity & Originality** ("how unique the concept is and whether the project tackles its chosen SDG in a fresh and different way from existing solutions"); **Execution & Functionality** ("how complete and functional the build is, the quality of the user experience, and how effectively the idea was brought to life") | Event page snippets |
| Weights | Unpublished, so treat as equal | — |
| Stated bias | **"Technical complexity is optional. A simple, well-thought-out idea can outperform a highly technical one."** | Event page snippet |
| Judges | Hrudhai Lothumalla (Acodemic), Arnav Sayooj (Acodemic), **Divyansha Nashine** (founder of G.I.R.L.S.) | Event page snippet |
| Beginner-friendly, open globally | Yes | Event page snippet |
| Prizes ($20/$10/$5), eligibility (13+, students), "≥3 screenshots", "video 1–5 min optional" | Not re-verifiable from here | Kept from HACKATHON.md (read live 2026-09-23 by Rishik's setup) |

## The judges

- **Divyansha Nashine** founded G.I.R.L.S. (Generation of Innovators, Researchers, and Leaders in STEM), a youth-led nonprofit "dedicated to advancing SDG 5: Gender Equality" that reports reaching 16,000+ girls in 30 US states and 17 countries. She is a 2025 Millennium Fellow (UPenn); her profiles emphasise education access, ethical technology and women's health. ([Millennium Fellows](https://www.millenniumfellows.org/fellow/2025/upenn/divyansha-nashine), [G.I.R.L.S. founders](https://www.inspiregirls.net/founders))
- **Hrudhai Lothumalla** and **Arnav Sayooj** run Acodemic, a student coding organisation. Lothumalla is a high-school competitive CS student (BPA national champion in Cybersecurity/Digital Forensics, per [Frisco ISD](https://www.friscoisd.org/article/2663137)).

**Visible bias:** three student judges, one of whom runs an SDG-5 organisation. Expect them to reward (a) a problem a teenager instantly understands, (b) a person at the centre, especially a woman or girl, (c) something that *visibly works* in one click, and (d) originality relative to the obvious SDG ideas they will see many times.

## What the field looks like already

Five public repos are already entered: a girls-in-CS gap finder (SDG 4/5), a leftover-meal planner (SDG 12.3, household), a carbon-footprint tracker (SDG 13), a crowdsourced safety map (SDG 5/11/16) and a campus navigator. **The obvious SDG ideas are taken.** Creativity & Originality will be scored against exactly these.

## Problem shape that keeps winning

A **specific person with a specific daily decision**, framed by one sharp sentence:
- *HerRoute AI* (1st, Girls In STEM Global): a woman choosing a route tonight.
- *AfriGen* (1st, Girls in STEM AI for Social Good): "African ML models are trained on the wrong data."
- *FoodBridge* (UN & FAO problem winner): a family planning a week of groceries on a budget.
- *Coire* (Grand Prize, Climate Change-Makers): neighbours when the network is down.

Institutional dashboards and awareness-only visualisations are absent from the winners.

## Demo shape that keeps winning

One core act, visible in a glance, on real data:
- a deterministic score explained in plain words (HerRoute),
- a number that proves grounding in official data (AfriGen's fidelity score),
- a sensory response (Dancing Queens: movement becomes music and light),
- the product working under the user's real constraint (Coire offline; MELMII on-device).

## Scope ceiling

Winners at these student events ranged from a ~3-commit plain-JS site (Dancing Queens, 2nd overall) to a ~107-commit Next.js platform (AfriGen). The ceiling is not code volume: **one complete, polished core loop plus one supporting feature** placed consistently. ResQ placed 3rd with scope that was largely designed rather than built; we should beat that bar on honesty, not copy it.

## What winners consistently skipped

- Test suites, CI, architecture writing (invisible to judges; we still do them cheaply, per Rishik's standard).
- Accounts and logins, except HerRoute, where they added cold-start risk.
- READMEs: MELMII (1st at GNEC) shipped a boilerplate README; Dancing Queens had none. The **demo** carries the score. We still write one, because "Execution & Functionality" is scored and the repo is evidence.

## What this means for the concept

1. **Stay out of SDG 3 and 4** (siblings) and out of the five lanes already entered here. Rishik's suggested lane is SDG 2/6/7/11/12/13/14/15.
2. **Put a woman at the centre where it is true, not decorative.** G.I.R.L.S. is an SDG-5 organisation. An honest gender dimension is a scoring advantage; a bolted-on one is a liability.
3. **End in an action a person can take this week**, sized to them, grounded in an official dataset (FAO/UN/NASA-grade), with the limits stated.
4. **Work under the user's real constraints**: offline, no account, no electricity if the problem allows.
5. **A sensory wow in the first 15 seconds**, then the plain-language "why".
6. Simple beats complex *per the judges' own words*, so the sophistication should be in correctness and care, not in visible machinery.

## Rubric (reverse-engineered)

| Criterion | Weight | What a 5 looks like here |
|---|---|---|
| SDG Impact & Relevance | 1/3 | Named goal, target **and indicator**; a real, significant problem with sourced numbers; a specific user; an action that plausibly moves the indicator; honest limits |
| Creativity & Originality | 1/3 | Not a tracker, chatbot, map of reports or dashboard; a surprising angle on the SDG that none of the five known entries takes |
| Execution & Functionality | 1/3 | Loads in one click, works on a phone, no errors; the core loop is complete and polished; the output is real and checkable |

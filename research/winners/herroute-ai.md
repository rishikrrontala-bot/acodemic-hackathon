# Winner brief: HerRoute AI

**Hackathon:** Girls In STEM Global Hackathon, 2026 (364 participants) · **Prize won:** 1st Place Overall, Global Impact Champion; Best Artificial Intelligence
**Submission URL:** https://devpost.com/software/herroute-ai · **Repo:** https://github.com/leenfotoom/HerRoute-AI · **Demo video:** https://www.youtube.com/embed/asdYWRuG_Ok (length unknown)
**Verified:** page loaded ☐ (devpost.com blocked on this VM) · prize stated on page ☑ via [HackWinnerDB record](https://github.com/notsointresting/hackwinnerdb/blob/main/data/entries/herroute-ai-girls-in-stem-global-hackathon.yaml), auto-imported from the event's winner gallery; single-event entry · video played ☐ · repo opened ☑

The event's own page (search-index snippet of https://girlsinstemhackathon.devpost.com/) describes the Global Impact Champion award as going to "the project that best combines innovation, technical excellence, STEM application, and real-world impact".

## Pitch, verbatim
> Devpost tagline: "AI-powered route insights that help women choose safer, more informed journeys."
> README: "HerRoute AI is a bilingual route-comparison application that combines worldwide mapping, current location, real routing, deterministic route-condition scoring, community reports, weather context, and Groq-powered explanations."

## The wow moment
Inferred from the README (video unplayable here): two real routes side by side with a deterministic condition score, then a plain-language explanation of *why* one is safer. The "why" is the lean-forward moment.

## Demo teardown
- Length: unknown
- First 15 seconds show: not verifiable
- Narrated? Captioned? Live or recorded?: not verifiable
- Real data or hardcoded?: real. Geoapify routing, live weather, user reports stored in PostgreSQL.

## Scope reality
- Features actually shown working: route comparison, scoring, community reports, weather context, LLM explanation, accounts with verified email and password reset
- Features only described: not determinable without the video
- Repo commit window: 1 commit visible (squashed upload), so the build window can't be read from history

## Stack
Flask, PostgreSQL (SQLAlchemy + Alembic), Redis, Groq LLM, Resend email, Sentry, Docker on Render. The stack is production-grade for a student hackathon, but the story is the *women's-safety framing*, not the stack.

## Submission page shape
- Images: not verifiable (gallery image exists per the record)
- Sections present: not verifiable
- Led with: the tagline's promise, "safer, more informed journeys"

## Why this won (one sentence)
A women-centred problem every judge at a girls-in-STEM event feels personally, solved with real routing data and a deterministic score an LLM only *explains*, not decides.

## Transferable to us
- **Copy:** frame the user as a specific woman with a specific daily decision; make the core score deterministic and explainable; real, live data.
- **Don't copy:** the safety-routing lane. It is crowded (SafeRoute is already entered in *this* event) and it sits in SDG 5/11/16, not our lane. A backend with accounts adds cold-start risk for a judge's first click.

# Winner brief: AfriGen

**Hackathon:** Girls in STEM: AI for Social Good Hackathon, 2026 (207 participants; middle- and high-school students) · **Prize won:** 1st place Overall
**Submission URL:** https://devpost.com/software/afrigen · **Repo:** https://github.com/Valentinetemi/afrigen-solo · **Demo video:** https://www.youtube.com/embed/nggaI87IDts (length unknown)
**Verified:** page loaded ☐ (devpost.com blocked) · prize stated on page ☑ via [HackWinnerDB record](https://github.com/notsointresting/hackwinnerdb/blob/main/data/entries/afrigen-girls-in-stem-ai-for-social-good-hackathon.yaml), single-event entry · video played ☐ · repo opened ☑

## Pitch, verbatim
> Devpost tagline: "African ML models are trained on the wrong data. AfriGen fixes that - an AI-powered platform to generate, gove[rn and validate…]"
> README: "AfriGen is a synthetic data infrastructure platform for African ML engineers, designed to generate, govern, and validate high-fidelity datasets grounded in real-world statistics."

## The wow moment
Per the README: WHO and World Bank statistics go in, a validated synthetic dataset comes out with a **fidelity score** that says how closely it matches the real distribution. A number that proves the output is grounded in reality.

## Demo teardown
- Length / first 15 s / narration: not verifiable (video unplayable here)
- Real data or hardcoded?: real. WHO Global Health Observatory and World Bank Open Data APIs.

## Scope reality
- Features actually shown working: generation, a two-layer fidelity score (80% model evaluation + 20% completeness check), governance cataloguing via OpenMetadata
- Live demo: https://afrigen-gtht.onrender.com (free tier, 30–60 s cold start per the README)
- Repo commit window: ~107 commits, so sustained real work

## Stack
Next.js 14, TypeScript, Tailwind, Gemini, OpenMetadata REST API, Docker.

## Submission page shape
Not verifiable. Tagline leads with a provocative problem claim ("trained on the wrong data").

## Why this won (one sentence)
A sharp, contrarian problem sentence plus visible grounding in real public datasets (WHO, World Bank), with a score that makes "grounded" checkable.

## Transferable to us
- **Copy:** open with a one-line problem that makes a judge say "huh, true"; pull from authoritative open datasets and *show* the grounding; a number that measures quality.
- **Don't copy:** the infrastructure-for-engineers audience. Judges here want impact on a person, and our lane excludes health data.

# Winner briefs: how they were found and how far each is verified

**No prior edition exists.** Acodemic X G.I.R.L.S. is a first-time event (no earlier Devpost slug, no results for "Acodemic hackathon" winners). The organizer G.I.R.L.S. ("Generation of Innovators, Researchers, and Leaders in STEM", founded by judge Divyansha Nashine) has no Devpost hackathon history we could find either. So, per `hackathon-win/references/finding-winners.md`, the evidence comes from **same-domain events in the last 12 months**: girls-in-STEM hackathons and SDG/UN-themed youth hackathons, all 2026.

## The sourcing constraint, stated plainly

This cloud VM's egress allowlist blocks `devpost.com` (and YouTube, where the demo videos live). So no brief below could load its Devpost page or play its video directly. Each winner was verified through two independent routes instead:

1. **The award record.** [HackWinnerDB](https://github.com/notsointresting/hackwinnerdb) (CC BY 4.0) auto-imports winners from each event's `project-gallery?filter=winner` page. Each entry names the Devpost URL it came from. HackWinnerDB marks these imports `verification: unverified` until a maintainer checks them, and we found one failure mode in it: a project entered in several events gets *all* of its awards copied onto every event (e.g. *Umbra City–Paris*, *Sustain-a-thon*, *Arbiter*). **Every winner kept below has exactly one event entry**, so its award can't have leaked in from another event.
2. **The project itself.** Each winner's GitHub repo was opened and read (README, structure, commit count) through `github.com`, which the VM can reach. Where a web-search index snippet of the live Devpost page also states the prize, that is noted.

Video checks are marked ☐ everywhere: the videos exist (YouTube IDs are in the records) but couldn't be played from this VM.

| # | Project | Event (2026) | Award | Award source | Repo opened |
|---|---|---|---|---|---|
| 1 | [HerRoute AI](herroute-ai.md) | Girls In STEM Global Hackathon (364 entrants) | 1st Place Overall, Global Impact Champion | HackWinnerDB + event page snippet describing the award | ✅ |
| 2 | [AfriGen](afrigen.md) | Girls in STEM: AI for Social Good (207) | 1st place Overall | HackWinnerDB | ✅ |
| 3 | [Dancing Queens](dancing-queens.md) | Girls in STEM: AI for Social Good (207) | 2nd place Overall + Most Creative Idea | HackWinnerDB | ✅ (no README) |
| 4 | [MELMII](melmii.md) | GNEC Hackathon 2026 Spring (840) | 1st Place Cash Prize + GNEC internship | HackWinnerDB | ✅ |
| 5 | [Coire](coire.md) | The Climate Change-Makers Challenge 2026 (279) | Grand Prize | HackWinnerDB **+ search snippet of the Devpost page** | ✅ |
| 6 | [FoodBridge](food-bridge.md) | George Hacks × United Nations "Reboot the Earth" (121) | United Nations & FAO Problem Statement Winner | HackWinnerDB + event page snippet | ✅ |
| 7 | [ResQ](resq.md) | Girls in STEM: AI for Social Good (207) | 3rd place Overall + Best Beginner Project | HackWinnerDB | ✅ |

Also read, not briefed: the Devpost-indexed winner *ClimateSnap* (MapleHacks, "Winner of Best Climate Action Hack presented by Mind Your Plastic", search snippet of https://devpost.com/software/climatesnap); its date couldn't be established, so it is excluded from the pattern analysis.

## The competition in *this* event (public repos, read 2026-09-23)

These are other entrants, not winners. Knowing them is how Creativity & Originality gets scored against the actual field.

| Entry | SDG | Shape |
|---|---|---|
| [Missing Seats](https://github.com/sharonbasovich/missing-seats) | 4.5, 5.b | Girls missing from US high-school CS classes, per school (CRDC data) |
| [Use First](https://github.com/verycoololiver/use-first) | 12.3 | Leftover-meal planner, household food waste |
| [GreenStep](https://github.com/tanupriyasingh1/hackathon) | 13.3 | Daily carbon-footprint habit tracker |
| [SafeRoute](https://github.com/zvracodes/SafeRoute) | 5, 11, 16 | Crowdsourced safety map |
| [Mira](https://github.com/akaheem/Mira) | 4, 5, 10, 11 | Campus support navigator |

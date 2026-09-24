# Winner brief: FoodBridge (team SkyHigh)

**Hackathon:** George Hacks × United Nations "Reboot the Earth" Hackathon, 2026 (121 participants; George Washington University) · **Prize won:** United Nations & FAO Problem Statement Winner
**Submission URL:** https://devpost.com/software/food-bridge-isqzu0 · **Repo:** https://github.com/damianleng/food-bridge · **Demo video:** none in the record
**Verified:** page loaded ☐ (devpost.com blocked) · prize stated on page ☑ via [HackWinnerDB record](https://github.com/notsointresting/hackwinnerdb/blob/main/data/entries/food-bridge-skyhigh-george-hacks-x-united-nations-reboot-the-earth-hackathon.yaml), single-event entry · video played ☐ · repo opened ☑

The event page (search-index snippet of https://george-hacks-united-nations.devpost.com/) confirms the format: "$3,000 in prizes across 3 problem statements from the UN and other partners", plus spot prizes. This is the only winner here judged partly by a UN agency (FAO).

## Pitch, verbatim
> Devpost tagline: "Eat well, spend smart — personalized nutrition for every community."
> README: "A nutrition-aware meal planning app for diverse US communities. FoodBridge takes your health profile, dietary preferences, and food selections, then generates a personalized 7-day meal plan and itemized grocery list with real pricing — powered by the USDA FoodData Central database and Claude AI."

## The wow moment
A plan you could shop from today: an itemised grocery list with real prices, not a generic recommendation.

## Demo teardown
No video in the record. Real data: USDA FoodData Central (770K+ items) plus live price lookup.

## Scope reality
- ~20 commits; FastAPI + PostgreSQL backend, React/Vite client, Docker
- No live link in the README

## Stack
React 19 + Vite, FastAPI, LangChain with Claude Haiku 4.5, PostgreSQL loaded with USDA FDC.

## Why this won (one sentence)
The FAO judges rewarded an **actionable, costed output grounded in an authoritative public dataset**, which is exactly the SDG-2 "potential for meaningful impact" test.

## Transferable to us
- **Copy:** end in something a person can act on today (a list, a plan, a build card), costed or quantified, grounded in an official dataset a UN judge recognises.
- **Don't copy:** a server + database + LLM dependency for the core path; a cold judge visit must not fail.

# Winner brief: Coire

**Hackathon:** The Climate Change-Makers Challenge: 2026 (279 participants; "youth from across the world", three days) · **Prize won:** Grand Prize (CAD $1000)
**Submission URL:** https://devpost.com/software/coire · **Repo:** https://github.com/vnmrsharma/Coir · **Demo video:** not in the record
**Verified:** page loaded ☐ (devpost.com blocked) · prize stated on page ☑ **two ways**: a web-search index snippet of the Devpost page ("won the Grand Prize (CAD $1000) at The Climate Change-Makers Challenge: 2026 — an offline disaster-response app built in Flutter with Bluetooth-based peer-to-peer communication") and the [HackWinnerDB record](https://github.com/notsointresting/hackwinnerdb/blob/main/data/entries/coire-the-climate-change-makers-challenge-2026.yaml) · video played ☐ · repo opened ☑

## Pitch, verbatim
> README: "Coire is a community-first emergency resilience app built to help neighbours coordinate quickly, share verified capabilities, and stay connected during disruptions. The app combines locality mapping, disaster readiness planning, Bluetooth community messaging, and an on-device assistant to support real-world response and preparedness workflows."

## The wow moment
Messages hopping phone to phone over Bluetooth with **no internet**: the tool still works at the exact moment the network fails.

## Demo teardown
- Video: none recorded in HackWinnerDB
- Real data or hardcoded?: OpenStreetMap tiles are real; community/resource data looks like MVP sample data

## Scope reality
- Features shown: locality map (flutter_map/OSM), readiness planning, BLE peer messaging, on-device assistant
- Repo commit window: 1 commit visible (squashed), so not readable

## Stack
Flutter (Material 3), flutter_map + OpenStreetMap, flutter_blue_plus / flutter_ble_peripheral. **Offline-first is the story.**

## Submission page shape
Not verifiable.

## Why this won (one sentence)
It designed for the real conditions of the people it serves (no network during a disaster) and made that constraint the headline feature.

## Transferable to us
- **Copy:** design for the user's real constraints (no connectivity, no electricity, no money) and turn the constraint into the feature; work offline.
- **Don't copy:** a native app a judge must install. A URL that works in one click beats an APK.

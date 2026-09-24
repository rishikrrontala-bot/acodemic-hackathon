# Zeer: demo video script

**Target length:** about 2:05 (the event asks for 1:30–3:00). **Format:** 1920×1080, H.264, captions burned in plus `submission/video/demo.srt`.
**File:** `submission/video/demo.mp4` is recorded from the live app by `scripts/video/record.mjs` and narrated with a synthesized voice (Kokoro TTS, voice `af_heart`), which the end card discloses.

**Rishik: re-record the voiceover in your own voice if you have 15 minutes.** A real voice beats any synthetic one. Use the "Your voice" column (first person); the "Synth" column is the neutral third-person version already in the file. Keep the timing. To replace the audio, run `bash scripts/video/mux.sh your-voice.wav` (see bottom).

Every number below comes from `npx tsx scripts/stats.ts` or the app itself.

| Time | On screen | Your voice (record this) | Synth narration (in demo.mp4) |
|---|---|---|---|
| 0:00–0:08 | Zeer opens on Mopti, March. The pot drawing: air 39°, inside about 29°; big "7°". | "This is two clay pots and some wet sand. In Mopti, Mali, in March, it keeps vegetables about seven degrees cooler than the air, with no electricity." | Same, unchanged. |
| 0:08–0:15 | Cursor drags across the year strip to August; the verdict flips to "Too humid", the big number drops to 2°. | "Drag to August. The rains come, and the same pot barely cools. Zeer tells you that too." | Same. |
| 0:15–0:30 | Headline and the "Why it matters" facts. | "About thirteen percent of the world's food is lost between harvest and the market, and fruit and vegetables lose the most. In sub-Saharan Africa, five hundred and sixty-five million people have no electricity, so a fridge isn't an option. And many of the people selling vegetables in the heat are women." | Same. |
| 0:30–0:42 | Back to the top; the town field. | "The clay-pot cooler already exists. What nobody tells the seller is whether it will work in her town, this month. So I built Zeer: four hundred and ninety-two towns, three languages, and it works offline." | "The clay-pot cooler already exists. What nobody tells the seller is whether it will work in her town, this month. Zeer does, for four hundred and ninety-two towns, in three languages, offline." |
| 0:42–0:52 | Type "Kano", pick it. Headline: works 3 months, February–April. | "Here's Kano, in Nigeria. It works from February to April." | Same. |
| 0:52–1:05 | Crop calendar: tomatoes, March; set "3 days"; "about 4–5 days"; the red "Never put these in the pot" box. | "In March, tomatoes last about one and a half times as long. If mine last three days on the table, that's four or five in the pot. And onions, milk and medicines never go in. Zeer says so every time." | "In March, tomatoes last about one and a half times as long. If they last three days on the table, that's four or five in the pot. Onions, milk and medicines never go in, and Zeer says so every time." |
| 1:05–1:15 | Build card: slide capacity, numbered steps, "0.8–1.7 litres". | "It sizes the pot from how much you store, and tells you how much water to add each day, following MIT D-Lab's build guide." | Same, with "MIT D-Lab's". |
| 1:15–1:27 | "Is my pot working?": type 37 and 29, check; the diagnosis and the efficiency scale. | "Already built one? Read two thermometers. Zeer compares your pot with the ones D-Lab measured in Mali, and tells you what to fix." | Same. |
| 1:27–1:43 | "How Zeer knows" and the validation table. | "Under the hood it's physics, not AI: twenty years of NASA climate data, the wet-bulb temperature from engineering equations, and a pot efficiency calibrated on D-Lab's field measurements. Then I checked it against measurements it wasn't tuned on. On humid days Zeer predicts one point six degrees of cooling; D-Lab measured one point eight." | "Under the hood it's physics, not AI: twenty years of NASA climate data, the wet-bulb temperature from engineering equations, and a pot efficiency calibrated on D-Lab's field measurements. Checked against measurements it wasn't tuned on: on humid days Zeer predicts one point six degrees of cooling; D-Lab measured one point eight." |
| 1:43–1:55 | The world map stepping through the months. | "Here's every town, month by month. Only a hundred and sixty-six of the four hundred and ninety-two get even one month where the pot works well. That's the point: it's great in dry heat and useless in humid heat, and Zeer tells you which one you have." | Same. |
| 1:55–2:05 | Switch to French, then the footer. End card. | "No account, no key, works on a cheap phone. It hasn't been tested with real sellers yet; that's next. Zeer, for SDG targets twelve point three and two point three. Built by Rishik Rontala." | "No account, no key, works on a cheap phone. It hasn't been tested with real sellers yet; that's next. Zeer, for SDG targets twelve point three and two point three. Built by Rishik Rontala." |

## Shot list (what the recorder does)

1. Load `#t=2453348&m=3&c=tomato&l=en&u=C` (Mopti, March). Hold on the station column and the pot.
2. Drag across the month strip from March to August; hold.
3. Scroll to "Why it matters"; hold; scroll back to the top.
4. Type "Kano" in the town field, pick Kano; hold on the headline.
5. Click March; scroll to the crop calendar; click Tomatoes; set 3 days; hold on the red box.
6. Scroll to "Build it"; move the capacity slider; hold on the steps.
7. "Is my pot working?": type 37 and 29, click; hold on the result.
8. Scroll to "How Zeer knows"; hold on the validation table.
9. Scroll to the map; step the months (Jan → Dec) so the map changes; hold.
10. Scroll to the top; click FR; hold; scroll to the footer; end card.

## Replacing the narration with your own voice

1. Record the "Your voice" column in one take or line by line (phone voice memo is fine), roughly on the timings above.
2. Save it as a WAV or M4A in the repo root, for example `my-voice.m4a`.
3. Run `bash scripts/video/mux.sh my-voice.m4a`. It writes `submission/video/demo-own-voice.mp4` with your audio instead of the synthetic one and keeps the captions.

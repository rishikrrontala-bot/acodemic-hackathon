# Explain it: Rishik's defence guide to Zeer

Read this before judging or a live Q&A. Every part of Zeer is here in plain words, then the questions judges are most likely to ask, with honest answers.

## The one-sentence version
Zeer tells a vegetable seller in a hot, dry town, with no electricity, whether a fridge made of two clay pots and wet sand will keep her produce cooler **in her town, this month**, how much cooler, how much longer her crops will last, and how to build and check it.

## The problem, in three facts (all sourced in the app)
1. About 13% of the world's food is lost between harvest and the shop (FAO), and losses are higher for fruit and vegetables.
2. 565 million people in sub-Saharan Africa had no electricity in 2023 (Tracking SDG7 2025), so a fridge isn't an option.
3. In sub-Saharan Africa 66% of women's employment is in agrifood systems, and in southern Asia 71% (FAO 2023). Many of the people selling vegetables in the heat are women.

## How the pot works
A small clay pot sits inside a bigger unglazed one, with wet sand between them and a damp cloth on top. Water seeps through the outer pot and evaporates; evaporation takes heat with it (the same reason you feel cold getting out of a pool). So the inside gets cooler than the air, without electricity. It was popularised in northern Nigeria in the 1990s by Mohammed Bah Abba (Rolex Award for Enterprise), and MIT D-Lab tested it in Mali in 2017.

**The catch:** evaporation only cools a lot when the air is dry. In humid air, water barely evaporates and the pot barely cools. So the same pot can be great in March and useless in August in the same town. Nobody tells the seller that. Zeer does.

## How Zeer works, part by part

**1. Climate for her town.** For 492 towns in 76 hot countries, Zeer ships 20 years (2001–2020) of NASA's monthly climate averages: temperature, how much it swings in a day, humidity and air pressure. A GitHub Actions job downloaded it, because my build computer couldn't reach NASA directly.

**2. The coldest evaporation can get: the wet-bulb temperature.** It's the temperature a thermometer wrapped in a wet cloth would show. Zeer calculates it with the standard engineering equations (ASHRAE psychrometrics). No evaporative cooler can get colder than this.
- *Fun detail:* NASA has its own "wet bulb" number, but it's just the average of the temperature and the dew point, which is too warm in dry air. So Zeer does the real calculation.

**3. How good a real pot is: the efficiency.** A real pot only gets part of the way from the air temperature down to the wet bulb. That fraction is the efficiency. I didn't guess it: I rebuilt the weather of MIT D-Lab's Mali study from NASA's data and picked the efficiency that reproduces their measured results: 6.7 °C cooler on average for pot-in-pot coolers (4.7 °C for the worst design, up to 8 °C at best). That gives 0.32 / 0.46 / 0.54, so every answer is a range, not a fake exact number.

**4. The verdict for each month.** If the pot is at least 5 °C cooler than the air on average (the bottom of D-Lab's measured 5–7 °C), the month "works well". 2.5–5 °C "helps a little". Less is "too humid". If afternoons stay under 25 °C, it's a "mild month": food keeps OK anyway.

**5. How much longer food lasts.** Food spoils faster when it's warm: roughly 2–3× faster for every 10 °C (Kader, the standard postharvest textbook). For each crop I used its own heat sensitivity from the USDA's Handbook 66 respiration tables (for example, tomatoes 1.95, peppers 2.83). Zeer asks her how many days her tomatoes last now and multiplies, so it never makes up a baseline.

**6. What must never go in.** Onions and dry goods (they need dry air and would rot), milk/meat/fish/cooked food (need a real fridge below 5 °C), medicines and vaccines (need 2–8 °C). Zeer says so every time.

**7. Build it.** Pick how much the inner pot holds (D-Lab found 50 litres is enough for most households). Zeer sizes the pots and estimates how much water to add each day from how much heat the pot absorbs (about 1–2 litres for a 50 L pot in Mopti in March). You can print the card or save it as an image to send on WhatsApp.

**8. Is my pot working?** She reads two thermometers (air next to the pot, inside the pot). Zeer works out her pot's efficiency and compares it with D-Lab's. If it's low, it tells her what to fix: wet the sand, move it into shade, check the outer pot isn't glazed.

**9. The map.** Every town, coloured by whether the pot works that month. Scrub the months and watch the working zone move with the seasons.

## The tech, in one breath
Plain TypeScript and SVG with Vite, no framework, no server, no API key; everything runs in the browser and works offline after the first visit. 69 unit tests and 29 end-to-end browser tests, checked by GitHub Actions on every push, which also re-test the live site after every deploy. English, French and Spanish. Built with Claude Code as an AI coding agent, which I directed.

## The honest headline number
Of 492 hot towns, only **166 get even one month where the pot works well**; in 326 it never does. That's not a failure of Zeer. It's the point: people have been told "clay pot coolers work in hot places", and it's only true for dry heat. Zeer shows exactly where and when.

## 15 questions judges are likely to ask

**1. Why not just tell people to buy a fridge or a solar fridge?**
Because 565 million people in sub-Saharan Africa had no electricity in 2023, and solar cold rooms cost far more than two clay pots. D-Lab reports pot-in-pot coolers at about $10–50 in Mali. Zeer is for the people who can't get cold chain at all.

**2. Did you invent the clay-pot cooler?**
No, and I say so. It's thousands of years old; Mohammed Bah Abba popularised the pot-in-pot in Nigeria in the 1990s, and MIT D-Lab studied it in Mali. What's new is telling someone whether it will work in *their* town and month, how much, and checking their own pot.

**3. Isn't there already a tool for this?**
MIT D-Lab published an Evaporative Cooling Decision Making Tool (a spreadsheet) with its Mali study, and general guidance says "works in hot, dry places". Zeer is different in that it has month-by-month climate for 492 towns built in, works offline on a phone, gives per-crop shelf-life ranges, sizes the pot and checks your own pot against field data. (See the README's prior-art section.)

**4. How accurate is it?**
It's calibrated to reproduce D-Lab's measured averages in Mali, so there it's right by construction; elsewhere it uses the same physics. I show ranges, not single numbers, and the "Is my pot working?" check lets anyone compare with reality. I haven't done my own field test; that's the obvious next step.

**5. Why do you use 20-year averages instead of today's weather?**
Because the decision is "is this worth building for this season?", and averages answer that. Live weather would need an internet connection and an API, and the people who'd use this often don't have reliable data.

**6. Which SDG, exactly?**
Target 12.3: cut food losses, "including post-harvest losses" (indicator 12.3.1). And target 2.3: raise the incomes of small-scale food producers, "in particular women" (indicator 2.3.2). Less spoiled stock means more to sell.

**7. How is this about gender equality?**
Honestly: the tool isn't gender-specific, but the people it helps are, a lot of the time. FAO data shows most working women in sub-Saharan Africa and southern Asia work in agrifood systems. I didn't want to slap "for women" on it without the data to back it up.

**8. Did you test it with real users?**
No. I'm a student in the US and the build window was a few days. I haven't quoted or invented any users. The next step would be working with an organisation that already runs clay-pot trainings (D-Lab's Mali programme spun out as CoolVeg).

**9. Why does it say "too humid" for so many places?**
Because it's true. Evaporation can't cool humid air much. 326 of the 492 towns never reach "works well". Telling someone not to waste effort is useful too.

**10. How do you get shelf life from temperature?**
Food spoils through respiration, which speeds up with heat. The USDA measured each crop's respiration at different temperatures, which gives how much faster it spoils per 10 °C. The cooler the pot, the slower the spoilage. It ignores ripeness and handling, and the app says so.

**11. What's the hardest technical part?**
Getting the physics right: computing the true wet-bulb temperature (NASA's field is only an average), realising NASA's "maximum temperature" in climatology is the month's extreme, not a typical afternoon, and calibrating the pot against real measurements instead of guessing.

**12. Why no AI?**
The judging says technical complexity is optional. This problem has a physics answer, and a physics answer is checkable. An AI would add a key, a server and made-up confidence. I used AI to help me *build* it (Claude Code), not inside the product.

**13. Does it work on a cheap phone with bad internet?**
It's about 25 kB of JavaScript (gzipped) plus a 311 KB climate file, it passes automated tests at 375 px wide, and after the first visit it works fully offline.

**14. What would you do next?**
Field-test with a clay-pot training programme; add Hausa, Bambara and Arabic with native speakers; let users log their pot readings to improve the calibration per region; SMS/USSD version for feature phones.

**15. What did you learn?**
That the honest answer ("not here, not this month") is the most useful thing a tool like this can say, and that the data you're handed isn't always what its name says (NASA's wet bulb and "max temperature").

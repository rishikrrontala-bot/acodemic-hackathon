# What Zeer can't do

Zeer is a planning aid for a low-tech cooler. It is useful because it says where and when the pot doesn't work. This page says where Zeer itself doesn't work.

## The climate is an average, not a forecast
- Every number comes from NASA POWER long-term monthly means for 2001–2020. A heatwave, a rainy week, a harmattan wind or a cool spell changes the day; Zeer can't see them.
- Climate has shifted since 2001–2020 and will keep shifting. The snapshot doesn't.
- The data is MERRA-2 reanalysis at about half a degree (~50 km). A town in a river valley, on a coast or on a hillside can differ from its grid cell.
- 492 towns are bundled. "Use my location" picks the nearest one and says how far away it is; tens of kilometres can mean a different climate.

## The pot is modelled, not measured
- One efficiency range, calibrated on MIT D-Lab's 2017 Mali study (average decreases of 4.7–6.7 °C, up to 8 °C), stands in for every pot. Real pots vary with the clay, wall thickness, glaze, size, sand, how wet it's kept, shade and wind.
- The calibration uses NASA climatology for the study months, not the study's own hourly weather logs: the D-Lab measurement files weren't reachable in machine-readable form from the build environment, so the calibration matches D-Lab's published averages rather than individual readings.
- The hottest-hours inside temperature ignores the pot's thermal mass, so it is a conservative (warm) estimate. The day-average inside temperature is what the calibration checks.
- Wind and direct sun are not modelled. The build card tells users to keep the pot in shade where air moves, because the model assumes they do.
- Water per day is an energy-balance estimate with a range for still-to-breezy air, not a measurement.

## Shelf life is an estimate from temperature alone
- The multiplier uses each crop's respiration-rate sensitivity from USDA Handbook 66 (or Kader's general 2–3× per 10 °C). Ripeness at harvest, bruising, variety, ethylene from neighbouring fruit and handling matter as much as temperature and aren't modelled.
- HB66's respiration tables stop at 25 °C, and hot-season pots run warmer, so the Q10 is extrapolated.
- The humidity benefit (less wilting) is described but not added to the number, so the gain for leafy greens is probably understated.
- Zeer asks the seller how long her produce lasts now and multiplies that; it never invents a baseline number of days.

## Safety
- A clay-pot cooler is not a food-safety fridge. Milk, meat, fish and cooked food need to stay below 5 °C and medicines and vaccines between 2 and 8 °C; a pot can't promise either. Zeer says so every time.
- Zeer does not give health advice, and the pot check is about cooling performance only.

## What we did not do
- **No real users.** No seller, trader or extension worker tested Zeer. The persona in PRODUCT.md comes from FAO and MIT D-Lab publications, not interviews. Nothing in the app or the submission quotes a user.
- **No field validation of our own.** The only validation is against D-Lab's published averages and textbook psychrometrics.
- **Three languages.** English, French and Spanish, written for this project. Hausa, Bambara, Arabic, Amharic, Hindi, Swahili and others would matter more to the people who'd use it, and would need native speakers to write them.
- **Pot prices.** Zeer doesn't estimate cost; D-Lab reports $10–$50 for pot-in-pot coolers in Mali, but markets differ too much to put a number in the app.

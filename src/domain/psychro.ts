/**
 * Psychrometrics: the physics of moist air that decides how cold a wet clay pot can get.
 *
 * Formulas are from ASHRAE Handbook, Fundamentals (2017), chapter 1 "Psychrometrics":
 *   eq. 5/6  saturation vapour pressure over ice / water (Hyland and Wexler 1983)
 *   eq. 20/22 humidity ratio from vapour pressure
 *   eq. 33/35 thermodynamic wet-bulb temperature (solved here by bisection)
 * Temperatures in °C, pressures in kPa, humidity ratio W in kg water per kg dry air.
 *
 * The wet-bulb temperature is the floor: an evaporative cooler can approach it but
 * never go below it. Everything in Zeer is measured against that floor.
 */

export const SEA_LEVEL_KPA = 101.325;
const EPS = 0.621945; // ratio of molecular masses, water / dry air

/** Saturation vapour pressure (kPa) at temperature t (°C), ASHRAE eq. 5 (ice) and 6 (water). */
export function saturationPressure(t: number): number {
  const T = t + 273.15;
  let lnP: number;
  if (t < 0) {
    lnP =
      -5.6745359e3 / T +
      6.3925247 +
      -9.677843e-3 * T +
      6.2215701e-7 * T ** 2 +
      2.0747825e-9 * T ** 3 +
      -9.484024e-13 * T ** 4 +
      4.1635019 * Math.log(T);
  } else {
    lnP =
      -5.8002206e3 / T +
      1.3914993 +
      -4.8640239e-2 * T +
      4.1764768e-5 * T ** 2 +
      -1.4452093e-8 * T ** 3 +
      6.5459673 * Math.log(T);
  }
  return Math.exp(lnP) / 1000; // Pa -> kPa
}

/** Humidity ratio from partial pressure of water vapour pw (kPa) at total pressure p (kPa). ASHRAE eq. 20. */
export function humidityRatioFromVapourPressure(pw: number, p = SEA_LEVEL_KPA): number {
  return (EPS * pw) / (p - pw);
}

/** Vapour pressure (kPa) from humidity ratio. Inverse of eq. 20. */
export function vapourPressureFromHumidityRatio(w: number, p = SEA_LEVEL_KPA): number {
  return (p * w) / (EPS + w);
}

/** Saturation humidity ratio at t (°C), ASHRAE eq. 23. */
export function saturationHumidityRatio(t: number, p = SEA_LEVEL_KPA): number {
  return humidityRatioFromVapourPressure(saturationPressure(t), p);
}

/** Humidity ratio from dry-bulb t (°C) and relative humidity rh (0–100 %). */
export function humidityRatioFromRH(t: number, rh: number, p = SEA_LEVEL_KPA): number {
  return humidityRatioFromVapourPressure((clamp(rh, 0, 100) / 100) * saturationPressure(t), p);
}

/** Humidity ratio from specific humidity q in g/kg (NASA POWER's QV2M). */
export function humidityRatioFromSpecificHumidity(qGramsPerKg: number): number {
  const q = qGramsPerKg / 1000;
  return q / (1 - q);
}

/** Relative humidity (0–100 %) at t (°C) for humidity ratio w. */
export function relativeHumidity(t: number, w: number, p = SEA_LEVEL_KPA): number {
  return clamp((100 * vapourPressureFromHumidityRatio(w, p)) / saturationPressure(t), 0, 100);
}

/** Dew-point temperature (°C) for humidity ratio w, by bisection on the saturation curve. */
export function dewPoint(w: number, p = SEA_LEVEL_KPA): number {
  const pw = vapourPressureFromHumidityRatio(w, p);
  let lo = -60;
  let hi = 60;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (saturationPressure(mid) < pw) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Humidity ratio implied by a candidate wet-bulb temperature tw at dry-bulb t.
 * ASHRAE eq. 33 (tw above freezing) and eq. 35 (below).
 */
function humidityRatioAtWetBulb(t: number, tw: number, p: number): number {
  const wsStar = saturationHumidityRatio(tw, p);
  if (tw >= 0) {
    return ((2501 - 2.326 * tw) * wsStar - 1.006 * (t - tw)) / (2501 + 1.86 * t - 4.186 * tw);
  }
  return ((2830 - 0.24 * tw) * wsStar - 1.006 * (t - tw)) / (2830 + 1.86 * t - 2.1 * tw);
}

/**
 * Thermodynamic wet-bulb temperature (°C) for dry-bulb t (°C), humidity ratio w, pressure p (kPa).
 * The function humidityRatioAtWetBulb rises monotonically with tw, so bisection between the
 * dew point and the dry bulb converges to 1e-6 °C.
 */
export function wetBulb(t: number, w: number, p = SEA_LEVEL_KPA): number {
  const wsat = saturationHumidityRatio(t, p);
  if (w >= wsat) return t; // saturated (or supersaturated input): no evaporative cooling possible
  let lo = Math.min(dewPoint(w, p), t) - 1;
  let hi = t;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (humidityRatioAtWetBulb(t, mid, p) < w) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-6) break;
  }
  return (lo + hi) / 2;
}

/** Wet-bulb temperature from dry bulb and relative humidity (convenience wrapper). */
export function wetBulbFromRH(t: number, rh: number, p = SEA_LEVEL_KPA): number {
  return wetBulb(t, humidityRatioFromRH(t, rh, p), p);
}

/**
 * Stull (2011) empirical wet-bulb formula, J. Appl. Meteor. Climatol. 50, 2267–2269.
 * Valid at sea-level pressure for RH 5–99 % and T −20…50 °C, within about ±1 °C.
 * Used only as an independent cross-check of wetBulb() in the tests.
 */
export function stullWetBulb(t: number, rh: number): number {
  return (
    t * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(t + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * rh ** 1.5 * Math.atan(0.023101 * rh) -
    4.686035
  );
}

/** Latent heat of vaporisation of water (J/kg) at t (°C); linear fit valid 0–40 °C. */
export function latentHeat(t: number): number {
  return (2501 - 2.361 * t) * 1000;
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

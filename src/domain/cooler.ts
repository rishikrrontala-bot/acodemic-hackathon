/**
 * The clay-pot cooler model.
 *
 * A pot-in-pot cooler is a direct evaporative cooler: water in the wet sand evaporates through
 * the porous outer pot and pulls the inside toward the air's wet-bulb temperature. Its
 * performance is summarised by an evaporative (saturation) efficiency ε:
 *
 *     T_inside = T_air − ε · (T_air − T_wetbulb)          0 ≤ ε < 1
 *
 * ε is not a constant of nature; it depends on the pot, the sand, shade and airflow. Zeer carries
 * it as a range (see EFFICIENCY and docs/ARCHITECTURE.md for how it was calibrated) and every
 * number derived from it is a range too.
 */
import { humidityRatioFromSpecificHumidity, relativeHumidity, wetBulb } from './psychro';

/** Long-term monthly means for one town and month (NASA POWER climatology). */
export interface MonthClimate {
  /** Mean air temperature at 2 m, °C (T2M). */
  T: number;
  /** Mean daily maximum temperature, °C (T2M_MAX). */
  Tx: number;
  /** Mean daily minimum temperature, °C (T2M_MIN). */
  Tn: number;
  /** Mean dew point, °C (T2MDEW). */
  Td: number;
  /** Mean relative humidity, % (RH2M). */
  RH: number;
  /** Mean specific humidity, g/kg (QV2M). */
  Q: number;
  /** Mean surface pressure, kPa (PS). */
  P: number;
  /** Mean precipitation, mm/day (PRECTOTCORR). */
  R: number;
}

/** A value with its uncertainty: low ≤ mid ≤ high. */
export interface Range {
  low: number;
  mid: number;
  high: number;
}

export interface Efficiency {
  low: number;
  mid: number;
  high: number;
}

/**
 * Evaporative efficiency of a working clay-pot cooler.
 * Calibrated in scripts/data/calibrate.py against field measurements (see EFFICIENCY_SOURCE).
 * These defaults are overwritten by src/data/calibration.json when it exists.
 */
export const EFFICIENCY: Efficiency = { low: 0.45, mid: 0.6, high: 0.75 };

export type Verdict = 'works' | 'some' | 'humid' | 'mild';

/** Thresholds, in °C, for the month verdicts. MIT D-Lab's field guidance is the anchor:
 * clay pot coolers help most when the daily maximum is above 25 °C and the air is dry, and in
 * those conditions deliver at least 8 °C below the daily maximum. */
export const THRESHOLDS = {
  /** Afternoon drop (°C, at mid efficiency) for "works well". */
  works: 8,
  /** Afternoon drop (°C) for "helps some". */
  some: 4,
  /** Daily maximum (°C) below which the month is mild and cooling matters less. */
  mild: 25,
} as const;

export interface MonthResult {
  month: number; // 0 = January
  outsideMean: number;
  outsidePeak: number;
  outsideNight: number;
  humidityPeak: number; // afternoon RH, %
  humidityMean: number;
  wetBulbMean: number;
  wetBulbPeak: number;
  /** Inside the pot, day average (°C). low = coldest (high efficiency). */
  insideMean: Range;
  /** Inside the pot in the hottest hours (°C). Conservative: ignores the pot's thermal lag. */
  insidePeak: Range;
  /** How much cooler than the air in the hottest hours (°C). */
  dropPeak: Range;
  /** How much cooler than the air on average over the day (°C). */
  dropMean: Range;
  verdict: Verdict;
}

export function insideTemperature(tAir: number, tWet: number, eff: number): number {
  return tAir - eff * (tAir - tWet);
}

function range(f: (e: number) => number, eff: Efficiency, invert = false): Range {
  const a = f(eff.low);
  const b = f(eff.mid);
  const c = f(eff.high);
  return invert ? { low: c, mid: b, high: a } : { low: a, mid: b, high: c };
}

export function verdictFor(outsidePeak: number, dropPeakMid: number): Verdict {
  if (outsidePeak < THRESHOLDS.mild) return 'mild';
  if (dropPeakMid >= THRESHOLDS.works) return 'works';
  if (dropPeakMid >= THRESHOLDS.some) return 'some';
  return 'humid';
}

/** Model one month. Humidity comes from specific humidity, which barely changes over a day,
 * so the afternoon wet bulb uses the day's moisture at the afternoon temperature. */
export function modelMonth(c: MonthClimate, month: number, eff: Efficiency = EFFICIENCY): MonthResult {
  const w = humidityRatioFromSpecificHumidity(c.Q);
  const p = c.P;
  const wetBulbMean = wetBulb(c.T, w, p);
  const wetBulbPeak = wetBulb(c.Tx, w, p);
  const insideMean = range((e) => insideTemperature(c.T, wetBulbMean, e), eff, true);
  const insidePeak = range((e) => insideTemperature(c.Tx, wetBulbPeak, e), eff, true);
  const dropPeak = range((e) => e * (c.Tx - wetBulbPeak), eff);
  const dropMean = range((e) => e * (c.T - wetBulbMean), eff);
  return {
    month,
    outsideMean: c.T,
    outsidePeak: c.Tx,
    outsideNight: c.Tn,
    humidityPeak: relativeHumidity(c.Tx, w, p),
    humidityMean: relativeHumidity(c.T, w, p),
    wetBulbMean,
    wetBulbPeak,
    insideMean,
    insidePeak,
    dropPeak,
    dropMean,
    verdict: verdictFor(c.Tx, dropPeak.mid),
  };
}

export function modelYear(months: MonthClimate[], eff: Efficiency = EFFICIENCY): MonthResult[] {
  return months.map((c, i) => modelMonth(c, i, eff));
}

/** Months (0-based) grouped into contiguous runs, wrapping December → January. */
export function monthRuns(flags: boolean[]): Array<[number, number]> {
  const n = flags.length;
  if (flags.every(Boolean)) return [[0, n - 1]];
  if (!flags.some(Boolean)) return [];
  // start scanning just after a false month so wrapped runs stay whole
  const start = flags.findIndex((f) => !f);
  const runs: Array<[number, number]> = [];
  let runStart = -1;
  for (let k = 1; k <= n; k++) {
    const i = (start + k) % n;
    if (flags[i] && runStart < 0) runStart = i;
    if (!flags[i] && runStart >= 0) {
      runs.push([runStart, (i - 1 + n) % n]);
      runStart = -1;
    }
  }
  if (runStart >= 0) runs.push([runStart, start === 0 ? n - 1 : (start - 1 + n) % n]);
  return runs.sort((a, b) => a[0] - b[0]);
}

export interface YearSummary {
  worksMonths: number[];
  someMonths: number[];
  /** Best month by afternoon drop. */
  best: number;
  /** Typical afternoon drop in the months that work (median of mid values), °C. */
  typicalDrop: number | null;
}

export function summarise(year: MonthResult[]): YearSummary {
  const worksMonths = year.filter((m) => m.verdict === 'works').map((m) => m.month);
  const someMonths = year.filter((m) => m.verdict === 'some').map((m) => m.month);
  const best = year.reduce((b, m) => (m.dropPeak.mid > (year[b]?.dropPeak.mid ?? -1) ? m.month : b), 0);
  const drops = year.filter((m) => m.verdict === 'works').map((m) => m.dropPeak.mid).sort((a, b) => a - b);
  const typicalDrop = drops.length ? median(drops) : null;
  return { worksMonths, someMonths, best, typicalDrop };
}

export function median(sorted: number[]): number {
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 ? (sorted[mid] as number) : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
}

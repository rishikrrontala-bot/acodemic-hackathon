/**
 * Shelf life from temperature.
 *
 * Postharvest rule (Kader, Postharvest Technology of Horticultural Crops, 3rd ed., 2002, ch. 4):
 * above a crop's optimum, deterioration speeds up two- to threefold for every 10 °C, and it
 * generally tracks respiration. Cooling by ΔT therefore multiplies shelf life by Q10^(ΔT/10).
 * Crops with usable USDA HB66 respiration data use their own Q10; the rest use Kader's 2–3.
 * The range always carries the cooler's efficiency spread.
 */
import type { Range } from './cooler';
import type { Crop } from './crops';

export const KADER_Q10 = { low: 2, high: 3 } as const;

export function q10Range(crop: Pick<Crop, 'q10'> | null): Range {
  if (crop?.q10) return { low: crop.q10, mid: crop.q10, high: crop.q10 };
  return { low: KADER_Q10.low, mid: Math.sqrt(KADER_Q10.low * KADER_Q10.high), high: KADER_Q10.high };
}

/** Shelf-life multiplier for a day-average cooling of `drop` °C (a Range from the cooler model). */
export function shelfMultiplier(drop: Range, q10: Range = q10Range(null)): Range {
  const f = (qq: number, d: number) => Math.pow(qq, Math.max(0, d) / 10);
  return { low: f(q10.low, drop.low), mid: f(q10.mid, drop.mid), high: f(q10.high, drop.high) };
}

/** Days in the pot for food that lasts `baselineDays` on the table today. */
export function daysInPot(baselineDays: number, multiplier: Range): Range {
  return { low: baselineDays * multiplier.low, mid: baselineDays * multiplier.mid, high: baselineDays * multiplier.high };
}

/** True when the coldest plausible inside temperature is below the crop's lowest safe temperature. */
export function chillingRisk(crop: Crop, insideColdest: number): boolean {
  return crop.chillBelowC !== undefined && insideColdest < crop.chillBelowC;
}

/**
 * Shelf life from temperature.
 *
 * Postharvest rule of thumb (Kader, Postharvest Technology of Horticultural Crops, 3rd ed., 2002,
 * ch. 4): above a crop's optimum, each 10 °C rise speeds deterioration two- to threefold, i.e. a
 * temperature coefficient Q10 between 2 and 3. So cooling by ΔT multiplies shelf life by
 * Q10^(ΔT/10). Zeer never quotes a single number: the range combines the Q10 spread with the
 * cooler's efficiency spread.
 */
import type { Range } from './cooler';
import type { Crop } from './crops';

export const Q10 = { low: 2, high: 3 } as const;

/** Shelf-life multiplier for a day-average cooling of `drop` °C (a Range from the cooler model). */
export function shelfMultiplier(drop: Range): Range {
  const f = (q: number, d: number) => Math.pow(q, Math.max(0, d) / 10);
  return {
    low: f(Q10.low, drop.low),
    mid: f(Math.sqrt(Q10.low * Q10.high), drop.mid),
    high: f(Q10.high, drop.high),
  };
}

/** Days in the pot for food that lasts `baselineDays` on the table today. */
export function daysInPot(baselineDays: number, multiplier: Range): Range {
  return {
    low: baselineDays * multiplier.low,
    mid: baselineDays * multiplier.mid,
    high: baselineDays * multiplier.high,
  };
}

/** True when the coldest plausible inside temperature is below the crop's chilling threshold. */
export function chillingRisk(crop: Crop, insideColdest: number): boolean {
  return crop.chillBelowC !== undefined && insideColdest < crop.chillBelowC;
}

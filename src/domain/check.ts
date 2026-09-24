/**
 * "Is my pot working?" From two thermometer readings taken at the same time (air in the shade
 * next to the pot, and inside the inner pot), compute the pot's evaporative efficiency and compare
 * it with the range calibrated on MIT D-Lab's field measurements.
 */
import { EFFICIENCY, type Efficiency } from './cooler';
import { wetBulb } from './psychro';

export type Diagnosis =
  | 'impossible' // colder than the wet bulb: the readings can't both be right
  | 'warmer' // inside is warmer than outside
  | 'weak' // well below the calibrated range
  | 'ok' // inside the calibrated range
  | 'great' // above the calibrated range
  | 'noRoom'; // the air is so humid there's almost no cooling to be had

export interface CheckResult {
  efficiency: number | null;
  wetBulb: number;
  /** The best any evaporative cooler could do right now (°C). */
  floor: number;
  expectedInside: { low: number; high: number };
  diagnosis: Diagnosis;
}

/**
 * @param outside air temperature in the shade next to the pot (°C)
 * @param inside temperature inside the inner pot (°C)
 * @param w humidity ratio of the air (from the month's climatology, or a hygrometer)
 * @param p pressure, kPa
 */
export function checkPot(outside: number, inside: number, w: number, p: number, eff: Efficiency = EFFICIENCY): CheckResult {
  const tw = wetBulb(outside, w, p);
  const depression = outside - tw;
  const expectedInside = { low: outside - eff.high * depression, high: outside - eff.low * depression };
  const base = { wetBulb: tw, floor: tw, expectedInside };
  if (depression < 1.5) return { ...base, efficiency: null, diagnosis: 'noRoom' };
  const e = (outside - inside) / depression;
  let diagnosis: Diagnosis;
  if (inside < tw - 0.5) diagnosis = 'impossible';
  else if (inside > outside + 0.5) diagnosis = 'warmer';
  else if (e < eff.low * 0.75) diagnosis = 'weak';
  else if (e > eff.high * 1.15) diagnosis = 'great';
  else diagnosis = 'ok';
  return { ...base, efficiency: e, diagnosis };
}

/**
 * Sizing a pot-in-pot cooler and estimating the water it drinks.
 *
 * Capacity: MIT D-Lab's Mali study found 50-litre clay pot coolers "sufficient to meet the
 * vegetable storage needs of most households"; pot-in-pot coolers in the study held 10-100 L.
 *
 * Water: the heat the wet outer wall absorbs from the air is carried off as evaporated water.
 * At steady state, sensible heat in ≈ latent heat out:
 *     m_water · L = h · A · (T_air − T_wall) · t
 * with T_wall ≈ the inside day-average (the wet sand sits at the pot's temperature), A the outer
 * pot's wetted side, and h the outdoor convective heat-transfer coefficient, 5-10 W/m²K for still
 * to lightly moving air around a shaded pot. This is an estimate for planning how much water to
 * keep nearby, not a measurement; D-Lab's users simply watered at least once a day.
 */
import type { Range } from './cooler';
import { latentHeat } from './psychro';

export const CAPACITY = { min: 10, max: 100, household: 50 } as const; // litres
export const H_CONVECTION = { low: 5, high: 10 } as const; // W/m²K

export interface PotPlan {
  /** Inner pot capacity, litres. */
  innerLitres: number;
  /** Inner pot, assuming a roughly squat cylinder with height ≈ diameter (cm). */
  innerDiameterCm: number;
  /** Outer pot diameter so sand surrounds the inner pot (cm): a sand ring of `sandCm` all round. */
  outerDiameterCm: number;
  /** Sand layer thickness assumed on every side and underneath (cm). */
  sandCm: number;
  /** Outer pot wetted side area, m². */
  wettedAreaM2: number;
}

/** Sand thickness used for the plan (cm). A planning assumption, stated in the UI as such. */
export const SAND_CM = 5;

export function planPot(innerLitres: number, sandCm = SAND_CM): PotPlan {
  const litres = Math.min(CAPACITY.max, Math.max(CAPACITY.min, innerLitres));
  // V = π (d/2)² h with h = d  →  d = (4V/π)^(1/3); V in cm³
  const d = Math.cbrt((4 * litres * 1000) / Math.PI);
  const outer = d + 2 * sandCm;
  const height = d + sandCm; // sand underneath too
  const area = (Math.PI * outer * height) / 10_000; // cm² → m²
  return {
    innerLitres: litres,
    innerDiameterCm: d,
    outerDiameterCm: outer,
    sandCm,
    wettedAreaM2: area,
  };
}

/** Litres of water evaporated per day, as a range over h. */
export function waterPerDay(plan: PotPlan, airMean: number, insideMean: number): Range {
  const dT = Math.max(0, airMean - insideMean);
  const L = latentHeat(insideMean);
  const litres = (h: number) => (h * plan.wettedAreaM2 * dT * 86_400) / L; // kg ≈ L
  return { low: litres(H_CONVECTION.low), mid: litres((H_CONVECTION.low + H_CONVECTION.high) / 2), high: litres(H_CONVECTION.high) };
}

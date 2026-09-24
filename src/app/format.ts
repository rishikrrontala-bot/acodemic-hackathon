/** Number and temperature formatting in the reader's language and unit. */
import type { Range } from '../domain/cooler';
import type { Lang } from '../i18n';

export type Unit = 'C' | 'F';

export function toUnit(c: number, unit: Unit): number {
  return unit === 'C' ? c : (c * 9) / 5 + 32;
}

/** A temperature difference converts without the +32 offset. */
export function deltaToUnit(dc: number, unit: Unit): number {
  return unit === 'C' ? dc : (dc * 9) / 5;
}

export function num(x: number, lang: Lang, digits = 0): string {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(x);
}

export function temp(c: number, unit: Unit, lang: Lang, digits = 0): string {
  return `${num(toUnit(c, unit), lang, digits)}°`;
}

export function tempUnit(c: number, unit: Unit, lang: Lang): string {
  return `${num(toUnit(c, unit), lang)} °${unit}`;
}

export function delta(dc: number, unit: Unit, lang: Lang, digits = 0): string {
  return `${num(deltaToUnit(dc, unit), lang, digits)}°`;
}

/** "22–25°" (collapses to "23°" when the ends round to the same value). */
export function tempRange(lo: number, hi: number, unit: Unit, lang: Lang): string {
  const a = num(toUnit(lo, unit), lang);
  const b = num(toUnit(hi, unit), lang);
  return a === b ? `${a}°` : `${a}–${b}°`;
}

export function deltaRange(r: Range, unit: Unit, lang: Lang): string {
  const a = num(deltaToUnit(r.low, unit), lang);
  const b = num(deltaToUnit(r.high, unit), lang);
  return a === b ? `${a}°` : `${a}–${b}°`;
}

export function mult(x: number, lang: Lang): string {
  return num(x, lang, 1);
}

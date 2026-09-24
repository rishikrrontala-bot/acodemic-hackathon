/** Derived numbers for the current town, memoised per town: the model runs once per choice. */
import { modelYear, monthRuns, summarise, type MonthResult, type YearSummary } from '../domain/cooler';
import { SUITED, type Crop } from '../domain/crops';
import { q10Range, shelfMultiplier } from '../domain/shelf';
import { monthsOf, type TownRecord } from '../domain/towns';
import type { Range } from '../domain/cooler';

export interface TownModel {
  year: MonthResult[];
  summary: YearSummary;
  /** crop id → 12 shelf-life multipliers */
  shelf: Map<string, Range[]>;
  maxMultiplier: number;
}

const cache = new Map<number, TownModel>();

export function townModel(t: TownRecord): TownModel {
  const hit = cache.get(t.id);
  if (hit) return hit;
  const year = modelYear(monthsOf(t));
  const summary = summarise(year);
  const shelf = new Map<string, Range[]>();
  let maxMultiplier = 1;
  for (const c of SUITED) {
    const row = year.map((m) => shelfMultiplier(m.dropMean, q10Range(c)));
    for (const r of row) maxMultiplier = Math.max(maxMultiplier, r.mid);
    shelf.set(c.id, row);
  }
  const model = { year, summary, shelf, maxMultiplier };
  cache.set(t.id, model);
  return model;
}

/** "November–May and August" from month runs, in the reader's month names. */
export function runsText(months: number[], names: string[], join: string, to: string): string {
  const flags = Array.from({ length: 12 }, (_, i) => months.includes(i));
  const runs = monthRuns(flags);
  const parts = runs.map(([a, b]) => (a === b ? names[a]! : `${names[a]}${to}${names[b]}`));
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')}${join}${parts[parts.length - 1]}`;
}

export function cropOf(id: string): Crop {
  return SUITED.find((c) => c.id === id) ?? SUITED[0]!;
}

/** The month to open on: the current month if the pot works then, otherwise the best month. */
export function openingMonth(m: TownModel, today: number): number {
  return m.year[today]?.verdict === 'works' ? today : m.summary.best;
}

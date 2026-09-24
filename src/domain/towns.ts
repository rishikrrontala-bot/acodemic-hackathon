/** Town lookup over the bundled climate file: accent-insensitive search and nearest town. */
import type { MonthClimate } from './cooler';

export interface TownRecord {
  id: number;
  n: string; // name
  a: string[]; // alternate Latin-script names
  cc: string;
  c: string; // country
  lat: number;
  lon: number;
  p: number; // population
  m: { T: number[]; Tx: number[]; Tn: number[]; Td: number[]; RH: number[]; Q: number[]; P: number[]; R: number[] };
}

export function fold(s: string): string {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').toLowerCase().trim();
}

export function monthsOf(t: TownRecord): MonthClimate[] {
  return Array.from({ length: 12 }, (_, i) => ({
    T: t.m.T[i]!, Tx: t.m.Tx[i]!, Tn: t.m.Tn[i]!, Td: t.m.Td[i]!,
    RH: t.m.RH[i]!, Q: t.m.Q[i]!, P: t.m.P[i]!, R: t.m.R[i]!,
  }));
}

/**
 * Rank towns for a query: name prefix beats alternate-name prefix beats word prefix beats
 * substring; ties go to the bigger town. Country names match too ("mali" lists Malian towns).
 */
export function searchTowns(towns: TownRecord[], query: string, limit = 8): TownRecord[] {
  const q = fold(query);
  if (!q) return [];
  const scored: Array<[number, TownRecord]> = [];
  for (const t of towns) {
    const name = fold(t.n);
    const alts = t.a.map(fold);
    const country = fold(t.c);
    let s = 0;
    if (name === q) s = 100;
    else if (name.startsWith(q)) s = 80;
    else if (alts.some((a) => a.startsWith(q))) s = 60;
    else if (name.split(/[\s-]+/).some((w) => w.startsWith(q))) s = 50;
    else if (country.startsWith(q)) s = 30;
    else if (name.includes(q)) s = 20;
    if (s) scored.push([s + Math.log10(t.p + 1), t]);
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, limit).map(([, t]) => t);
}

/** Great-circle distance in km. */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r;
  const dLon = (lon2 - lon1) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function nearestTown(towns: TownRecord[], lat: number, lon: number): { town: TownRecord; km: number } | null {
  let best: { town: TownRecord; km: number } | null = null;
  for (const t of towns) {
    const km = distanceKm(lat, lon, t.lat, t.lon);
    if (!best || km < best.km) best = { town: t, km };
  }
  return best;
}

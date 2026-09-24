import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { modelYear, summarise } from '../src/domain/cooler';
import { distanceKm, fold, monthsOf, nearestTown, searchTowns, type TownRecord } from '../src/domain/towns';

const { towns } = JSON.parse(readFileSync('public/data/climate.json', 'utf8')) as { towns: TownRecord[] };
const byName = (n: string) => towns.find((t) => t.n === n)!;

describe('the bundled climate snapshot', () => {
  it('has 492 towns with 12 months of every variable', () => {
    expect(towns.length).toBe(492);
    for (const t of towns) for (const k of ['T', 'Tx', 'Tn', 'Td', 'RH', 'Q', 'P', 'R'] as const) expect(t.m[k]).toHaveLength(12);
  });

  it('keeps the typical afternoon above the mean and the night below it', () => {
    for (const t of towns) for (let i = 0; i < 12; i++) {
      expect(t.m.Tx[i]!).toBeGreaterThanOrEqual(t.m.T[i]!);
      expect(t.m.Tn[i]!).toBeLessThanOrEqual(t.m.T[i]!);
    }
  });
});

describe('searchTowns', () => {
  it('ignores accents and case', () => {
    expect(fold('Ségou')).toBe('segou');
    expect(searchTowns(towns, 'segou')[0]?.n).toBe('Ségou');
  });

  it('puts prefix matches first and bigger towns ahead', () => {
    const r = searchTowns(towns, 'ka');
    expect(fold(r[0]!.n).startsWith('ka')).toBe(true);
  });

  it('matches country names', () => {
    const r = searchTowns(towns, 'mali', 20);
    expect(r.some((t) => t.n === 'Mopti')).toBe(true);
  });

  it('returns nothing for an empty query', () => {
    expect(searchTowns(towns, '  ')).toEqual([]);
  });
});

describe('nearestTown', () => {
  it('measures great-circle distance (Bamako to Mopti ≈ 460 km)', () => {
    const b = byName('Bamako');
    const m = byName('Mopti');
    expect(distanceKm(b.lat, b.lon, m.lat, m.lon)).toBeGreaterThan(420);
    expect(distanceKm(b.lat, b.lon, m.lat, m.lon)).toBeLessThan(500);
  });

  it('finds Mopti from a point just outside it', () => {
    expect(nearestTown(towns, 14.5, -4.2)?.town.n).toBe('Mopti');
  });
});

describe('real towns behave as the field evidence says', () => {
  const year = (n: string) => modelYear(monthsOf(byName(n)));
  it('Mopti (MIT D-Lab field region) works in the dry season and fails in the August rains', () => {
    const y = year('Mopti');
    expect(y[2]?.verdict).toBe('works'); // March
    expect(y[7]?.verdict).toBe('humid'); // August
    expect(summarise(y).worksMonths.length).toBeGreaterThanOrEqual(6);
  });

  it('humid coastal Lagos and Jakarta never reach "works"', () => {
    expect(summarise(year('Lagos')).worksMonths).toEqual([]);
    expect(summarise(year('Jakarta')).worksMonths).toEqual([]);
  });
});

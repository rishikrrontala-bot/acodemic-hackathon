import { describe, expect, it } from 'vitest';
import { CROPS, SUITED, UNSUITED, cropById } from '../src/domain/crops';
import { chillingRisk, daysInPot, KADER_Q10, q10Range, shelfMultiplier } from '../src/domain/shelf';

describe('shelfMultiplier (Kader: 2–3× per 10 °C)', () => {
  it('is 1× with no cooling', () => {
    const m = shelfMultiplier({ low: 0, mid: 0, high: 0 });
    expect(m).toEqual({ low: 1, mid: 1, high: 1 });
  });

  it('is 2× to 3× for exactly 10 °C of cooling', () => {
    const m = shelfMultiplier({ low: 10, mid: 10, high: 10 });
    expect(m.low).toBeCloseTo(KADER_Q10.low, 9);
    expect(m.high).toBeCloseTo(KADER_Q10.high, 9);
    expect(m.mid).toBeCloseTo(Math.sqrt(6), 9);
  });

  it('never goes below 1× for a negative drop', () => {
    expect(shelfMultiplier({ low: -2, mid: -1, high: 0 }).low).toBe(1);
  });

  it('widens with the efficiency spread', () => {
    const m = shelfMultiplier({ low: 6, mid: 8, high: 10 });
    expect(m.low).toBeLessThan(m.mid);
    expect(m.mid).toBeLessThan(m.high);
  });
});

describe('daysInPot', () => {
  it('scales the seller’s own baseline', () => {
    const d = daysInPot(3, { low: 1.5, mid: 2, high: 2.5 });
    expect(d).toEqual({ low: 4.5, mid: 6, high: 7.5 });
  });
});

describe('crops', () => {
  it('has unique ids and splits into suited and unsuited', () => {
    expect(new Set(CROPS.map((c) => c.id)).size).toBe(CROPS.length);
    expect(SUITED.length + UNSUITED.length).toBe(CROPS.length);
  });

  it('gives every suited crop a storage group and every unsuited one a reason', () => {
    for (const c of SUITED) expect([1, 2, 3]).toContain(c.group);
    for (const c of UNSUITED) expect(c.reason).toBeDefined();
  });

  it('keeps onions and dry goods out (they need dry air)', () => {
    expect(cropById('onion').suited).toBe(false);
    expect(cropById('dryGoods').reason).toBe('needsDry');
  });

  it('derives each crop Q10 from USDA HB66 respiration rates', () => {
    expect(cropById('tomato').q10).toBeCloseTo(43 / 22, 2);
    expect(cropById('pepper').q10).toBeCloseTo(34 / 12, 2);
    expect(cropById('eggplant').q10).toBeNull();
  });

  it('mostly agrees with Kader: HB66 Q10s for the listed crops sit near 2–3', () => {
    const qs = SUITED.map((c) => c.q10).filter((x): x is number => typeof x === 'number');
    const inBand = qs.filter((x) => x >= 1.9 && x <= 3.3);
    expect(inBand.length).toBeGreaterThanOrEqual(qs.length - 1); // cucumber (1.28) is the outlier
  });

  it('uses a crop Q10 as a point and Kader’s spread otherwise', () => {
    expect(q10Range(cropById('tomato'))).toEqual({ low: 1.95, mid: 1.95, high: 1.95 });
    expect(q10Range(cropById('carrot')).high).toBe(3);
  });

  it('never offers the pot for milk or medicine', () => {
    expect(cropById('dairy').suited).toBe(false);
    expect(cropById('medicine').reason).toBe('coldChain');
  });

  it('warns about chilling for sensitive crops only', () => {
    expect(chillingRisk(cropById('mango'), 12)).toBe(true);
    expect(chillingRisk(cropById('mango'), 14)).toBe(false);
    expect(chillingRisk(cropById('tomato'), 9)).toBe(true);
    expect(chillingRisk(cropById('cabbage'), 2)).toBe(false);
  });

  it('throws on an unknown crop', () => {
    expect(() => cropById('banana' as never)).toThrow();
  });
});

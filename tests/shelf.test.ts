import { describe, expect, it } from 'vitest';
import { CROPS, SUITED, UNSUITED, cropById } from '../src/domain/crops';
import { chillingRisk, daysInPot, Q10, shelfMultiplier } from '../src/domain/shelf';

describe('shelfMultiplier (Kader: 2–3× per 10 °C)', () => {
  it('is 1× with no cooling', () => {
    const m = shelfMultiplier({ low: 0, mid: 0, high: 0 });
    expect(m).toEqual({ low: 1, mid: 1, high: 1 });
  });

  it('is 2× to 3× for exactly 10 °C of cooling', () => {
    const m = shelfMultiplier({ low: 10, mid: 10, high: 10 });
    expect(m.low).toBeCloseTo(Q10.low, 9);
    expect(m.high).toBeCloseTo(Q10.high, 9);
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

  it('gives every suited crop a storage band and every unsuited one a reason', () => {
    for (const c of SUITED) {
      expect(c.optimumC?.[0]).toBeLessThanOrEqual(c.optimumC?.[1] as number);
      expect(c.rh?.[0]).toBeLessThanOrEqual(c.rh?.[1] as number);
    }
    for (const c of UNSUITED) expect(c.reason).toBeDefined();
  });

  it('keeps onions and garlic out (they need dry air)', () => {
    expect(cropById('onion').suited).toBe(false);
    expect(cropById('garlic').reason).toBe('needsDry');
  });

  it('never offers the pot for milk or medicine', () => {
    expect(cropById('dairy').suited).toBe(false);
    expect(cropById('medicine').reason).toBe('coldChain');
  });

  it('warns about chilling for sensitive crops only', () => {
    expect(chillingRisk(cropById('mango'), 12)).toBe(true);
    expect(chillingRisk(cropById('mango'), 14)).toBe(false);
    expect(chillingRisk(cropById('cabbage'), 2)).toBe(false);
  });

  it('throws on an unknown crop', () => {
    expect(() => cropById('banana' as never)).toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import { checkPot } from '../src/domain/check';
import { EFFICIENCY } from '../src/domain/cooler';
import { humidityRatioFromRH, wetBulbFromRH } from '../src/domain/psychro';
import { CAPACITY, planPot, SAND_CM, waterPerDay } from '../src/domain/sizing';

describe('planPot', () => {
  it('sizes a 50 L inner pot to about 40 cm across', () => {
    const p = planPot(50);
    expect(p.innerDiameterCm).toBeGreaterThan(38);
    expect(p.innerDiameterCm).toBeLessThan(41);
    expect(p.outerDiameterCm).toBeCloseTo(p.innerDiameterCm + 2 * SAND_CM, 9);
  });

  it('keeps the capacity inside what D-Lab tested (10–100 L)', () => {
    expect(planPot(1).innerLitres).toBe(CAPACITY.min);
    expect(planPot(500).innerLitres).toBe(CAPACITY.max);
  });

  it('grows the wetted area with capacity', () => {
    expect(planPot(80).wettedAreaM2).toBeGreaterThan(planPot(20).wettedAreaM2);
  });
});

describe('waterPerDay', () => {
  it('is a few litres a day for a household pot in dry heat', () => {
    const w = waterPerDay(planPot(50), 32, 25);
    expect(w.low).toBeGreaterThan(0.5);
    expect(w.high).toBeLessThan(10);
    expect(w.low).toBeLessThan(w.mid);
    expect(w.mid).toBeLessThan(w.high);
  });

  it('is zero when there is no cooling', () => {
    expect(waterPerDay(planPot(50), 25, 25).high).toBe(0);
  });
});

describe('checkPot', () => {
  const p = 98;
  const w = humidityRatioFromRH(34, 20, p);
  const tw = wetBulbFromRH(34, 20, p);

  it('reads a well-working pot as ok', () => {
    const inside = 34 - EFFICIENCY.mid * (34 - tw);
    const r = checkPot(34, inside, w, p);
    expect(r.diagnosis).toBe('ok');
    expect(r.efficiency).toBeCloseTo(EFFICIENCY.mid, 1);
  });

  it('flags a pot that barely cools as weak', () => {
    expect(checkPot(34, 33, w, p).diagnosis).toBe('weak');
  });

  it('calls a reading below the wet bulb impossible', () => {
    expect(checkPot(34, tw - 3, w, p).diagnosis).toBe('impossible');
  });

  it('notices when inside is warmer than outside', () => {
    expect(checkPot(34, 36, w, p).diagnosis).toBe('warmer');
  });

  it('says there is no room to cool in saturated air', () => {
    const wet = humidityRatioFromRH(28, 97, p);
    expect(checkPot(28, 27.5, wet, p).diagnosis).toBe('noRoom');
  });

  it('gives an expected inside band between the wet bulb and the air', () => {
    const r = checkPot(34, 28, w, p);
    expect(r.expectedInside.low).toBeGreaterThan(r.floor);
    expect(r.expectedInside.high).toBeLessThan(34);
  });
});

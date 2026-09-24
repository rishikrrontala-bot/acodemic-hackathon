import { describe, expect, it } from 'vitest';
import { EFFICIENCY, insideTemperature, modelMonth, monthRuns, summarise, verdictFor, type MonthClimate } from '../src/domain/cooler';
import { humidityRatioFromRH } from '../src/domain/psychro';

/** A synthetic dry-season month shaped like the Sahel in March (test fixture, not real data). */
const dry: MonthClimate = { T: 31, Tx: 39, Tn: 23, Td: 3, RH: 18, Q: 4.8, P: 97.5, R: 0 };
/** A synthetic humid rainy-season month (test fixture). */
const wet: MonthClimate = { T: 28, Tx: 32, Tn: 24, Td: 23.5, RH: 76, Q: 18.5, P: 97.6, R: 6 };
/** A synthetic mild highland month (test fixture). */
const mild: MonthClimate = { T: 18, Tx: 23, Tn: 12, Td: 10, RH: 60, Q: 9.5, P: 82, R: 2 };

describe('insideTemperature', () => {
  it('is the air temperature at zero efficiency and the wet bulb at 100 %', () => {
    expect(insideTemperature(35, 20, 0)).toBe(35);
    expect(insideTemperature(35, 20, 1)).toBe(20);
    expect(insideTemperature(35, 20, 0.6)).toBeCloseTo(26, 9);
  });
});

describe('modelMonth', () => {
  it('never predicts the inside colder than the wet bulb or warmer than the air', () => {
    for (const c of [dry, wet, mild]) {
      const m = modelMonth(c, 0);
      expect(m.insidePeak.low).toBeGreaterThanOrEqual(m.wetBulbPeak);
      expect(m.insidePeak.high).toBeLessThanOrEqual(c.Tx);
      expect(m.insideMean.low).toBeGreaterThanOrEqual(m.wetBulbMean);
    }
  });

  it('orders every range low ≤ mid ≤ high', () => {
    const m = modelMonth(dry, 2);
    for (const r of [m.insideMean, m.insidePeak, m.dropPeak, m.dropMean]) {
      expect(r.low).toBeLessThanOrEqual(r.mid);
      expect(r.mid).toBeLessThanOrEqual(r.high);
    }
  });

  it('cools a lot in dry heat and little in humid heat', () => {
    const d = modelMonth(dry, 2);
    const h = modelMonth(wet, 7);
    expect(d.dropMean.mid).toBeGreaterThan(5);
    expect(d.dropPeak.mid).toBeGreaterThan(d.dropMean.mid);
    expect(d.verdict).toBe('works');
    expect(h.dropMean.mid).toBeLessThan(2.5);
    expect(h.verdict).toBe('humid');
  });

  it('flags mild months separately from humid ones', () => {
    expect(modelMonth(mild, 6).verdict).toBe('mild');
  });

  it('derives afternoon humidity lower than the day average (same moisture, hotter air)', () => {
    const d = modelMonth(dry, 2);
    expect(d.humidityPeak).toBeLessThan(d.humidityMean);
  });

  it('meets MIT D-Lab field guidance: a hot, dry day keeps the pot ≥8 °C below the daily maximum', () => {
    // Day mean 30 °C, maximum 37 °C, 25 % RH: inside day-average vs the day's maximum.
    const w = humidityRatioFromRH(30, 25, 98);
    const q = (w / (1 + w)) * 1000;
    const m = modelMonth({ T: 30, Tx: 37, Tn: 23, Td: 8, RH: 25, Q: q, P: 98, R: 0 }, 3);
    expect(37 - m.insideMean.mid).toBeGreaterThanOrEqual(8);
  });

  it('reproduces the calibration: 6.7 °C average drop at D-Lab study conditions', () => {
    // 14.74 °C is the mean wet-bulb depression of the study months (src/data/calibration.json).
    expect(EFFICIENCY.mid * 14.74).toBeCloseTo(6.7, 1);
  });
});

describe('verdictFor', () => {
  it('uses the documented thresholds', () => {
    expect(verdictFor(24.9, 20)).toBe('mild');
    expect(verdictFor(30, 5)).toBe('works');
    expect(verdictFor(30, 4.99)).toBe('some');
    expect(verdictFor(30, 2.5)).toBe('some');
    expect(verdictFor(30, 2.49)).toBe('humid');
  });
});

describe('monthRuns', () => {
  const f = (s: string) => s.split('').map((c) => c === '1');
  it('finds simple runs', () => {
    expect(monthRuns(f('001110000000'))).toEqual([[2, 4]]);
  });
  it('joins a run that wraps from December into January', () => {
    expect(monthRuns(f('110000000011'))).toEqual([[10, 1]]);
  });
  it('handles all and none', () => {
    expect(monthRuns(f('111111111111'))).toEqual([[0, 11]]);
    expect(monthRuns(f('000000000000'))).toEqual([]);
  });
  it('finds several runs, ordered by their first month', () => {
    expect(monthRuns(f('100100000110'))).toEqual([[0, 0], [3, 3], [9, 10]]);
  });
});

describe('summarise', () => {
  it('counts working months and picks the best one', () => {
    const year = [dry, dry, dry, wet, wet, wet, wet, wet, wet, dry, dry, mild].map((c, i) => modelMonth(c, i));
    const s = summarise(year);
    expect(s.worksMonths).toEqual([0, 1, 2, 9, 10]);
    expect(s.typicalDrop).not.toBeNull();
    expect(year[s.best]?.verdict).toBe('works');
  });

  it('reports no typical drop when nothing works', () => {
    const s = summarise(Array.from({ length: 12 }, (_, i) => modelMonth(wet, i)));
    expect(s.worksMonths).toEqual([]);
    expect(s.typicalDrop).toBeNull();
  });
});

it('ships a sane default efficiency range', () => {
  expect(EFFICIENCY.low).toBeLessThan(EFFICIENCY.mid);
  expect(EFFICIENCY.mid).toBeLessThan(EFFICIENCY.high);
  expect(EFFICIENCY.high).toBeLessThan(1);
});

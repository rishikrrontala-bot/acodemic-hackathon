import { describe, expect, it } from 'vitest';
import {
  dewPoint,
  humidityRatioFromRH,
  humidityRatioFromSpecificHumidity,
  relativeHumidity,
  saturationPressure,
  stullWetBulb,
  wetBulb,
  wetBulbFromRH,
} from '../src/domain/psychro';

describe('saturation vapour pressure', () => {
  // Saturated-water steam-table values (IAPWS; e.g. Cengel & Boles, Thermodynamics, table A-4).
  // Hyland-Wexler agrees with them to better than 0.05 % over the range Zeer uses.
  it.each([
    [0.01, 0.6117],
    [10, 1.2282],
    [20, 2.3392],
    [30, 4.247],
    [40, 7.3851],
  ])('at %f °C is %f kPa (within 0.05 %)', (t, kpa) => {
    expect(Math.abs(saturationPressure(t) / kpa - 1)).toBeLessThan(5e-4);
  });

  it('uses the ice curve below freezing (-10 °C: 0.2600 kPa)', () => {
    expect(saturationPressure(-10)).toBeCloseTo(0.26, 3);
  });
});

describe('wet-bulb temperature', () => {
  it('equals the dry bulb at saturation', () => {
    expect(wetBulbFromRH(25, 100)).toBeCloseTo(25, 3);
  });

  it('matches Stull (2011) worked example: 20 °C, 50 % RH gives 13.7 °C', () => {
    expect(stullWetBulb(20, 50)).toBeCloseTo(13.7, 1);
    expect(wetBulbFromRH(20, 50)).toBeCloseTo(13.7, 0);
  });

  it('agrees with Stull within 1 °C across hot, dry-to-humid climates', () => {
    for (const t of [20, 25, 30, 35, 40, 45]) {
      for (const rh of [8, 15, 25, 40, 60, 80, 95]) {
        expect(Math.abs(wetBulbFromRH(t, rh) - stullWetBulb(t, rh))).toBeLessThan(1);
      }
    }
  });

  it('is always between the dew point and the dry bulb', () => {
    for (const t of [15, 28, 41]) {
      for (const rh of [10, 50, 90]) {
        const w = humidityRatioFromRH(t, rh);
        const tw = wetBulb(t, w);
        expect(tw).toBeLessThanOrEqual(t + 1e-9);
        expect(tw).toBeGreaterThanOrEqual(dewPoint(w) - 1e-6);
      }
    }
  });

  it('drops at altitude for the same air (lower pressure evaporates faster)', () => {
    const w = humidityRatioFromRH(30, 30);
    expect(wetBulb(30, w, 80)).toBeLessThan(wetBulb(30, w, 101.325));
  });

  it('reproduces a psychrometric-chart reading: 35 °C, 20 % RH gives about 19.1 °C', () => {
    expect(wetBulbFromRH(35, 20)).toBeCloseTo(19.1, 0);
  });
});

describe('humidity conversions', () => {
  it('round-trips RH through the humidity ratio', () => {
    const w = humidityRatioFromRH(33, 27);
    expect(relativeHumidity(33, w)).toBeCloseTo(27, 6);
  });

  it('converts specific humidity (g/kg) to humidity ratio', () => {
    expect(humidityRatioFromSpecificHumidity(10)).toBeCloseTo(0.010101, 6);
  });

  it('finds the dew point: 30 °C at 50 % RH is about 18.4 °C', () => {
    expect(dewPoint(humidityRatioFromRH(30, 50))).toBeCloseTo(18.4, 1);
  });
});

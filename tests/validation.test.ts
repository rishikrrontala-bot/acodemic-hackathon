import { describe, expect, it } from 'vitest';
import validation from '../src/data/validation.json';

/**
 * Out-of-sample checks against MIT D-Lab's full Mali report (see scripts/data/validate.ts).
 * The model was calibrated only on the executive summary's dry-condition average decrease.
 */
describe('validation against D-Lab measurements the model was not tuned on', () => {
  it('humid season (RH > 70 %): average daily drop within 0.5 °C of the measured 1.8 °C', () => {
    expect(Math.abs(validation.bins.humid.predictedMeanDrop! - 1.8)).toBeLessThanOrEqual(0.5);
  });

  it('humid season: drop in the daily maximum within 0.5 °C of the measured 2.6 °C', () => {
    expect(Math.abs(validation.bins.humid.predictedMaxDrop! - 2.6)).toBeLessThanOrEqual(0.5);
  });

  it('dry season (RH < 40 %): drop in the daily maximum within 0.9 °C of the measured 8.6 °C (D-Lab: true ambient up to 0.9 °C hotter)', () => {
    expect(Math.abs(validation.bins.dry.predictedMaxDrop! - 8.6)).toBeLessThanOrEqual(0.9);
  });

  it('dry season: average daily drop within 0.5 °C of the full report’s 6.9 °C', () => {
    expect(Math.abs(validation.bins.dry.predictedMeanDrop! - 6.9)).toBeLessThanOrEqual(0.5);
  });

  it('the cooling falls as humidity rises, as measured', () => {
    const b = validation.bins;
    expect(b.dry.predictedMeanDrop!).toBeGreaterThan(b.mid.predictedMeanDrop!);
    expect(b.mid.predictedMeanDrop!).toBeGreaterThan(b.humid.predictedMeanDrop!);
  });
});

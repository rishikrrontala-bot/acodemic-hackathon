/**
 * Out-of-sample validation against MIT D-Lab's full Mali report (Verploegen, Sanogo &
 * Chagomoka, "Evaluation of Evaporative Cooling Technologies for Improved Vegetable Storage in
 * Mali", full report, 2018; data/raw/sources/dspace-116211-d.txt, "Clay pot cooler performance as
 * a function of humidity with regular watering"):
 *   pot-in-pot, decrease in the AVERAGE daily temperature: 6.9 °C (ambient RH < 40 %) → 1.8 °C (RH > 70 %)
 *   all clay pot coolers, decrease in the MAXIMUM daily temperature: 8.6 °C (RH < 40 %) → 2.6 °C (RH > 70 %)
 * The model was calibrated only on the executive summary's overall dry-condition average (6.7 °C),
 * so the humid band and the maximum-temperature figures are independent of the calibration.
 *
 * Study months (March–July) in Mopti and Bamako are binned by NASA POWER mean RH2M, and the model's
 * predictions (mid efficiency) are averaged per bin.
 *
 * Run: npx tsx scripts/data/validate.ts → src/data/validation.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { modelMonth } from '../../src/domain/cooler';
import { monthsOf, type TownRecord } from '../../src/domain/towns';

const { towns } = JSON.parse(readFileSync('public/data/climate.json', 'utf8')) as { towns: TownRecord[] };
const STUDY = [2, 3, 4, 5, 6];
type Bin = 'dry' | 'mid' | 'humid';
const bins: Record<Bin, { mean: number[]; max: number[]; months: string[] }> = {
  dry: { mean: [], max: [], months: [] },
  mid: { mean: [], max: [], months: [] },
  humid: { mean: [], max: [], months: [] },
};
for (const name of ['Mopti', 'Bamako']) {
  const t = towns.find((x) => x.n === name && x.cc === 'ML')!;
  const months = monthsOf(t);
  for (const i of STUDY) {
    const c = months[i]!;
    const bin: Bin = c.RH < 40 ? 'dry' : c.RH > 70 ? 'humid' : 'mid';
    const m = modelMonth(c, i);
    bins[bin].mean.push(m.dropMean.mid);
    bins[bin].max.push(m.dropPeak.mid);
    bins[bin].months.push(`${name} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]} (RH ${c.RH.toFixed(0)}%)`);
  }
}
const avg = (a: number[]) => (a.length ? Math.round((a.reduce((s, x) => s + x, 0) / a.length) * 10) / 10 : null);
const measured = { dry: { mean: 6.9, max: 8.6 }, humid: { mean: 1.8, max: 2.6 } };
const out = {
  source: 'MIT D-Lab / World Vegetable Center, Evaluation of Evaporative Cooling Technologies for Improved Vegetable Storage in Mali, full report (2018)',
  note: 'Measured ambient was read by a sensor on the side of the pot, which D-Lab reports ran up to 0.9 °C cooler than true ambient, so true decreases may be up to ~0.9 °C larger than measured.',
  bins: Object.fromEntries((Object.keys(bins) as Bin[]).map((b) => [b, {
    studyMonths: bins[b].months,
    predictedMeanDrop: avg(bins[b].mean),
    predictedMaxDrop: avg(bins[b].max),
    measuredMeanDrop: b === 'mid' ? null : measured[b].mean,
    measuredMaxDrop: b === 'mid' ? null : measured[b].max,
  }])),
};
writeFileSync('src/data/validation.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));

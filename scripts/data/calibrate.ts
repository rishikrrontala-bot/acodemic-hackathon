/**
 * Calibrate the cooler's evaporative efficiency against MIT D-Lab's measurements in Mali.
 *
 * Source: MIT D-Lab / CITE, "Evaporative Cooling Technologies for Improved Vegetable Storage in
 * Mali", Executive Summary (2018), table "Summary of key characteristics for each evaporative
 * cooling device" (data/raw/sources/dlab-mali-exec-summary.txt, lines 75-86):
 *   average temperature decrease  pot-in-pot 6.7 °C · round pot-in-dish 5.1 °C · cylinder pot-in-dish 4.7 °C
 *   conditions: ambient RH below 40 %, average daily ambient temperature 29-37 °C;
 *   households in the Mopti region and research facilities in the Bamako region, March-July 2017.
 * And D-Lab's clay pot cooler page: "a drop in temperature of greater than 8 °C can be achieved
 * in a real-world usage scenario" (upper end).
 *
 * The study's ambient conditions are reconstructed from NASA POWER climatology for Mopti and
 * Bamako in the study months that meet the table's stated conditions (RH2M < 40 %, 29 ≤ T2M ≤ 37).
 * ε = measured average decrease / modelled day-average wet-bulb depression.
 *
 * Run: npx tsx scripts/data/calibrate.ts   → writes src/data/calibration.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { humidityRatioFromSpecificHumidity, wetBulb } from '../../src/domain/psychro';

type Town = { n: string; cc: string; m: Record<string, number[]> };
const climate = JSON.parse(readFileSync('public/data/climate.json', 'utf8')) as { towns: Town[] };

const STUDY_MONTHS = [2, 3, 4, 5, 6]; // March-July (0-based)
const rows: Array<{ town: string; month: number; T: number; RH: number; depression: number }> = [];
for (const name of ['Mopti', 'Bamako']) {
  const t = climate.towns.find((x) => x.n === name && x.cc === 'ML');
  if (!t) throw new Error(`missing ${name}`);
  for (const i of STUDY_MONTHS) {
    const T = t.m.T![i]!;
    const RH = t.m.RH![i]!;
    if (RH >= 40 || T < 29 || T > 37) continue;
    const w = humidityRatioFromSpecificHumidity(t.m.Q![i]!);
    const depression = T - wetBulb(T, w, t.m.P![i]!);
    rows.push({ town: name, month: i, T, RH, depression });
  }
}
if (!rows.length) throw new Error('no study-condition months found');
const meanDepression = rows.reduce((s, r) => s + r.depression, 0) / rows.length;

const measured = { low: 4.7, mid: 6.7, high: 8.0 };
const round3 = (x: number) => Math.round(x * 1000) / 1000;
const calibration = {
  efficiency: {
    low: round3(measured.low / meanDepression),
    mid: round3(measured.mid / meanDepression),
    high: round3(measured.high / meanDepression),
  },
  measuredDecreaseC: measured,
  meanWetBulbDepressionC: Math.round(meanDepression * 100) / 100,
  studyConditions: rows.map((r) => ({ ...r, depression: Math.round(r.depression * 100) / 100 })),
  sources: [
    'MIT D-Lab/CITE, Evaporative Cooling Technologies for Improved Vegetable Storage in Mali, Executive Summary (2018)',
    'MIT D-Lab, Clay Pot Coolers research page: "a drop in temperature of greater than 8 degrees Celsius"',
    'NASA POWER climatology 2001-2020 (Mopti, Bamako)',
  ],
};
writeFileSync('src/data/calibration.json', JSON.stringify(calibration, null, 2) + '\n');
console.log(JSON.stringify(calibration, null, 2));

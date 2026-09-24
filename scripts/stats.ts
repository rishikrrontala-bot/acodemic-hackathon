/**
 * Every number the README and Devpost page quote comes from here, so they can be reproduced:
 *   npx tsx scripts/stats.ts
 */
import { readFileSync } from 'node:fs';
import calibration from '../src/data/calibration.json';
import { EFFICIENCY, modelYear, summarise } from '../src/domain/cooler';
import { SUITED } from '../src/domain/crops';
import { q10Range, shelfMultiplier } from '../src/domain/shelf';
import { monthsOf, type TownRecord } from '../src/domain/towns';

const { meta, towns } = JSON.parse(readFileSync('public/data/climate.json', 'utf8')) as { meta: { period: string[] }; towns: TownRecord[] };
const countries = new Set(towns.map((t) => t.cc));
const models = towns.map((t) => ({ t, y: modelYear(monthsOf(t)) }));
const worksAny = models.filter((m) => m.y.some((x) => x.verdict === 'works'));
const worksNone = models.filter((m) => !m.y.some((x) => x.verdict === 'works'));
const worksMonths = models.map((m) => summarise(m.y).worksMonths.length);
const byMonth = Array.from({ length: 12 }, (_, i) => models.filter((m) => m.y[i]!.verdict === 'works').length);

const fmt = (x: number, d = 1) => x.toFixed(d);
const mopti = models.find((m) => m.t.n === 'Mopti')!;
const mar = mopti.y[2]!;
const aug = mopti.y[7]!;
const tomato = SUITED.find((c) => c.id === 'tomato')!;
const tomMar = shelfMultiplier(mar.dropMean, q10Range(tomato));

console.log(JSON.stringify({
  climatePeriod: meta.period,
  towns: towns.length,
  countries: countries.size,
  efficiency: EFFICIENCY,
  calibration: { measured: calibration.measuredDecreaseC, meanDepression: calibration.meanWetBulbDepressionC },
  townsWithAtLeastOneWorkingMonth: worksAny.length,
  townsWithNoWorkingMonth: worksNone.length,
  medianWorkingMonths: [...worksMonths].sort((a, b) => a - b)[Math.floor(worksMonths.length / 2)],
  townsWorkingEveryMonth: worksMonths.filter((n) => n === 12).length,
  townsWorkingPerMonth: byMonth,
  mopti: {
    worksMonths: summarise(mopti.y).worksMonths.length,
    march: { airMean: fmt(mar.outsideMean), insideMean: fmt(mar.insideMean.mid), dropMean: [fmt(mar.dropMean.low), fmt(mar.dropMean.mid), fmt(mar.dropMean.high)], airPeak: fmt(mar.outsidePeak), insidePeak: fmt(mar.insidePeak.mid), dropPeak: fmt(mar.dropPeak.mid), rhPeak: fmt(mar.humidityPeak, 0), verdict: mar.verdict, tomatoShelf: [fmt(tomMar.low, 2), fmt(tomMar.mid, 2), fmt(tomMar.high, 2)] },
    august: { dropMean: fmt(aug.dropMean.mid), rhPeak: fmt(aug.humidityPeak, 0), verdict: aug.verdict },
  },
  cropQ10: Object.fromEntries(SUITED.map((c) => [c.id, c.q10 ?? 'Kader 2-3'])),
}, null, 2));

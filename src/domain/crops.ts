/**
 * What goes in the pot, and what must not. Every number is from USDA Agriculture Handbook 66,
 * "The Commercial Storage of Fruits, Vegetables, and Florist and Nursery Stocks" (Gross, Wang &
 * Saltveit, eds., 2016); the downloaded text is data/raw/sources/usda-hb66.txt.
 *
 *  - storage group: HB66 "Compatible fresh fruits and vegetables during 7-day storage"
 *    (Thompson et al. 1996): group 1 = 0–2 °C, 90–98 % RH; group 2 = 7–10 °C, 85–95 % RH;
 *    group 3 = 13–18 °C, 85–95 % RH.
 *  - lowest safe temperature: HB66 "Fresh produce susceptible to chilling injury".
 *  - respiration (mg CO₂ kg⁻¹ h⁻¹): HB66 table 1 "Rates of respiration and ethylene production".
 *    q10 is the ratio across the warmest 10 °C step the table reports; Kader (2002) notes that
 *    deterioration generally tracks respiration, so Zeer uses it as the crop's shelf-life Q10.
 *
 * An evaporative cooler never reaches these optimum temperatures in hot weather. What matters is
 * that every degree closer slows spoilage, and that the pot's humid air (MIT D-Lab measured
 * 80–100 % RH inside pot-in-pot coolers) suits crops that wilt and spoils crops that must stay dry.
 */
export type CropId =
  | 'tomato' | 'okra' | 'greens' | 'pepper' | 'eggplant' | 'cucumber' | 'cabbage' | 'carrot' | 'mango'
  | 'onion' | 'dryGoods' | 'dairy' | 'medicine';

export type StorageGroup = 1 | 2 | 3;

export const GROUPS: Record<StorageGroup, { tempC: [number, number]; rh: [number, number] }> = {
  1: { tempC: [0, 2], rh: [90, 98] },
  2: { tempC: [7, 10], rh: [85, 95] },
  3: { tempC: [13, 18], rh: [85, 95] },
};

export interface Crop {
  id: CropId;
  suited: boolean;
  group?: StorageGroup;
  /** HB66 lowest safe temperature (°C) for chilling-sensitive crops. */
  chillBelowC?: number;
  /** Shelf-life temperature coefficient from HB66 respiration rates; null = no usable data. */
  q10?: number | null;
  /** HB66 respiration pair used for q10: [lower °C, rate, upper °C, rate]. */
  respiration?: [number, number, number, number];
  reason?: 'needsDry' | 'unsafe' | 'coldChain';
}

const q = (lo: number, a: number, hi: number, b: number) => ({
  respiration: [lo, a, hi, b] as [number, number, number, number],
  q10: Math.round(Math.pow(b / a, 10 / (hi - lo)) * 100) / 100,
});

export const CROPS: Crop[] = [
  { id: 'tomato', suited: true, group: 3, chillBelowC: 10, ...q(15, 22, 25, 43) },
  { id: 'okra', suited: true, group: 2, chillBelowC: 7, ...q(15, 146, 25, 345) },
  { id: 'greens', suited: true, group: 1, ...q(10, 110, 20, 230) }, // HB66 spinach row
  { id: 'pepper', suited: true, group: 2, chillBelowC: 7, ...q(10, 12, 20, 34) },
  { id: 'eggplant', suited: true, group: 2, chillBelowC: 7, q10: null }, // HB66 lists 15 °C only
  { id: 'cucumber', suited: true, group: 2, chillBelowC: 7, ...q(15, 29, 25, 37) },
  { id: 'cabbage', suited: true, group: 1, ...q(15, 28, 25, 62) },
  { id: 'carrot', suited: true, group: 1, q10: null }, // HB66 row is not monotonic above 15 °C
  { id: 'mango', suited: true, group: 2, chillBelowC: 13, ...q(10, 35, 20, 113) },
  { id: 'onion', suited: false, reason: 'needsDry' }, // HB66: dry onions keep at 65–75 % RH
  { id: 'dryGoods', suited: false, reason: 'needsDry' },
  { id: 'dairy', suited: false, reason: 'unsafe' },
  { id: 'medicine', suited: false, reason: 'coldChain' },
];

export const SUITED = CROPS.filter((c) => c.suited);
export const UNSUITED = CROPS.filter((c) => !c.suited);

export function cropById(id: CropId): Crop {
  const c = CROPS.find((x) => x.id === id);
  if (!c) throw new Error(`unknown crop ${id}`);
  return c;
}

/**
 * What goes in the pot, and what must not.
 *
 * Storage conditions are the recommended commercial storage temperature and relative humidity
 * from USDA Agriculture Handbook 66, "The Commercial Storage of Fruits, Vegetables, and Florist
 * and Nursery Stocks" (Gross, Wang & Saltveit, eds., 2016), cross-checked with the UC Davis
 * Postharvest Technology Center produce facts. An evaporative cooler never reaches those optimum
 * temperatures in hot weather; what matters is that every degree closer slows spoilage, and that
 * the pot's humid air (MIT D-Lab measured > 80 % RH inside) suits crops that wilt, and rots crops
 * that must stay dry.
 */
export type CropId =
  | 'tomato' | 'okra' | 'greens' | 'pepper' | 'eggplant' | 'cucumber' | 'carrot' | 'cabbage' | 'mango'
  | 'onion' | 'garlic' | 'grain' | 'dairy' | 'medicine';

export interface Crop {
  id: CropId;
  /** true: store in the pot. false: never store in the pot (see reason). */
  suited: boolean;
  /** Recommended storage temperature band, °C (for suited crops). */
  optimumC?: [number, number];
  /** Recommended relative humidity band, % (for suited crops). */
  rh?: [number, number];
  /** Chilling injury below this temperature, °C (chilling-sensitive crops only). */
  chillBelowC?: number;
  /** Why not, for unsuited items: key into the i18n "reasons" table. */
  reason?: 'needsDry' | 'unsafe' | 'coldChain';
}

export const CROPS: Crop[] = [
  { id: 'tomato', suited: true, optimumC: [10, 13], rh: [90, 95], chillBelowC: 10 },
  { id: 'okra', suited: true, optimumC: [7, 10], rh: [90, 95], chillBelowC: 7 },
  { id: 'greens', suited: true, optimumC: [0, 2], rh: [95, 100] },
  { id: 'pepper', suited: true, optimumC: [7, 10], rh: [90, 95], chillBelowC: 7 },
  { id: 'eggplant', suited: true, optimumC: [10, 12], rh: [90, 95], chillBelowC: 10 },
  { id: 'cucumber', suited: true, optimumC: [10, 12], rh: [85, 90], chillBelowC: 10 },
  { id: 'carrot', suited: true, optimumC: [0, 1], rh: [98, 100] },
  { id: 'cabbage', suited: true, optimumC: [0, 1], rh: [98, 100] },
  { id: 'mango', suited: true, optimumC: [13, 13], rh: [85, 90], chillBelowC: 13 },
  { id: 'onion', suited: false, reason: 'needsDry' },
  { id: 'garlic', suited: false, reason: 'needsDry' },
  { id: 'grain', suited: false, reason: 'needsDry' },
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

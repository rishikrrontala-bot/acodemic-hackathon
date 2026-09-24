/** App state: one object, change listeners, and a shareable URL hash (#t=…&m=…&c=…). */
import type { CropId } from '../domain/crops';
import { CROPS } from '../domain/crops';
import type { TownRecord } from '../domain/towns';
import type { Lang } from '../i18n';
import type { Unit } from './format';

export interface State {
  town: TownRecord;
  month: number; // 0-11
  crop: CropId;
  lang: Lang;
  unit: Unit;
  litres: number;
  baselineDays: number;
  /** Set when "Use my location" picked the nearest town. */
  nearestKm: number | null;
}

type Listener = (s: State, prev: State) => void;

export class Store {
  private listeners: Listener[] = [];
  constructor(public state: State) {}

  set(patch: Partial<State>): void {
    const prev = this.state;
    this.state = { ...prev, ...patch };
    for (const l of this.listeners) l(this.state, prev);
  }

  subscribe(l: Listener): void {
    this.listeners.push(l);
  }
}

export interface HashState {
  townId?: number;
  month?: number;
  crop?: CropId;
  lang?: Lang;
  unit?: Unit;
}

export function parseHash(hash: string): HashState {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const out: HashState = {};
  const t = Number(p.get('t'));
  if (Number.isInteger(t) && t > 0) out.townId = t;
  const m = Number(p.get('m'));
  if (Number.isInteger(m) && m >= 1 && m <= 12) out.month = m - 1;
  const c = p.get('c');
  if (c && CROPS.some((x) => x.id === c && x.suited)) out.crop = c as CropId;
  const l = p.get('l');
  if (l === 'en' || l === 'fr' || l === 'es') out.lang = l;
  const u = p.get('u');
  if (u === 'C' || u === 'F') out.unit = u;
  return out;
}

export function toHash(s: State): string {
  const p = new URLSearchParams({ t: String(s.town.id), m: String(s.month + 1), c: s.crop, l: s.lang, u: s.unit });
  return `#${p.toString()}`;
}

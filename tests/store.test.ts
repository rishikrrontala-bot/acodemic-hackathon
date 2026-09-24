import { describe, expect, it } from 'vitest';
import { parseHash, toHash, Store, type State } from '../src/app/store';

const town = { id: 2453348, n: 'Mopti', a: [], cc: 'ML', c: 'Mali', lat: 14.5, lon: -4.2, p: 1, m: {} } as never;
const base: State = { town, month: 2, crop: 'tomato', lang: 'en', unit: 'C', litres: 50, baselineDays: 3, nearestKm: null };

describe('URL hash state', () => {
  it('round-trips the shareable fields', () => {
    const h = toHash(base);
    expect(h).toBe('#t=2453348&m=3&c=tomato&l=en&u=C');
    expect(parseHash(h)).toEqual({ townId: 2453348, month: 2, crop: 'tomato', lang: 'en', unit: 'C' });
  });

  it('ignores junk and unsuited crops', () => {
    expect(parseHash('#t=abc&m=13&c=onion&l=de&u=K')).toEqual({});
    expect(parseHash('')).toEqual({});
  });
});

describe('Store', () => {
  it('notifies listeners with the previous state', () => {
    const st = new Store(base);
    let seen: [number, number] | null = null;
    st.subscribe((s, prev) => (seen = [prev.month, s.month]));
    st.set({ month: 7 });
    expect(seen).toEqual([2, 7]);
    expect(st.state.crop).toBe('tomato');
  });
});

/**
 * Where it works: every bundled town on an Equal Earth map, marked by this month's verdict.
 * Loaded lazily (d3-geo + Natural Earth land, ~60 kB) once the section nears the viewport.
 */
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';
import type { TownRecord } from '../domain/towns';
import { LANGS, monthNames } from '../i18n';
import { h, s, setText } from './dom';
import { townModel } from './derive';
import type { Store } from './store';

const W = 960;
const H = 470;

export function mountMap(host: HTMLElement, store: Store, towns: TownRecord[], count: HTMLElement, legend: HTMLElement): void {
  const topo = land110 as unknown as Topology<{ land: GeometryCollection }>;
  const land = feature(topo, topo.objects.land);
  const proj = geoEqualEarth().fitExtent([[8, 8], [W - 8, H - 8]], land);
  const path = geoPath(proj);
  const title = s('title', {});
  const dots = s('g', { class: 'map-dots' });
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'map', role: 'img' }, title,
    s('path', { d: path({ type: 'Sphere' }) ?? '', class: 'map-sphere' }),
    s('path', { d: path(land) ?? '', class: 'map-land' }),
    dots);
  const marks = towns.map((t) => {
    const [x, y] = proj([t.lon, t.lat]) ?? [0, 0];
    const c = s('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 4, class: 'map-dot', 'data-id': t.id });
    const tip = s('title', {});
    c.append(tip);
    dots.append(c);
    return { t, c, tip };
  });
  host.replaceChildren(svg);

  dots.addEventListener('click', (e) => {
    const el = (e.target as Element).closest('circle');
    if (!el) return;
    const t = towns.find((x) => x.id === Number(el.getAttribute('data-id')));
    if (t) {
      store.set({ town: t, nearestKm: null });
      document.getElementById('town')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  function render() {
    const st = store.state;
    const d = LANGS[st.lang];
    const names = monthNames(st.lang, 'long');
    let works = 0;
    for (const { t, c, tip } of marks) {
      const v = townModel(t).year[st.month]!.verdict;
      if (v === 'works') works++;
      c.setAttribute('data-verdict', v);
      c.classList.toggle('is-town', t.id === st.town.id);
      setText(tip, `${t.n}, ${t.c}: ${d.verdict[v]}`);
    }
    setText(title, d.mapAlt(names[st.month]!, works, towns.length));
    setText(count, d.mapCount(works, towns.length));
    legend.replaceChildren(...(['works', 'some', 'humid', 'mild'] as const).map((v) =>
      h('span', { class: 'legend-item', 'data-verdict': v }, h('span', { class: `map-key map-key-${v}`, 'aria-hidden': 'true' }), d.verdict[v])));
  }
  store.subscribe((s2, prev) => {
    if (s2.month !== prev.month || s2.town.id !== prev.town.id || s2.lang !== prev.lang) render();
  });
  render();
}

/**
 * The year strip: twelve months across, each a dumbbell from the air's day-average temperature
 * (tomato) down to the inside of the pot (indigo), over a band that says whether the month works.
 * Each column is a radio button: click, arrow keys, or drag across the year to scrub.
 */
import { LANGS, monthNames } from '../i18n';
import { h, s, setText } from './dom';
import { temp, toUnit } from './format';
import { townModel } from './derive';
import type { Store } from './store';

const H = 160; // column drawing height (viewBox units)
const PAD = 12;

export function createYear(store: Store): HTMLElement {
  const title = h('h2', { class: 'section-title', id: 'year-title' });
  const help = h('p', { class: 'section-help' });
  const legendOut = h('span', { class: 'legend-text' });
  const legendIn = h('span', { class: 'legend-text' });
  const legend = h('p', { class: 'legend' },
    h('span', { class: 'legend-item' }, h('span', { class: 'dot dot-out', 'aria-hidden': 'true' }), legendOut),
    h('span', { class: 'legend-item' }, h('span', { class: 'dot dot-in', 'aria-hidden': 'true' }), legendIn));

  const axis = h('div', { class: 'axis', 'aria-hidden': 'true' });
  const grid = s('svg', { class: 'gridlines', viewBox: `0 0 100 ${H}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  const group = h('div', { class: 'months', role: 'radiogroup', 'aria-labelledby': 'year-title' });
  const tip = h('div', { class: 'tip', role: 'presentation', hidden: true });
  const strip = h('div', { class: 'strip' }, axis, h('div', { class: 'months-wrap' }, grid, group, tip));

  const tableBody = h('tbody');
  const tableHead = h('tr');
  const summary = h('summary');
  const table = h('details', { class: 'numbers' }, summary,
    h('div', { class: 'table-scroll' }, h('table', { class: 'num-table' }, h('thead', {}, tableHead), tableBody)));

  const cols = Array.from({ length: 12 }, (_, i) => {
    // Dots are zero-length round-capped lines with non-scaling strokes, so they stay circles
    // while the column stretches to whatever width the screen gives it.
    const line = s('line', { class: 'db-line', x1: 20, x2: 20 });
    const ringOut = s('line', { class: 'db-ring', x1: 20, x2: 20 });
    const ringIn = s('line', { class: 'db-ring', x1: 20, x2: 20 });
    const out = s('line', { class: 'db-out', x1: 20, x2: 20 });
    const inn = s('line', { class: 'db-in', x1: 20, x2: 20 });
    const svg = s('svg', { viewBox: `0 0 40 ${H}`, class: 'db', 'aria-hidden': 'true', preserveAspectRatio: 'none' }, line, ringOut, ringIn, out, inn);
    const band = h('span', { class: 'band', 'aria-hidden': 'true' });
    const lab = h('span', { class: 'mlabel', 'aria-hidden': 'true' });
    const now = h('span', { class: 'now', 'aria-hidden': 'true' });
    const btn = h('button', { type: 'button', role: 'radio', class: 'month', 'data-m': i }, now, svg, band, lab);
    group.append(btn);
    return { btn, line, ringOut, ringIn, out, inn, band, lab, now };
  });

  const section = h('section', { class: 'year', 'aria-labelledby': 'year-title' }, title, help, legend, strip, table);

  // ---- interaction
  const setMonth = (m: number) => {
    if (m !== store.state.month) store.set({ month: m });
  };
  group.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.month');
    if (b) setMonth(Number(b.dataset.m));
  });
  group.addEventListener('keydown', (e) => {
    const m = store.state.month;
    let next = m;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (m + 1) % 12;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (m + 11) % 12;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 11;
    else return;
    e.preventDefault();
    setMonth(next);
    cols[next]!.btn.focus();
  });

  const indexAt = (clientX: number) => {
    const r = group.getBoundingClientRect();
    return Math.max(0, Math.min(11, Math.floor(((clientX - r.left) / r.width) * 12)));
  };
  let dragging = false;
  group.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    group.setPointerCapture(e.pointerId);
    setMonth(indexAt(e.clientX));
  });
  group.addEventListener('pointermove', (e) => {
    const i = indexAt(e.clientX);
    if (dragging) setMonth(i);
    if (e.pointerType === 'mouse') showTip(i);
  });
  const endDrag = () => { dragging = false; };
  group.addEventListener('pointerup', endDrag);
  group.addEventListener('pointercancel', endDrag);
  group.addEventListener('pointerleave', () => { tip.hidden = true; });

  function showTip(i: number) {
    const st = store.state;
    const d = LANGS[st.lang];
    const m = townModel(st.town).year[i]!;
    const names = monthNames(st.lang, 'short');
    tip.replaceChildren(
      h('strong', {}, names[i]!),
      h('span', {}, `${d.legendOutside}: ${temp(m.outsideMean, st.unit, st.lang)}`),
      h('span', {}, `${d.legendInside}: ${temp(m.insideMean.mid, st.unit, st.lang)}`),
      h('span', { class: 'tip-verdict' }, d.verdict[m.verdict]));
    tip.hidden = false;
    tip.style.setProperty('--x', `${((i + 0.5) / 12) * 100}%`);
    tip.classList.toggle('flip', i > 8);
  }

  // ---- render
  function render() {
    const st = store.state;
    const d = LANGS[st.lang];
    const model = townModel(st.town);
    const namesNarrow = monthNames(st.lang, 'narrow');
    const namesShort = monthNames(st.lang, 'short');
    const namesLong = monthNames(st.lang, 'long');
    setText(title, d.yearTitle);
    setText(help, d.yearHelp);
    setText(legendOut, d.legendOutside);
    setText(legendIn, d.legendInside);
    setText(summary, d.showNumbers);

    // one scale for the whole year, in the reader's unit
    const vals = model.year.flatMap((m) => [m.outsideMean, m.insideMean.mid]);
    const step = st.unit === 'C' ? 5 : 10;
    const lo = Math.floor((toUnit(Math.min(...vals), st.unit) - 1) / step) * step;
    const hi = Math.ceil((toUnit(Math.max(...vals), st.unit) + 1) / step) * step;
    const y = (c: number) => PAD + ((hi - toUnit(c, st.unit)) / (hi - lo)) * (H - 2 * PAD);
    const yu = (u: number) => PAD + ((hi - u) / (hi - lo)) * (H - 2 * PAD);

    grid.replaceChildren();
    axis.replaceChildren();
    for (let v = lo; v <= hi; v += step) {
      grid.append(s('line', { x1: 0, x2: 100, y1: yu(v), y2: yu(v), class: 'grid-line' }));
      axis.append(h('span', { class: 'tick', style: `--y:${(yu(v) / H) * 100}%` }, `${v}°`));
    }

    const today = new Date().getMonth();
    model.year.forEach((m, i) => {
      const c = cols[i]!;
      const yo = y(m.outsideMean);
      const yi = y(m.insideMean.mid);
      c.line.setAttribute('y1', String(yo));
      c.line.setAttribute('y2', String(yi));
      for (const [el, yy] of [[c.ringOut, yo], [c.out, yo], [c.ringIn, yi], [c.inn, yi]] as const) {
        el.setAttribute('y1', String(yy));
        el.setAttribute('y2', String(yy));
      }
      c.band.dataset.verdict = m.verdict;
      c.lab.replaceChildren(h('span', { class: 'm-narrow' }, namesNarrow[i]!), h('span', { class: 'm-short' }, namesShort[i]!));
      const sel = i === st.month;
      c.btn.setAttribute('aria-checked', String(sel));
      c.btn.tabIndex = sel ? 0 : -1;
      c.btn.setAttribute('aria-label', d.monthButton(namesLong[i]!, d.verdict[m.verdict], temp(m.outsideMean, st.unit, st.lang), temp(m.insideMean.mid, st.unit, st.lang)));
      c.now.hidden = i !== today;
      setText(c.now, d.now);
    });

    tableHead.replaceChildren(...[d.tableMonth, d.tableAir, d.tableInside, d.tablePeakAir, d.tablePeakInside, d.tableRH, d.tableVerdict]
      .map((x) => h('th', { scope: 'col' }, x)));
    tableBody.replaceChildren(...model.year.map((m, i) => h('tr', { class: i === st.month ? 'is-sel' : '' },
      h('th', { scope: 'row' }, namesLong[i]!),
      h('td', {}, temp(m.outsideMean, st.unit, st.lang)),
      h('td', {}, temp(m.insideMean.mid, st.unit, st.lang)),
      h('td', {}, temp(m.outsidePeak, st.unit, st.lang)),
      h('td', {}, temp(m.insidePeak.mid, st.unit, st.lang)),
      h('td', {}, `${Math.round(m.humidityPeak)}%`),
      h('td', {}, d.verdict[m.verdict]))));
  }
  store.subscribe(render);
  render();
  return section;
}

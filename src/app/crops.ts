/**
 * The crop calendar: crops down the side, months across (a real <table>), each cell a bar for how
 * many times longer the crop keeps in the pot. Only the selected month's column carries numbers;
 * the rest are bars with the value in their accessible text.
 */
import { SUITED, UNSUITED } from '../domain/crops';
import { chillingRisk, daysInPot } from '../domain/shelf';
import { LANGS, monthNames } from '../i18n';
import { h, setText } from './dom';
import { mult, num, temp } from './format';
import { cropOf, townModel } from './derive';
import type { Store } from './store';

export function createCrops(store: Store): HTMLElement {
  const title = h('h2', { class: 'section-title', id: 'crops-title' });
  const help = h('p', { class: 'section-help' });
  const caption = h('caption', { class: 'visually-hidden' });
  const headRow = h('tr');
  const body = h('tbody');
  const table = h('table', { class: 'crop-table' }, caption, h('thead', {}, headRow), body);

  const detailName = h('h3', { class: 'crop-name' });
  const detailGain = h('p', { class: 'crop-gain' });
  const baseLabel = h('label', { for: 'baseline', class: 'baseline-label' });
  const baseInput = h('input', { id: 'baseline', type: 'number', min: 1, max: 30, step: 1, inputmode: 'numeric', class: 'num-input' }) as HTMLInputElement;
  const baseUnit = h('span', { class: 'baseline-unit' });
  const inPot = h('p', { class: 'in-pot', 'aria-live': 'polite' });
  const notes = h('ul', { class: 'crop-notes' });
  const detail = h('div', { class: 'crop-detail' }, detailName, detailGain,
    h('p', { class: 'baseline' }, baseLabel, h('span', { class: 'baseline-field' }, baseInput, baseUnit)), inPot, notes);

  const keepTitle = h('h3', { class: 'keep-title' });
  const keepList = h('ul', { class: 'keep-list' });

  const section = h('section', { class: 'crops', 'aria-labelledby': 'crops-title' },
    title, help, h('div', { class: 'table-scroll crop-scroll' }, table),
    h('div', { class: 'crop-lower' }, detail, h('div', { class: 'keep' }, keepTitle, keepList)));

  body.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-crop]');
    if (b) store.set({ crop: b.dataset.crop as never });
  });
  baseInput.addEventListener('input', () => {
    const v = Number(baseInput.value);
    if (Number.isFinite(v) && v >= 1 && v <= 30) store.set({ baselineDays: Math.round(v) });
  });

  function render() {
    const st = store.state;
    const d = LANGS[st.lang];
    const model = townModel(st.town);
    const short = monthNames(st.lang, 'short');
    const narrow = monthNames(st.lang, 'narrow');
    const long = monthNames(st.lang, 'long');
    setText(title, d.cropsTitle);
    setText(help, d.cropsHelp(long[st.month]!));
    setText(caption, d.cropsCaption);

    headRow.replaceChildren(h('th', { scope: 'col', class: 'crop-col' }, h('span', { class: 'visually-hidden' }, d.cropsCaption)),
      ...short.map((m, i) => h('th', { scope: 'col', class: `mcol${i === st.month ? ' is-sel' : ''}`, abbr: long[i]! },
        h('span', { class: 'm-narrow', 'aria-hidden': 'true' }, narrow[i]!), h('span', { class: 'm-short' }, m))));

    const max = Math.max(1.5, model.maxMultiplier);
    body.replaceChildren(...SUITED.map((c) => {
      const row = model.shelf.get(c.id)!;
      const sel = c.id === st.crop;
      return h('tr', { class: sel ? 'is-crop' : '' },
        h('th', { scope: 'row', class: 'crop-col' },
          h('button', { type: 'button', class: 'crop-btn', 'data-crop': c.id, 'aria-pressed': sel ? 'true' : 'false' }, d.crop[c.id]!)),
        ...row.map((r, i) => {
          const w = Math.max(0, Math.min(1, (r.mid - 1) / (max - 1)));
          const v = d.times(mult(r.mid, st.lang));
          return h('td', { class: `cell${i === st.month ? ' is-sel' : ''}` },
            h('span', { class: 'bar', style: `--w:${w.toFixed(3)}`, 'aria-hidden': 'true' }),
            h('span', { class: i === st.month ? 'cell-val' : 'visually-hidden' }, v));
        }));
    }));

    // selected crop detail
    const crop = cropOf(st.crop);
    const r = model.shelf.get(crop.id)![st.month]!;
    const m = model.year[st.month]!;
    setText(detailName, `${d.crop[crop.id]} · ${long[st.month]}`);
    setText(detailGain, d.timesRange(mult(r.low, st.lang), mult(r.high, st.lang)));
    setText(baseLabel, d.baselineLabel(d.cropLower[crop.id] ?? d.crop[crop.id]!.toLowerCase()));
    if (document.activeElement !== baseInput) baseInput.value = String(st.baselineDays);
    setText(baseUnit, d.daysUnit);
    const days = daysInPot(st.baselineDays, r);
    const lo = Math.max(st.baselineDays, Math.round(days.low));
    const hi = Math.max(lo, Math.round(days.high));
    setText(inPot, d.inPot(lo === hi ? num(lo, st.lang) : `${num(lo, st.lang)}–${num(hi, st.lang)}`));
    const notesArr: string[] = [];
    notesArr.push(crop.q10 ? d.q10Note(mult(crop.q10, st.lang)) : d.q10Generic);
    notesArr.push(d.cropHumidity);
    if (crop.chillBelowC !== undefined && chillingRisk(crop, m.insideMean.low)) notesArr.unshift(d.chillWarn(temp(crop.chillBelowC, st.unit, st.lang)));
    else if (crop.chillBelowC !== undefined) notesArr.push(d.chillWarn(temp(crop.chillBelowC, st.unit, st.lang)));
    notes.replaceChildren(...notesArr.map((n) => h('li', {}, n)));

    setText(keepTitle, d.keepOutTitle);
    keepList.replaceChildren(...UNSUITED.map((c) => h('li', {},
      h('strong', {}, d.crop[c.id]!), ' ', h('span', {}, d.reason[c.reason!]!))));
  }
  store.subscribe(render);
  render();
  return section;
}

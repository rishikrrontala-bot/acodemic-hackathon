/**
 * The station column: which town, what the year looks like there, what this month does, and the pot.
 * The town field is an ARIA 1.2 editable combobox with a listbox popup.
 */
import { nearestTown, searchTowns, type TownRecord } from '../domain/towns';
import { LANGS, monthNames } from '../i18n';
import { h, id, setText } from './dom';
import { deltaRange, delta, temp } from './format';
import { runsText, townModel } from './derive';
import { createPot } from './pot';
import type { Store } from './store';

export function createStation(store: Store, towns: TownRecord[]): HTMLElement {
  const listId = id('towns');
  const hintId = id('town-hint');
  const input = h('input', {
    id: 'town', type: 'text', role: 'combobox', autocomplete: 'off', spellcheck: 'false',
    'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': listId, 'aria-describedby': hintId,
    class: 'town-input',
  });
  const label = h('label', { for: 'town', class: 'town-label' });
  const list = h('ul', { id: listId, role: 'listbox', class: 'town-list', hidden: true });
  const hint = h('p', { id: hintId, class: 'town-hint' });
  const status = h('p', { class: 'visually-hidden', role: 'status', 'aria-live': 'polite' });
  const locate = h('button', { type: 'button', class: 'btn-quiet locate' });
  const nearestNote = h('p', { class: 'nearest', hidden: true });

  const headline = h('h2', { class: 'headline', 'aria-live': 'polite' });
  const nowText = h('span', { class: 'now-text' });
  const nowBtn = h('button', { type: 'button', class: 'btn-link now-btn' });
  const nowLine = h('p', { class: 'now-line' }, h('span', { class: 'now-dot', 'aria-hidden': 'true' }), nowText, ' ', nowBtn);

  const monthName = h('h3', { class: 'month-name' });
  const chip = h('span', { class: 'verdict-chip' }, h('span', { class: 'swatch', 'aria-hidden': 'true' }), h('span', { class: 'chip-text' }));
  const why = h('p', { class: 'verdict-why' });
  const bigNum = h('span', { class: 'big-num' });
  const bigLabel = h('span', { class: 'big-label' });
  const bigRange = h('span', { class: 'big-range' });
  const avgLine = h('p', { class: 'avg-line' });
  const pot = createPot();
  const potKey = h('ol', { class: 'pot-key' });
  const potKeyTitle = h('p', { class: 'visually-hidden' });

  const station = h('div', { class: 'station' },
    h('div', { class: 'town-field' },
      label,
      h('div', { class: 'town-row' },
        h('div', { class: 'combo' }, input, list),
        locate),
      hint, nearestNote, status),
    headline,
    nowLine,
    h('section', { class: 'month-now', 'aria-labelledby': 'month-name' },
      h('div', { class: 'month-head' }, Object.assign(monthName, { id: 'month-name' }), chip),
      h('p', { class: 'big' }, bigNum, h('span', { class: 'big-text' }, bigLabel, bigRange)),
      h('figure', { class: 'pot-figure' }, pot.root, potKeyTitle, potKey),
      why,
      avgLine),
  );
  nowBtn.addEventListener('click', () => store.set({ month: new Date().getMonth() }));

  // ---- combobox behaviour
  let options: TownRecord[] = [];
  let active = -1;
  const optId = (i: number) => `${listId}-o${i}`;
  const display = (t: TownRecord) => `${t.n}, ${t.c}`;

  function open(results: TownRecord[]) {
    options = results;
    active = results.length ? 0 : -1;
    list.replaceChildren(...results.map((t, i) =>
      h('li', { id: optId(i), role: 'option', class: 'town-option', 'aria-selected': i === active ? 'true' : 'false', 'data-i': i },
        h('span', { class: 'opt-name' }, t.n), h('span', { class: 'opt-country' }, t.c))));
    const d = LANGS[store.state.lang];
    if (!results.length && input.value.trim()) {
      list.replaceChildren(h('li', { class: 'town-empty', role: 'presentation' }, d.noMatch));
    }
    const show = input.value.trim().length > 0;
    list.hidden = !show;
    input.setAttribute('aria-expanded', String(show && results.length > 0));
    if (active >= 0) input.setAttribute('aria-activedescendant', optId(active));
    else input.removeAttribute('aria-activedescendant');
    setText(status, show ? d.results(results.length) : '');
  }
  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }
  function highlight(i: number) {
    active = (i + options.length) % options.length;
    list.querySelectorAll<HTMLElement>('[role=option]').forEach((li, k) => {
      li.setAttribute('aria-selected', k === active ? 'true' : 'false');
      if (k === active) li.scrollIntoView({ block: 'nearest' });
    });
    input.setAttribute('aria-activedescendant', optId(active));
  }
  function choose(t: TownRecord) {
    close();
    input.value = display(t);
    const m = townModel(t);
    store.set({ town: t, nearestKm: null, month: m.year[store.state.month]?.verdict === 'works' ? store.state.month : m.summary.best });
  }
  input.addEventListener('input', () => open(searchTowns(towns, input.value)));
  input.addEventListener('focus', () => input.select());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (list.hidden) open(searchTowns(towns, input.value));
      else if (options.length) highlight(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (options.length) highlight(active - 1);
    } else if (e.key === 'Enter') {
      if (!list.hidden && options[active]) {
        e.preventDefault();
        choose(options[active]!);
      }
    } else if (e.key === 'Escape') {
      if (!list.hidden) close();
      else input.value = display(store.state.town);
    }
  });
  input.addEventListener('blur', () => {
    setTimeout(() => {
      close();
      if (document.activeElement !== input) input.value = display(store.state.town);
    }, 120);
  });
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('[role=option]');
    if (li) choose(options[Number(li.dataset.i)]!);
  });

  locate.addEventListener('click', () => {
    const d = LANGS[store.state.lang];
    if (!('geolocation' in navigator)) {
      nearestNote.hidden = false;
      setText(nearestNote, d.locationFailed);
      return;
    }
    setText(locate, d.locating);
    locate.setAttribute('aria-busy', 'true');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const n = nearestTown(towns, pos.coords.latitude, pos.coords.longitude);
        locate.removeAttribute('aria-busy');
        if (n) {
          input.value = display(n.town);
          const m = townModel(n.town);
          store.set({ town: n.town, nearestKm: Math.round(n.km), month: m.summary.best });
        }
        render();
      },
      () => {
        locate.removeAttribute('aria-busy');
        nearestNote.hidden = false;
        setText(nearestNote, LANGS[store.state.lang].locationFailed);
        setText(locate, LANGS[store.state.lang].useLocation);
      },
      { timeout: 10000, maximumAge: 600000 },
    );
  });

  // ---- render
  function render() {
    const st = store.state;
    const d = LANGS[st.lang];
    const names = monthNames(st.lang, 'long');
    const model = townModel(st.town);
    const m = model.year[st.month]!;

    setText(label, d.townLabel);
    input.placeholder = d.townPlaceholder;
    if (document.activeElement !== input) input.value = display(st.town);
    setText(hint, d.townHint);
    if (locate.getAttribute('aria-busy') !== 'true') setText(locate, d.useLocation);
    nearestNote.hidden = st.nearestKm === null;
    if (st.nearestKm !== null) setText(nearestNote, d.nearest(st.town.n, st.nearestKm));

    const s = model.summary;
    let line: string;
    if (s.worksMonths.length) line = d.headlineWorks(st.town.n, s.worksMonths.length, runsText(s.worksMonths, names, d.runJoin, d.runTo));
    else if (s.someMonths.length) line = d.headlineSome(st.town.n, runsText(s.someMonths, names, d.runJoin, d.runTo));
    else if (model.year.every((x) => x.verdict === 'mild')) line = d.headlineMild(st.town.n);
    else line = d.headlineNever(st.town.n);
    setText(headline, line);

    // "now": the seller's real question is whether to build this month
    const today = new Date().getMonth();
    const tm = model.year[today]!;
    let nowStr = d.nowLine(names[today]!, d.verdict[tm.verdict].toLocaleLowerCase(st.lang));
    if (tm.verdict !== 'works' && s.worksMonths.length) {
      const next = Array.from({ length: 12 }, (_, k) => (today + 1 + k) % 12).find((k) => model.year[k]!.verdict === 'works');
      if (next !== undefined) nowStr += ` ${d.nowNext(names[next]!)}`;
    }
    setText(nowText, nowStr);
    nowLine.dataset.verdict = tm.verdict;
    nowBtn.hidden = st.month === today;
    setText(nowBtn, d.nowShow(names[today]!));

    const monthCap = names[st.month]!.charAt(0).toLocaleUpperCase(st.lang) + names[st.month]!.slice(1);
    setText(monthName, monthCap);
    station.querySelector('.month-now')!.setAttribute('data-verdict', m.verdict);
    chip.dataset.verdict = m.verdict;
    setText(chip.querySelector('.chip-text'), d.verdict[m.verdict]);
    setText(why, d.verdictWhy[m.verdict]);
    // hottest hours is the hero: it is what the pot drawing, the year strip and a thermometer show
    const peak = delta(m.dropPeak.mid, st.unit, st.lang);
    bigNum.replaceChildren(peak.replace('°', ''), h('span', { class: 'deg' }, '°'));
    setText(bigLabel, d.coolerPeak);
    setText(bigRange, d.rangeNote(deltaRange(m.dropPeak, st.unit, st.lang)));
    setText(avgLine, d.avgLine(delta(m.dropMean.mid, st.unit, st.lang)));
    setText(potKeyTitle, d.potKey);
    potKey.replaceChildren(...[d.potCloth, d.potInner, d.potSand, d.potOuter].map((x) => h('li', {}, x)));

    pot.update({
      air: temp(m.outsidePeak, st.unit, st.lang),
      inside: temp(m.insidePeak.mid, st.unit, st.lang),
      airLabel: d.potAir,
      insideLabel: d.potInside,
      strength: m.dropMean.mid / 8,
      labels: { sand: d.potSand, cloth: d.potCloth, inner: d.potInner, outer: d.potOuter },
      alt: d.potAlt(names[st.month]!, temp(m.outsidePeak, st.unit, st.lang), temp(m.insidePeak.mid, st.unit, st.lang),
        temp(m.outsideMean, st.unit, st.lang), temp(m.insideMean.mid, st.unit, st.lang)),
    });
  }
  store.subscribe(render);
  render();
  return station;
}

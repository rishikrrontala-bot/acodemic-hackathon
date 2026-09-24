/** "Is my pot working?": two thermometer readings → efficiency on a scale with the calibrated band. */
import { checkPot } from '../domain/check';
import { EFFICIENCY } from '../domain/cooler';
import { humidityRatioFromSpecificHumidity } from '../domain/psychro';
import { LANGS, monthNames } from '../i18n';
import { h, setText } from './dom';
import { num, temp } from './format';
import { townModel } from './derive';
import type { Store } from './store';

export function createCheck(store: Store): HTMLElement {
  const title = h('h2', { class: 'section-title', id: 'check-title', tabindex: '-1' });
  const intro = h('p', { class: 'section-help' });
  const airLabel = h('label', { for: 'check-air' });
  const inLabel = h('label', { for: 'check-in' });
  const air = h('input', { id: 'check-air', type: 'number', step: '0.5', inputmode: 'decimal', class: 'num-input', required: true }) as HTMLInputElement;
  const inside = h('input', { id: 'check-in', type: 'number', step: '0.5', inputmode: 'decimal', class: 'num-input', required: true }) as HTMLInputElement;
  const unitA = h('span', { class: 'unit' });
  const unitB = h('span', { class: 'unit' });
  const button = h('button', { type: 'submit', class: 'btn' });
  const humidity = h('p', { class: 'check-humidity' });
  const out = h('div', { class: 'check-out', 'aria-live': 'polite', hidden: true });
  const err = h('p', { class: 'check-error', id: 'check-error', role: 'alert', hidden: true });
  const form = h('form', { class: 'check-form', novalidate: true },
    h('div', { class: 'check-fields' },
      h('p', { class: 'field' }, airLabel, h('span', { class: 'input-unit' }, air, unitA)),
      h('p', { class: 'field' }, inLabel, h('span', { class: 'input-unit' }, inside, unitB))),
    err, humidity, button);
  const section = h('section', { class: 'check', id: 'check', 'aria-labelledby': 'check-title' }, title, intro, form, out);

  const fromUnit = (v: number) => (store.state.unit === 'C' ? v : ((v - 32) * 5) / 9);

  let checked = false;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run(true);
  });
  function run(fromSubmit: boolean) {
    const st = store.state;
    const d = LANGS[st.lang];
    const a = Number(air.value.replace(',', '.'));
    const b = Number(inside.value.replace(',', '.'));
    const badA = !air.value || !Number.isFinite(a);
    const badB = !inside.value || !Number.isFinite(b);
    air.setAttribute('aria-invalid', String(badA && fromSubmit));
    inside.setAttribute('aria-invalid', String(badB && fromSubmit));
    if (badA || badB) {
      if (fromSubmit) {
        err.hidden = false;
        setText(err, d.invalidNumber);
        air.setAttribute('aria-describedby', 'check-error');
        inside.setAttribute('aria-describedby', 'check-error');
        (badA ? air : inside).focus();
      }
      out.hidden = true;
      return;
    }
    err.hidden = true;
    air.removeAttribute('aria-describedby');
    inside.removeAttribute('aria-describedby');
    checked = true;
    out.hidden = false;
    const w = humidityRatioFromSpecificHumidity(st.town.m.Q[st.month]!);
    const r = checkPot(fromUnit(a), fromUnit(b), w, st.town.m.P[st.month]!);
    const scale = h('div', { class: 'eff-scale', 'aria-hidden': 'true' },
      h('span', { class: 'eff-band', style: `--a:${EFFICIENCY.low};--b:${EFFICIENCY.high}` }, h('span', { class: 'eff-band-label' }, d.checkBand)),
      r.efficiency !== null ? h('span', { class: 'eff-mark', style: `--x:${Math.max(0, Math.min(1, r.efficiency))}` }) : null,
      h('span', { class: 'eff-0' }, '0%'), h('span', { class: 'eff-100' }, '100%'));
    const parts: Node[] = [h('p', { class: `diag diag-${r.diagnosis}` }, d.diagnosis[r.diagnosis]!)];
    if (r.efficiency !== null) parts.push(h('p', { class: 'check-score' }, d.checkScore(`${num(Math.max(0, r.efficiency) * 100, st.lang)}%`)));
    out.replaceChildren(
      ...parts,
      scale,
      h('p', { class: 'check-expect' }, d.checkExpect(temp(r.expectedInside.low, st.unit, st.lang), temp(r.expectedInside.high, st.unit, st.lang))),
      h('p', { class: 'check-floor' }, d.checkFloor(temp(r.floor, st.unit, st.lang))));
  }

  function render() {
    const st = store.state;
    const d = LANGS[st.lang];
    const names = monthNames(st.lang, 'long');
    setText(title, d.checkTitle);
    setText(intro, d.checkIntro);
    setText(airLabel, d.checkAir);
    setText(inLabel, d.checkInside);
    setText(unitA, `°${st.unit}`);
    setText(unitB, `°${st.unit}`);
    setText(button, d.checkButton);
    setText(humidity, d.checkUsesHumidity(names[st.month]!, `${Math.round(townModel(st.town).year[st.month]!.humidityPeak)}%`));
  }
  store.subscribe((s, prev) => {
    render();
    if (!checked) return;
    // new town or month: same readings, re-judged against that month's air; new unit: readings are stale
    if (s.unit !== prev.unit) out.hidden = true;
    else if (s.town.id !== prev.town.id || s.month !== prev.month || s.lang !== prev.lang) run(false);
  });
  render();
  return section;
}

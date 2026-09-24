/** How Zeer knows, what it can't tell you, why it matters, and who built it. */
import validation from '../data/validation.json';
import { LANGS } from '../i18n';
import { h, setText } from './dom';
import { delta } from './format';
import type { Store } from './store';

const REPO = 'https://github.com/rishikrrontala-bot/acodemic-hackathon';

export function createAbout(store: Store): HTMLElement {
  const mTitle = h('h2', { class: 'section-title', id: 'method-title' });
  const mList = h('ol', { class: 'method-list' });
  const vTitle = h('h3', { class: 'valid-title' });
  const vIntro = h('p', { class: 'valid-intro' });
  const vHead = h('tr');
  const vBody = h('tbody');
  const vTable = h('table', { class: 'valid-table' }, h('thead', {}, vHead), vBody);
  const lTitle = h('h2', { class: 'section-title', id: 'limits-title' });
  const lList = h('ul', { class: 'limits-list' });
  const sTitle = h('h2', { class: 'section-title', id: 'sdg-title' });
  const sList = h('ul', { class: 'sdg-list' });
  const sTargets = h('p', { class: 'sdg-targets' });
  const el = h('div', { class: 'about' },
    h('section', { class: 'about-col', 'aria-labelledby': 'sdg-title' }, sTitle, sList, sTargets),
    h('section', { class: 'about-col', 'aria-labelledby': 'method-title' }, mTitle, mList,
      h('div', { class: 'valid' }, vTitle, vIntro, vTable)),
    h('section', { class: 'about-col', 'aria-labelledby': 'limits-title' }, lTitle, lList));
  function render() {
    const d = LANGS[store.state.lang];
    setText(mTitle, d.methodTitle);
    mList.replaceChildren(...d.method.map((x) => h('li', {}, x)));
    const st = store.state;
    setText(vTitle, d.validationTitle);
    setText(vIntro, d.validationIntro);
    vHead.replaceChildren(h('th', { scope: 'col' }, h('span', { class: 'visually-hidden' }, d.validationTitle)),
      h('th', { scope: 'col' }, d.validationModel), h('th', { scope: 'col' }, d.validationMeasured));
    const b = validation.bins;
    const rows: Array<[string, number, number]> = [
      [d.validationRows[0]!, b.humid.predictedMeanDrop!, b.humid.measuredMeanDrop!],
      [d.validationRows[1]!, b.humid.predictedMaxDrop!, b.humid.measuredMaxDrop!],
      [d.validationRows[2]!, b.dry.predictedMaxDrop!, b.dry.measuredMaxDrop!],
    ];
    vBody.replaceChildren(...rows.map(([label, model, meas]) => h('tr', {},
      h('th', { scope: 'row' }, label),
      h('td', {}, delta(model, st.unit, st.lang, 1)),
      h('td', {}, delta(meas, st.unit, st.lang, 1)))));
    setText(lTitle, d.limitsTitle);
    lList.replaceChildren(...d.limits.map((x) => h('li', {}, x)));
    setText(sTitle, d.sdgTitle);
    sList.replaceChildren(...d.sdg.map((x) => h('li', {}, x)));
    setText(sTargets, d.sdgTargets);
  }
  store.subscribe(render);
  render();
  return el;
}

export function createFooter(store: Store): HTMLElement {
  const credit = h('p', { class: 'credit' });
  const line = h('p', { class: 'credit-line' });
  const link = h('a', { href: REPO, class: 'repo-link', rel: 'noopener' });
  const foot = h('footer', { class: 'site-foot' }, h('div', { class: 'foot-inner' }, credit, line, h('p', {}, link)));
  function render() {
    const d = LANGS[store.state.lang];
    setText(credit, d.credits);
    setText(line, d.creditsLine);
    setText(link, d.source);
  }
  store.subscribe(render);
  render();
  return foot;
}

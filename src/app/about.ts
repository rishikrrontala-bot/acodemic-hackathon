/** How Zeer knows, what it can't tell you, why it matters, and who built it. */
import { LANGS } from '../i18n';
import { h, setText } from './dom';
import type { Store } from './store';

const REPO = 'https://github.com/rishikrrontala-bot/acodemic-hackathon';

export function createAbout(store: Store): HTMLElement {
  const mTitle = h('h2', { class: 'section-title', id: 'method-title' });
  const mList = h('ol', { class: 'method-list' });
  const lTitle = h('h2', { class: 'section-title', id: 'limits-title' });
  const lList = h('ul', { class: 'limits-list' });
  const sTitle = h('h2', { class: 'section-title', id: 'sdg-title' });
  const sList = h('ul', { class: 'sdg-list' });
  const sTargets = h('p', { class: 'sdg-targets' });
  const el = h('div', { class: 'about' },
    h('section', { class: 'about-col', 'aria-labelledby': 'sdg-title' }, sTitle, sList, sTargets),
    h('section', { class: 'about-col', 'aria-labelledby': 'method-title' }, mTitle, mList),
    h('section', { class: 'about-col', 'aria-labelledby': 'limits-title' }, lTitle, lList));
  function render() {
    const d = LANGS[store.state.lang];
    setText(mTitle, d.methodTitle);
    mList.replaceChildren(...d.method.map((x) => h('li', {}, x)));
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

/** The build card: a sized pot, six numbered steps, and the day's water, printable and shareable. */
import { planPot, waterPerDay, CAPACITY } from '../domain/sizing';
import { LANGS, monthNames } from '../i18n';
import { h, setText } from './dom';
import { num } from './format';
import { runsText, townModel } from './derive';
import type { Store } from './store';

export function createBuild(store: Store): HTMLElement {
  const title = h('h2', { class: 'section-title', id: 'build-title', tabindex: '-1' });
  const intro = h('p', { class: 'section-help' });
  const capLabel = h('label', { for: 'capacity', class: 'cap-label' });
  const cap = h('input', { id: 'capacity', type: 'range', min: CAPACITY.min, max: CAPACITY.max, step: 5, class: 'cap-range' }) as HTMLInputElement;
  const capOut = h('output', { for: 'capacity', class: 'cap-out' });
  const capHelp = h('p', { class: 'cap-help' });
  const steps = h('ol', { class: 'steps' });
  const notes = h('p', { class: 'build-notes' });
  const printBtn = h('button', { type: 'button', class: 'btn-quiet' });
  const saveBtn = h('button', { type: 'button', class: 'btn' });
  const advice = h('div', { class: 'build-advice', role: 'note', hidden: true });
  const stepsSummary = h('summary', {});
  const stepsWrap = h('details', { class: 'steps-wrap', open: true }, stepsSummary,
    h('div', { class: 'steps-inner' },
      h('div', { class: 'cap' }, capLabel, h('div', { class: 'cap-row' }, cap, capOut), capHelp),
      steps, notes,
      h('div', { class: 'build-actions no-print' }, saveBtn, printBtn)));

  const card = h('div', { class: 'build-card', id: 'build-card' }, advice, stepsWrap);
  const section = h('section', { class: 'build', id: 'build', 'aria-labelledby': 'build-title' }, title, intro, card);

  cap.addEventListener('input', () => store.set({ litres: Number(cap.value) }));
  printBtn.addEventListener('click', () => {
    document.body.classList.add('printing-card');
    window.print();
    setTimeout(() => document.body.classList.remove('printing-card'), 500);
  });
  saveBtn.addEventListener('click', () => void saveImage());

  function numbers() {
    const st = store.state;
    const m = townModel(st.town).year[st.month]!;
    const plan = planPot(st.litres);
    const water = waterPerDay(plan, m.outsideMean, m.insideMean.mid);
    return { st, m, plan, water };
  }

  function stepTexts(): string[] {
    const { st, plan, water } = numbers();
    const d = LANGS[st.lang];
    const cm = (x: number) => (st.unit === 'F' ? `${num(x / 2.54, st.lang)} in` : `${num(x, st.lang)} cm`);
    const w = d.waterRange(num(Math.max(0.5, water.low), st.lang, 1), num(Math.max(0.5, water.high), st.lang, 1));
    return [
      d.steps[0]!(cm(plan.innerDiameterCm), cm(plan.outerDiameterCm)),
      d.steps[1]!('', ''),
      d.steps[2]!('', ''),
      d.steps[3]!('', ''),
      d.steps[4]!('', ''),
      d.steps[5]!(w, ''),
    ];
  }

  function render() {
    const { st, m } = numbers();
    const d = LANGS[st.lang];
    const names = monthNames(st.lang, 'long');
    const model = townModel(st.town);
    setText(title, d.buildTitle);
    setText(intro, d.buildIntro(names[st.month]!, st.town.n));

    // Principle 1: tell her when it won't work, before telling her how to build it.
    const works = model.summary.worksMonths;
    card.dataset.verdict = m.verdict;
    if (m.verdict === 'works') {
      advice.hidden = true;
      stepsWrap.open = true;
    } else if (works.length) {
      advice.hidden = false;
      const best = model.summary.best;
      const plan = h('button', { type: 'button', class: 'btn-link' }, d.planFor(names[best]!));
      plan.addEventListener('click', () => store.set({ month: best }));
      advice.replaceChildren(
        h('p', { class: 'advice-lead' }, d.notWorth(names[st.month]!, d.verdictWhy[m.verdict])),
        h('p', {}, d.worksFrom(st.town.n, runsText(works, names, d.runJoin, d.runTo)), ' ', plan));
      stepsWrap.open = true;
    } else {
      advice.hidden = false;
      advice.replaceChildren(h('p', { class: 'advice-lead' }, d.neverBuild(st.town.n)));
      stepsWrap.open = false;
    }
    stepsWrap.classList.toggle('collapsible', !works.length);
    setText(stepsSummary, d.showStepsAnyway);
    setText(capLabel, d.capacityLabel);
    if (document.activeElement !== cap) cap.value = String(st.litres);
    setText(capOut, d.litres(num(st.litres, st.lang)));
    setText(capHelp, d.capacityHelp);
    steps.replaceChildren(...stepTexts().map((t) => h('li', {}, t)));
    setText(notes, `${d.waterNote} ${d.sandNote}`);
    setText(printBtn, d.print);
    setText(saveBtn, d.saveImage);
  }

  /** Draw the card to a canvas and download it as a PNG (for sharing on a phone). */
  async function saveImage() {
    const { st, m } = numbers();
    const d = LANGS[st.lang];
    const names = monthNames(st.lang, 'long');
    await document.fonts.ready;
    const W = 1080;
    const Hh = 1350;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = Hh;
    const g = c.getContext('2d');
    if (!g) return;
    const css = getComputedStyle(document.documentElement);
    const col = (v: string) => css.getPropertyValue(v).trim();
    g.fillStyle = col('--lime');
    g.fillRect(0, 0, W, Hh);
    g.fillStyle = col('--indigo');
    g.fillRect(0, 0, W, 180);
    g.fillStyle = col('--lime');
    g.font = `800 96px ${col('--display')}`;
    g.fillText('ZEER', 64, 118);
    g.font = `600 30px ${col('--text')}`;
    g.fillText(`${st.town.n}, ${st.town.c} · ${names[st.month]}`, 64, 160);
    g.fillStyle = col('--ink');
    g.font = `700 44px ${col('--text')}`;
    g.fillText(d.buildTitle, 64, 260);
    g.font = `400 30px ${col('--text')}`;
    let y = 320;
    const wrap = (text: string, x: number, maxW: number, lh: number) => {
      const words = text.split(' ');
      let line = '';
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (g.measureText(test).width > maxW && line) {
          g.fillText(line, x, y);
          y += lh;
          line = w;
        } else line = test;
      }
      if (line) { g.fillText(line, x, y); y += lh; }
    };
    stepTexts().forEach((t, i) => {
      g.fillStyle = col('--indigo');
      g.beginPath();
      g.arc(88, y - 10, 24, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = col('--lime');
      g.font = `800 28px ${col('--display')}`;
      g.textAlign = 'center';
      g.fillText(String(i + 1), 88, y);
      g.textAlign = 'left';
      g.fillStyle = col('--ink');
      g.font = `400 30px ${col('--text')}`;
      wrap(t, 132, W - 196, 42);
      y += 18;
    });
    g.fillStyle = col('--ink-2');
    g.font = `400 24px ${col('--text')}`;
    wrap(`${d.verdict[m.verdict]}: ${d.verdictWhy[m.verdict]}`, 64, W - 128, 34);
    g.fillText(`${d.cardFooter} · ${d.credits}`, 64, Hh - 48);
    const a = document.createElement('a');
    a.download = `zeer-${st.town.n.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-${st.month + 1}.png`;
    a.href = c.toDataURL('image/png');
    a.click();
  }

  store.subscribe(render);
  render();
  return section;
}

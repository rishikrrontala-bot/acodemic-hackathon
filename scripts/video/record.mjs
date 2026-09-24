// Records the Zeer demo from the running app (production build).
//
//   npx vite build && npx vite preview --port 4173 &
//   python3 scripts/video/narrate.py kokoro-v1.0.onnx voices-v1.0.bin /tmp/video/audio
//   node scripts/video/record.mjs --rehearse        # every selector checked, nothing recorded
//   node scripts/video/record.mjs                   # frames + cues into /tmp/video/rec
//   bash scripts/video/encode.sh                    # → submission/video/demo.mp4 (+ demo.srt)
//
// Capture: Chrome DevTools screencast frames (sharper than Playwright's built-in WebM), a
// 1440×810 layout at device pixel ratio 4/3 = 1920×1080 frames. Each scene is held for at least
// as long as its narration line; captions are drawn in the page in Zeer's own type.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const REHEARSE = process.argv.includes('--rehearse');
const OUT = process.env.REC_DIR ?? '/tmp/video/rec';
const AUDIO = process.env.AUDIO_DIR ?? '/tmp/video/audio';
const lines = JSON.parse(readFileSync(new URL('./narration.json', import.meta.url), 'utf8'));
const durations = JSON.parse(readFileSync(join(AUDIO, 'durations.json'), 'utf8'));
const text = Object.fromEntries(lines.map((l) => [l.id, l.text]));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
const page = await context.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.error('CONSOLE', m.text()));

// ---------- overlays (cursor, captions, end card) ----------
async function injectOverlays() {
  await page.addStyleTag({ content: `
    #demo-cursor { position: fixed; z-index: 99999; pointer-events: none; width: 28px; height: 28px; left: 0; top: 0;
      transition: left 60ms linear, top 60ms linear; filter: drop-shadow(1px 2px 2px rgb(0 0 0 / .35)); }
    #demo-caption { position: fixed; z-index: 99998; left: 50%; bottom: 34px; transform: translateX(-50%);
      max-width: 1080px; width: max-content; padding: 12px 22px; border-radius: 6px;
      background: rgb(18 22 43 / .94); color: #f3f4ee; font-family: 'Atkinson Hyperlegible Next Variable', sans-serif;
      font-size: 27px; line-height: 1.3; font-weight: 600; text-align: center; opacity: 0; transition: opacity 160ms ease; pointer-events: none; }
    #demo-caption.on { opacity: 1; }
    #demo-end { position: fixed; inset: 0; z-index: 99997; background: #2a3a8f; color: #f3f4ee; display: grid; place-content: center;
      gap: 18px; text-align: center; opacity: 0; transition: opacity 400ms ease; font-family: 'Atkinson Hyperlegible Next Variable', sans-serif; }
    #demo-end.on { opacity: 1; }
    #demo-end .w { font-family: 'Anybody Variable'; font-weight: 860; font-stretch: 135%; font-size: 140px; line-height: .9; text-transform: uppercase; }
    #demo-end .t { font-size: 30px; max-width: 900px; }
    #demo-end .u { font-size: 30px; font-weight: 700; }
    #demo-end .s { font-size: 20px; opacity: .85; max-width: 1000px; }
  ` });
  await page.evaluate(() => {
    const c = document.createElement('div');
    c.id = 'demo-cursor';
    c.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="#fff" stroke="#12162b" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.body.append(c);
    document.addEventListener('mousemove', (e) => { c.style.left = `${e.clientX}px`; c.style.top = `${e.clientY}px`; }, true);
    const cap = document.createElement('div');
    cap.id = 'demo-caption';
    document.body.append(cap);
    const end = document.createElement('div');
    end.id = 'demo-end';
    end.innerHTML = '<div class="w">Zeer</div><div class="t">A clay-pot fridge, planned for your town, your month and your crop.</div>' +
      '<div class="u">rishikrrontala-bot.github.io/acodemic-hackathon</div>' +
      '<div class="t">Built by Rishik Rontala · SDG 12.3 and 2.3</div>' +
      '<div class="s">Narration: synthesized voice (Kokoro TTS). Data: NASA POWER · MIT D-Lab and World Vegetable Center · USDA Handbook 66.</div>';
    document.body.append(end);
  });
}

// ---------- recording clock and cues ----------
const frames = [];
const cues = [];
let cdp;
let t0 = null; // epoch seconds of the first frame
async function startCapture() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  cdp = await context.newCDPSession(page);
  cdp.on('Page.screencastFrame', async (f) => {
    const ts = f.metadata.timestamp;
    if (t0 === null) t0 = ts;
    const name = `f${String(frames.length).padStart(5, '0')}.jpg`;
    writeFileSync(join(OUT, name), Buffer.from(f.data, 'base64'));
    frames.push({ name, t: ts - t0 });
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  while (t0 === null) await sleep(20);
}
const now = () => Date.now() / 1000 - t0;

/** Split a narration line into caption chunks of at most ~84 characters, on sentence or clause breaks. */
function chunks(line) {
  const parts = line.match(/[^.!?;:]+[.!?;:]?/g).map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    if (p.length <= 84) { out.push(p); continue; }
    let cur = '';
    for (const piece of p.split(/(?<=,)\s+/)) {
      if ((cur + ' ' + piece).trim().length > 84 && cur) { out.push(cur.trim()); cur = piece; }
      else cur = `${cur} ${piece}`;
    }
    if (cur.trim()) out.push(cur.trim());
  }
  return out;
}

/** Start a narration line: record its cue, show its caption chunks over its duration. Returns the time it ends. */
async function say(id) {
  const dur = durations[id];
  const start = REHEARSE ? 0 : now();
  const cs = chunks(text[id]);
  const total = cs.reduce((s, c) => s + c.length, 0);
  let t = start;
  const timed = cs.map((c) => { const d = (c.length / total) * dur; const cue = { id, text: c, start: t, end: t + d }; t += d; return cue; });
  if (!REHEARSE) cues.push(...timed);
  await page.evaluate((timed) => {
    const cap = document.getElementById('demo-caption');
    const base = performance.now();
    const off = timed[0].start;
    timed.forEach((c, i) => {
      setTimeout(() => { cap.textContent = c.text; cap.classList.add('on'); }, (c.start - off) * 1000);
      if (i === timed.length - 1) setTimeout(() => cap.classList.remove('on'), (c.end - off) * 1000 + 150);
    });
    void base;
  }, timed);
  return start + dur;
}
async function holdUntil(t, pad = 0.6) {
  if (REHEARSE) return;
  const wait = (t + pad - now()) * 1000;
  if (wait > 0) await sleep(wait);
}

// ---------- pointer helpers ----------
let mouse = { x: 720, y: 405 };
async function moveTo(x, y, steps = 18) {
  await page.mouse.move(x, y, { steps });
  mouse = { x, y };
}
async function box(sel) {
  const el = typeof sel === 'string' ? page.locator(sel).first() : sel;
  if (!(await el.isVisible().catch(() => false))) throw new Error(`not visible: ${sel}`);
  return el.boundingBox();
}
async function hover(sel, dy = 0) {
  const b = await box(sel);
  await moveTo(b.x + b.width / 2, b.y + b.height / 2 + dy);
}
async function click(sel, pause = 350) {
  await hover(sel);
  await sleep(250);
  await page.mouse.down();
  await page.mouse.up();
  await sleep(pause);
}
async function scrollToEl(sel, offset = 90) {
  await page.evaluate(([s, o]) => {
    const el = document.querySelector(s);
    const y = el.getBoundingClientRect().top + scrollY - o;
    scrollTo({ top: y, behavior: 'smooth' });
  }, [sel, offset]);
  await sleep(1100);
}
async function typeInto(sel, value, delay = 110) {
  await click(sel, 150);
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type(value, { delay });
}
function monthCol(i) { return page.locator('.month').nth(i); }

// ---------- the film ----------
const MOPTI = 2453348;
await page.goto(`${BASE}#t=${MOPTI}&m=3&c=tomato&l=en&u=C`);
await page.waitForSelector('.headline');
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => { try { localStorage.clear(); } catch {} });
await injectOverlays();
await page.evaluate(() => scrollTo(0, 0));
await sleep(400);
await moveTo(900, 330, 1);

if (!REHEARSE) await startCapture();

// 1 · the wow: the pot in March
let end = await say('wow');
await sleep(600);
await hover('.pot-tag-air-value');
await sleep(2200);
await hover('.pot-tag-in-value');
await sleep(2200);
await hover('.big-num');
await holdUntil(end, 0.3);

// 2 · scrub the year to August
end = await say('august');
{
  const a = await (monthCol(2)).boundingBox();
  const b = await (monthCol(7)).boundingBox();
  await moveTo(a.x + a.width / 2, a.y + a.height * 0.55);
  await sleep(250);
  await page.mouse.down();
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const x = a.x + a.width / 2 + ((b.x - a.x) * i) / steps;
    await page.mouse.move(x, a.y + a.height * 0.55, { steps: 8 });
    await sleep(380);
  }
  await page.mouse.up();
  mouse = { x: b.x + b.width / 2, y: a.y + a.height * 0.55 };
}
await sleep(500);
await hover('.verdict-chip');
await holdUntil(end);

// 3 · the problem: why it matters
end = await say('problem');
await click('.nav-why', 200);
await sleep(1400);
await hover('#why li:nth-child(1)');
await sleep(4500);
await hover('#why li:nth-child(2)');
await sleep(5000);
await hover('#why li:nth-child(3)');
await holdUntil(end, 0.2);

// 4 · what Zeer is
end = await say('what');
await page.evaluate(() => scrollTo({ top: 0, behavior: 'smooth' }));
await sleep(1200);
await page.evaluate(() => window.__zeer.set({ month: 2 }));
await hover('.headline');
await sleep(3000);
await hover('#town');
await holdUntil(end, 0.2);

// 5 · Kano
end = await say('kano');
await typeInto('#town', 'Kano');
await sleep(700);
await click(page.getByRole('option', { name: /^Kano/ }).first(), 600);
await hover('.headline');
await holdUntil(end, 1.2);

// 6 · crops: tomatoes in March, days, keep-out
end = await say('crops');
await scrollToEl('#crops-title', 70);
await hover('.crop-btn[data-crop="tomato"]');
await sleep(1500);
await typeInto('#baseline', '3', 120);
await sleep(900);
await hover('.gain-days');
await sleep(3500);
await hover('.keep');
await holdUntil(end);

// 7 · build it
end = await say('build');
await scrollToEl('#build-title', 60);
{
  const r = await box('#capacity');
  const y = r.y + r.height / 2;
  const x50 = r.x + r.width * ((50 - 10) / 90);
  const x70 = r.x + r.width * ((70 - 10) / 90);
  await moveTo(x50, y);
  await page.mouse.down();
  await page.mouse.move(x70, y, { steps: 20 });
  await page.mouse.up();
}
await sleep(700);
await hover('.steps li:nth-child(1)');
await sleep(1800);
await hover('.steps li:nth-child(6)');
await holdUntil(end);

// 8 · check my pot
end = await say('check');
await typeInto('#check-air', '37', 140);
await typeInto('#check-in', '29', 140);
await click('.check-form .btn', 700);
await hover('.diag');
await holdUntil(end);

// 9 · how it works + validation
end = await say('how');
await scrollToEl('#method-title', 70);
await hover('.method-list li:nth-child(1)');
await sleep(4000);
await hover('.method-list li:nth-child(2)');
await sleep(3500);
await scrollToEl('.valid', 120);
await hover('.valid-table tbody tr:nth-child(1)');
await holdUntil(end);

// 10 · the map through the year
end = await say('map');
await scrollToEl('#map-title', 40);
await page.waitForSelector('.map-dot');
await hover('.map-count');
for (let m = 0; m < 12; m++) {
  await page.evaluate((mm) => window.__zeer.set({ month: mm }), m);
  await sleep(950);
}
await page.evaluate(() => window.__zeer.set({ month: 2 }));
await holdUntil(end, 0.2);

// 11 · close: French, the credit, end card
end = await say('close');
await page.evaluate(() => scrollTo({ top: 0, behavior: 'smooth' }));
await sleep(1100);
await click('[data-lang="fr"]', 400);
await hover('.headline');
await sleep(2600);
await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
await sleep(1500);
await hover('.credit');
await holdUntil(end, 0.2);
await page.evaluate(() => document.getElementById('demo-end').classList.add('on'));
await sleep(REHEARSE ? 0 : 4200);

if (REHEARSE) {
  console.log('REHEARSAL PASSED: every selector resolved and every step ran.');
} else {
  const stopAt = now();
  await cdp.send('Page.stopScreencast');
  await sleep(300);
  const list = frames.map((f, i) => {
    const next = i + 1 < frames.length ? frames[i + 1].t : stopAt;
    return `file '${f.name}'\nduration ${Math.max(0.001, next - f.t).toFixed(4)}`;
  });
  list.push(`file '${frames[frames.length - 1].name}'`);
  writeFileSync(join(OUT, 'frames.txt'), list.join('\n') + '\n');
  // narration start per line (first chunk of each id)
  const starts = {};
  for (const c of cues) if (!(c.id in starts)) starts[c.id] = Math.round(c.start * 1000);
  writeFileSync(join(OUT, 'cues.json'), JSON.stringify({ length: stopAt, starts, captions: cues }, null, 2));
  console.log(`recorded ${frames.length} frames, ${stopAt.toFixed(1)} s`);
}
await browser.close();

import '@fontsource-variable/anybody/wdth.css';
import '@fontsource-variable/atkinson-hyperlegible-next/index.css';
import './styles/tokens.css';
import './styles/app.css';

import type { TownRecord } from './domain/towns';
import { detectLang, LANGS, type Lang } from './i18n';
import { createAbout, createFooter } from './app/about';
import { createBuild } from './app/build';
import { createCheck } from './app/check';
import { createCrops } from './app/crops';
import { h, setText } from './app/dom';
import { openingMonth, townModel } from './app/derive';
import type { Unit } from './app/format';
import { createStation } from './app/station';
import { parseHash, Store, toHash } from './app/store';
import { createYear } from './app/year';

const DEFAULT_TOWN = 'Mopti'; // MIT D-Lab's clay-pot field region in Mali

function readPref<T extends string>(key: string, ok: readonly T[]): T | null {
  try {
    const v = localStorage.getItem(key);
    return v && (ok as readonly string[]).includes(v) ? (v as T) : null;
  } catch {
    return null;
  }
}
function writePref(key: string, v: string): void {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* private mode: preferences just don't persist */
  }
}

async function boot(): Promise<void> {
  const app = document.getElementById('app')!;
  const hash = parseHash(location.hash);
  const lang: Lang = hash.lang ?? readPref<Lang>('zeer.lang', ['en', 'fr', 'es']) ?? detectLang(navigator.languages ?? [navigator.language]);
  const loading = h('p', { class: 'loading', role: 'status' }, LANGS[lang].loading);
  app.replaceChildren(loading);

  let towns: TownRecord[];
  try {
    const res = await fetch(new URL('data/climate.json', document.baseURI));
    if (!res.ok) throw new Error(String(res.status));
    towns = ((await res.json()) as { towns: TownRecord[] }).towns;
  } catch {
    setText(loading, LANGS[lang].loadFailed);
    loading.setAttribute('role', 'alert');
    app.removeAttribute('aria-busy');
    return;
  }

  const town = towns.find((t) => t.id === hash.townId) ?? towns.find((t) => t.n === DEFAULT_TOWN) ?? towns[0]!;
  const unit: Unit = hash.unit ?? readPref<Unit>('zeer.unit', ['C', 'F']) ?? 'C';
  const store = new Store({
    town,
    month: hash.month ?? openingMonth(townModel(town), new Date().getMonth()),
    crop: hash.crop ?? 'tomato',
    lang,
    unit,
    litres: 50,
    baselineDays: 3,
    nearestKm: null,
  });

  // ---- header: wordmark, tagline, language and unit
  const tagline = h('p', { class: 'tagline' });
  const langGroup = h('div', { class: 'seg', role: 'group' });
  const unitGroup = h('div', { class: 'seg', role: 'group' });
  (['en', 'fr', 'es'] as const).forEach((l) =>
    langGroup.append(h('button', { type: 'button', class: 'seg-btn', 'data-lang': l, lang: l }, l.toUpperCase())));
  (['C', 'F'] as const).forEach((u) => unitGroup.append(h('button', { type: 'button', class: 'seg-btn', 'data-unit': u }, `°${u}`)));
  langGroup.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-lang]');
    if (b) {
      store.set({ lang: b.dataset.lang as Lang });
      writePref('zeer.lang', b.dataset.lang!);
    }
  });
  unitGroup.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-unit]');
    if (b) {
      store.set({ unit: b.dataset.unit as Unit });
      writePref('zeer.unit', b.dataset.unit!);
    }
  });
  const header = h('header', { class: 'site-head' },
    h('div', { class: 'brand' },
      h('h1', { class: 'wordmark' }, 'Zeer'),
      tagline),
    h('div', { class: 'prefs' }, langGroup, unitGroup));

  const skip = document.querySelector<HTMLAnchorElement>('.skip');
  const mapHost = h('div', { class: 'map-host' });
  const mapTitle = h('h2', { class: 'section-title', id: 'map-title' });
  const mapHelp = h('p', { class: 'section-help' });
  const main = h('main', { id: 'main', tabindex: '-1' },
    h('div', { class: 'almanac' }, createStation(store, towns),
      h('div', { class: 'field-col' }, createYear(store), createCrops(store))),
    h('div', { class: 'workbench' }, createBuild(store), createCheck(store)),
    h('section', { class: 'where', 'aria-labelledby': 'map-title' }, mapTitle, mapHelp, mapHost),
    createAbout(store));

  app.replaceChildren(header, main, createFooter(store));
  app.removeAttribute('aria-busy');

  // map: load its code and geometry only when the reader gets near it
  let mapLoaded = false;
  const loadMap = () => {
    if (mapLoaded) return;
    mapLoaded = true;
    void import('./app/map').then(({ mountMap }) => mountMap(mapHost, store, towns));
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        loadMap();
      }
    }, { rootMargin: '600px' });
    io.observe(mapHost);
  } else loadMap();

  function renderShell() {
    const st = store.state;
    const d = LANGS[st.lang];
    document.documentElement.lang = st.lang;
    setText(tagline, d.tagline);
    langGroup.setAttribute('aria-label', d.language);
    unitGroup.setAttribute('aria-label', d.units);
    langGroup.querySelectorAll<HTMLElement>('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === st.lang)));
    unitGroup.querySelectorAll<HTMLElement>('[data-unit]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.unit === st.unit)));
    if (skip) setText(skip, d.skip);
    const names = new Intl.DateTimeFormat(st.lang, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2021, st.month, 15)));
    setText(mapTitle, d.mapTitle(names));
    setText(mapHelp, d.mapHelp);
    const next = toHash(st);
    if (location.hash !== next) history.replaceState(null, '', next);
  }
  store.subscribe(renderShell);
  renderShell();

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(new URL('sw.js', document.baseURI)).catch(() => {
      /* offline support is a bonus; the app works without it */
    });
  }
  (window as unknown as { __zeer: Store }).__zeer = store; // for e2e tests and the demo recorder
}

void boot();

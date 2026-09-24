import { en, type Dict } from './en';
import { es } from './es';
import { fr } from './fr';

export type Lang = 'en' | 'fr' | 'es';
export const LANGS: Record<Lang, Dict> = { en, fr, es };
export type { Dict };

/** First supported language in the browser's preference list, else English. */
export function detectLang(langs: readonly string[]): Lang {
  for (const l of langs) {
    const base = l.toLowerCase().split('-')[0];
    if (base === 'fr' || base === 'es' || base === 'en') return base;
  }
  return 'en';
}

export function monthNames(lang: Lang, style: 'long' | 'short' | 'narrow'): string[] {
  const f = new Intl.DateTimeFormat(lang, { month: style, timeZone: 'UTC' });
  return Array.from({ length: 12 }, (_, i) => f.format(new Date(Date.UTC(2021, i, 15))));
}

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** WCAG 2.x contrast from the actual tokens in src/styles/tokens.css. */
const css = readFileSync('src/styles/tokens.css', 'utf8');
const token = (name: string) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} not found`);
  return m[1]!;
};
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

describe('colour contrast of the text pairs Zeer uses (WCAG 2.2 AA: 4.5:1 text, 3:1 large text and marks)', () => {
  const pairs: Array<[string, string, number]> = [
    ['ink', 'lime', 4.5],
    ['ink-2', 'lime', 4.5],
    ['ink-2', 'lime-2', 4.5],
    ['indigo', 'lime', 4.5],
    ['lime', 'indigo', 4.5], // lime text on indigo buttons and the build steps
    ['tomato', 'lime', 4.5], // "Never put these in the pot" title, error text
    ['millet-ink', 'lime', 4.5],
    ['ink', 'millet', 4.5], // text on millet fields
    ['lime', 'ink', 4.5], // footer
    ['indigo-mark', 'lime', 3], // chart marks
    ['leaf', 'lime', 3], // note bullets (marks)
  ];
  it.each(pairs)('%s on %s ≥ %f:1', (fg, bg, min) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(min);
  });
});

/**
 * The pot: a field-manual cross-section of a pot-in-pot cooler, drawn from the model.
 * What moves with the numbers: the sand darkens as it holds more water, beads of evaporation
 * rise from the outer wall at a rate set by the estimated water use, the inside of the inner pot
 * cools toward indigo, and the two readings (air, inside) retarget.
 */
import { s, setText, reducedMotion } from './dom';

export interface PotView {
  root: SVGSVGElement;
  update(p: PotParams): void;
}

export interface PotParams {
  airLabel: string; // "Air, hottest hours"
  insideLabel: string;
  air: string; // "38°"
  inside: string; // "29°"
  /** 0..1: how strongly the pot cools this month (drives colour and beads). */
  strength: number;
  labels: { sand: string; cloth: string; inner: string; outer: string };
  alt: string;
}

// Geometry (viewBox 0 0 470 300). Pot centred at x = 180.
const OUTER_OUT = 'M58 64 C22 112 20 206 92 262 L268 262 C340 206 338 112 302 64 Z';
const OUTER_IN = 'M70 64 C36 114 36 200 100 250 L260 250 C324 200 322 114 290 64 Z';
const INNER_OUT = 'M108 52 C92 100 92 180 128 234 L232 234 C268 180 268 100 252 52 Z';
const INNER_IN = 'M116 52 C101 102 101 176 134 226 L226 226 C259 176 259 102 244 52 Z';
const CLOTH = 'M98 50 Q139 36 180 45 T262 49 L266 60 Q252 57 246 71 L240 58 Q180 64 122 58 L116 71 Q109 57 94 60 Z';

const TOMATOES: Array<[number, number, number]> = [
  [150, 206, 14], [179, 211, 15], [208, 205, 14], [163, 183, 13], [194, 185, 14], [178, 162, 12],
];
/** Evaporation bead start points on the outer wall (left and right flanks). */
const BEADS: Array<[number, number, number]> = [
  // x, y, direction (-1 = drifts left, 1 = right)
  [34, 128, -1], [30, 162, -1], [36, 196, -1], [52, 226, -1], [44, 108, -1],
  [326, 128, 1], [330, 162, 1], [324, 196, 1], [308, 226, 1], [316, 108, 1],
  [40, 146, -1], [320, 146, 1],
];

export function createPot(): PotView {
  const title = s('title', { id: 'pot-title' });
  const hatch = s('pattern', { id: 'hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
    s('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'pot-hatch-line' }));
  const stipple = s('pattern', { id: 'stipple', width: 7, height: 7, patternUnits: 'userSpaceOnUse' },
    s('circle', { cx: 1.5, cy: 1.5, r: 1.1, class: 'pot-stipple-dot' }),
    s('circle', { cx: 5, cy: 4.5, r: 0.9, class: 'pot-stipple-dot' }));
  const ground = s('pattern', { id: 'ground', width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-45)' },
    s('line', { x1: 0, y1: 0, x2: 0, y2: 10, class: 'pot-ground-line' }));

  const sandWet = s('path', { d: OUTER_IN, class: 'pot-sand-wet' });
  const coolInside = s('path', { d: INNER_IN, class: 'pot-cool' });
  const beads = s('g', { class: 'pot-beads', 'aria-hidden': 'true' });
  // Evaporation drawn as small rising droplets (a speck reads as dust in a still frame).
  BEADS.forEach(([x, y, dir], i) => {
    beads.append(s('path', { d: `M${x} ${y} q3 4 0 6 q-3 -2 0 -6 z`, class: 'pot-bead', style: `--dx:${dir * 14}px;--i:${i}` }));
  });

  const airValue = s('text', { x: 58, y: -2, class: 'pot-tag-value pot-tag-air-value', 'text-anchor': 'middle' });
  const airLabel = s('text', { x: 10, y: 24, class: 'pot-tag-label' });
  const inValue = s('text', { x: 180, y: 104, class: 'pot-tag-value pot-tag-in-value', 'text-anchor': 'middle' });
  const inLabel = s('text', { x: 180, y: 130, class: 'pot-tag-label pot-tag-label-in', 'text-anchor': 'middle' });

  // Leader lines with labels on wide screens; on phones the same points carry numbers 1–4 and a
  // key below the drawing names them (extension-manual style).
  const leader = (n: number, x1: number, y1: number, x2: number, y2: number, tx: number, ty: number) => {
    const t = s('text', { x: tx, y: ty, class: 'pot-leader-text' });
    const g = s('g', { class: 'pot-leader' },
      s('line', { x1, y1, x2, y2, class: 'pot-leader-line' }),
      s('circle', { cx: x1, cy: y1, r: 2.5, class: 'pot-leader-dot' }),
      t);
    const badge = s('g', { class: 'pot-num', 'aria-hidden': 'true' },
      s('circle', { cx: x1, cy: y1, r: 11, class: 'pot-num-bg' }),
      s('text', { x: x1, y: y1 + 5, 'text-anchor': 'middle', class: 'pot-num-text' }, String(n)));
    return { g, t, badge };
  };
  const lCloth = leader(1, 254, 52, 340, 40, 346, 44);
  const lInner = leader(2, 250, 110, 340, 104, 346, 108);
  const lSand = leader(3, 300, 170, 340, 170, 346, 174);
  const lOuter = leader(4, 300, 236, 340, 236, 346, 240);

  const root = s('svg', { viewBox: '0 -34 470 334', class: 'pot', role: 'img', 'aria-labelledby': 'pot-title' },
    title,
    s('defs', {}, hatch, stipple, ground),
    // ground
    s('rect', { x: 14, y: 262, width: 330, height: 14, fill: 'url(#ground)', class: 'pot-ground' }),
    s('line', { x1: 14, y1: 262, x2: 344, y2: 262, class: 'pot-ground-top' }),
    // sand between the pots
    s('path', { d: OUTER_IN, class: 'pot-sand' }),
    sandWet,
    s('path', { d: OUTER_IN, fill: 'url(#stipple)', class: 'pot-sand-stipple' }),
    // outer pot wall (cut section)
    s('path', { d: `${OUTER_OUT} ${OUTER_IN}`, 'fill-rule': 'evenodd', fill: 'url(#hatch)', class: 'pot-wall' }),
    s('path', { d: OUTER_OUT, class: 'pot-outline' }),
    s('path', { d: OUTER_IN, class: 'pot-outline pot-outline-thin' }),
    // inner pot
    s('path', { d: INNER_IN, class: 'pot-inside' }),
    coolInside,
    s('g', { class: 'pot-food' },
      ...TOMATOES.map(([x, y, r]) => s('g', {},
        s('circle', { cx: x, cy: y, r, class: 'pot-tomato' }),
        s('path', { d: `M${x - 4} ${y - r + 2} l4 -3 l4 3`, class: 'pot-calyx' })))),
    s('path', { d: `${INNER_OUT} ${INNER_IN}`, 'fill-rule': 'evenodd', fill: 'url(#hatch)', class: 'pot-wall' }),
    s('path', { d: INNER_OUT, class: 'pot-outline' }),
    s('path', { d: CLOTH, class: 'pot-cloth' }),
    beads,
    // readings
    s('rect', { x: 10, y: -28, width: 96, height: 36, rx: 4, class: 'pot-tag pot-tag-air' }),
    airValue, airLabel,
    s('rect', { x: 140, y: 78, width: 80, height: 34, rx: 4, class: 'pot-tag pot-tag-in' }),
    inValue, inLabel,
    s('g', { class: 'pot-leaders' }, lCloth.g, lInner.g, lSand.g, lOuter.g),
    s('g', { class: 'pot-nums' }, lCloth.badge, lInner.badge, lSand.badge, lOuter.badge),
  );

  return {
    root,
    update(p) {
      setText(title, p.alt);
      airValue.replaceChildren(p.air.replace('°', ''), s('tspan', { class: 'pot-deg' }, '°'));
      setText(airLabel, p.airLabel);
      inValue.replaceChildren(p.inside.replace('°', ''), s('tspan', { class: 'pot-deg' }, '°'));
      setText(inLabel, p.insideLabel);
      setText(lCloth.t, p.labels.cloth);
      setText(lInner.t, p.labels.inner);
      setText(lSand.t, p.labels.sand);
      setText(lOuter.t, p.labels.outer);
      const k = Math.max(0, Math.min(1, p.strength));
      root.style.setProperty('--wet', String(0.08 + 0.3 * k));
      root.style.setProperty('--cool', String(0.04 + 0.18 * k));
      // beads: how many rise, and how fast
      const n = Math.round(k * BEADS.length);
      beads.querySelectorAll('circle').forEach((c, i) => c.classList.toggle('on', i < n));
      root.style.setProperty('--bead-dur', `${(3.2 - 1.4 * k).toFixed(2)}s`);
      root.classList.toggle('still', reducedMotion());
    },
  };
}

import { clamp } from "./koi-math";
import type { ColorVarietyId, VarietyColors } from "./koi-varieties";

export type Rgb = [number, number, number];

export interface Palette {
  /** Page background; skin tiles are mixed toward it. */
  bg: Rgb;
  white: Rgb;
  red: Rgb;
  black: Rgb;
  fin: Rgb;
  eye: Rgb;
  water: Rgb;
  pellet: Rgb;
  shadow: Rgb;
  shadowAlpha: number;
  alpha: number;
  /** Opacity kept by a koi at the bottom of the pond (relative). */
  depthFloor: number;
  /** Skin-colour weight of a tile from shadow to lit; the rest is page background. */
  tile: [number, number];
  /** Red-orange marking colour from deep shadow to highlight. */
  hi: Rgb[];
  /** Glyph brightness relative to its tile. */
  ink: number;
  /** Lily pad green from shade to lit. */
  pad: Rgb[];
  /** Lotus petal from base to tip. */
  petal: Rgb[];
  stamen: Rgb;
  /** Cherry-blossom branch wood from shade to lit. */
  branch: Rgb[];
  /** Cherry-blossom petal from base to tip. */
  blossom: Rgb[];
  varieties: Record<ColorVarietyId, VarietyColors>;
}

export const DARK: Palette = {
  bg: [26, 25, 23],
  white: [236, 228, 218],
  red: [232, 96, 56],
  black: [92, 90, 108],
  fin: [214, 206, 198],
  eye: [20, 20, 26],
  water: [255, 247, 240],
  pellet: [236, 170, 92],
  shadow: [0, 0, 0],
  shadowAlpha: 0.55,
  alpha: 0.8,
  depthFloor: 0.4,
  tile: [0.68, 0.98],
  hi: [
    [112, 22, 24],
    [168, 34, 28],
    [214, 58, 30],
    [240, 96, 34],
    [250, 138, 52],
    [255, 178, 96],
  ],
  ink: 0.42,
  pad: [
    [30, 58, 40],
    [44, 84, 52],
    [62, 112, 66],
    [88, 140, 84],
  ],
  petal: [
    [150, 50, 90],
    [205, 90, 125],
    [238, 140, 165],
    [250, 205, 215],
  ],
  stamen: [240, 190, 60],
  branch: [
    [58, 44, 36],
    [88, 66, 52],
    [122, 94, 74],
    [152, 120, 96],
  ],
  blossom: [
    [196, 98, 130],
    [232, 140, 168],
    [248, 190, 208],
    [255, 232, 238],
  ],
  varieties: {
    ogon: { base: [214, 172, 64], belly: [236, 214, 150], patch: [214, 172, 64] },
    platinum: { base: [242, 240, 234], belly: [250, 248, 244], patch: [242, 240, 234] },
    chagoi: { base: [176, 132, 88], belly: [214, 190, 160], patch: [176, 132, 88] },
    asagi: { base: [100, 136, 182], belly: [196, 206, 218], patch: [100, 136, 182] },
    kumonryu: { base: [30, 30, 36], belly: [60, 60, 70], patch: [236, 228, 218] },
  },
};

export const LIGHT: Palette = {
  bg: [245, 244, 241],
  white: [112, 108, 104],
  red: [204, 62, 28],
  black: [36, 33, 40],
  fin: [138, 132, 126],
  eye: [24, 22, 26],
  water: [38, 37, 35],
  pellet: [176, 108, 40],
  shadow: [60, 58, 56],
  shadowAlpha: 0.2,
  alpha: 0.9,
  depthFloor: 0.55,
  tile: [0.78, 0.55],
  hi: [
    [138, 24, 22],
    [184, 38, 24],
    [222, 62, 28],
    [238, 100, 38],
    [244, 140, 66],
    [248, 176, 116],
  ],
  ink: 0.45,
  pad: [
    [88, 128, 80],
    [110, 150, 98],
    [136, 172, 120],
    [160, 192, 140],
  ],
  petal: [
    [170, 50, 95],
    [210, 85, 125],
    [232, 130, 160],
    [246, 190, 205],
  ],
  stamen: [214, 160, 30],
  branch: [
    [84, 62, 48],
    [110, 82, 64],
    [138, 106, 84],
    [166, 132, 108],
  ],
  blossom: [
    [206, 92, 128],
    [226, 122, 154],
    [240, 164, 188],
    [250, 206, 220],
  ],
  varieties: {
    ogon: { base: [152, 104, 12], belly: [206, 176, 100], patch: [152, 104, 12] },
    platinum: { base: [252, 251, 248], belly: [255, 255, 255], patch: [252, 251, 248] },
    chagoi: { base: [140, 98, 58], belly: [190, 164, 134], patch: [140, 98, 58] },
    asagi: { base: [58, 92, 142], belly: [150, 164, 184], patch: [58, 92, 142] },
    kumonryu: { base: [36, 33, 40], belly: [84, 80, 88], patch: [112, 108, 104] },
  },
};

export const packRgb = (c: Rgb): number => (c[0] << 16) | (c[1] << 8) | c[2];

export const mix = (a: Rgb, b: Rgb, k: number): Rgb => [
  (a[0] + (b[0] - a[0]) * k) | 0,
  (a[1] + (b[1] - a[1]) * k) | 0,
  (a[2] + (b[2] - a[2]) * k) | 0,
];

export const shade = (c: Rgb, k: number): Rgb => [
  Math.min(255, c[0] * k) | 0,
  Math.min(255, c[1] * k) | 0,
  Math.min(255, c[2] * k) | 0,
];

/** Samples a colour ramp at t in [0, 1]. */
export function ramp(stops: readonly Rgb[], t: number): Rgb {
  const x = clamp(t, 0, 1) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return mix(stops[i], stops[i + 1], x - i);
}

const RGB_KEYS = ["bg", "white", "red", "black", "fin", "eye", "water", "pellet", "shadow", "stamen"] as const;
const RAMP_KEYS = ["hi", "pad", "petal", "branch", "blossom"] as const;

const copyRgb = (c: Rgb): Rgb => [c[0], c[1], c[2]];

export function clonePalette(p: Palette): Palette {
  return {
    ...p,
    bg: copyRgb(p.bg),
    white: copyRgb(p.white),
    red: copyRgb(p.red),
    black: copyRgb(p.black),
    fin: copyRgb(p.fin),
    eye: copyRgb(p.eye),
    water: copyRgb(p.water),
    pellet: copyRgb(p.pellet),
    shadow: copyRgb(p.shadow),
    stamen: copyRgb(p.stamen),
    tile: [p.tile[0], p.tile[1]],
    hi: p.hi.map(copyRgb),
    pad: p.pad.map(copyRgb),
    petal: p.petal.map(copyRgb),
    branch: p.branch.map(copyRgb),
    blossom: p.blossom.map(copyRgb),
    varieties: Object.fromEntries(
      Object.entries(p.varieties).map(([id, c]) => [
        id,
        { base: copyRgb(c.base), belly: copyRgb(c.belly), patch: copyRgb(c.patch) },
      ]),
    ) as Palette["varieties"],
  };
}

function lerpRgb(a: Rgb, b: Rgb, k: number, out: Rgb): void {
  out[0] = (a[0] + (b[0] - a[0]) * k) | 0;
  out[1] = (a[1] + (b[1] - a[1]) * k) | 0;
  out[2] = (a[2] + (b[2] - a[2]) * k) | 0;
}

/**
 * Blends two palettes into `out` in place. Every colour and ramp keeps its array identity across
 * calls, because the cell styler recognises red skin by reference.
 */
export function lerpPalette(from: Palette, to: Palette, k: number, out: Palette): void {
  for (const key of RGB_KEYS) lerpRgb(from[key], to[key], k, out[key]);
  for (const key of RAMP_KEYS) {
    for (let i = 0; i < out[key].length; i++) lerpRgb(from[key][i], to[key][i], k, out[key][i]);
  }
  for (const id of Object.keys(out.varieties) as ColorVarietyId[]) {
    const [f, t, o] = [from.varieties[id], to.varieties[id], out.varieties[id]];
    lerpRgb(f.base, t.base, k, o.base);
    lerpRgb(f.belly, t.belly, k, o.belly);
    lerpRgb(f.patch, t.patch, k, o.patch);
  }
  out.tile[0] = from.tile[0] + (to.tile[0] - from.tile[0]) * k;
  out.tile[1] = from.tile[1] + (to.tile[1] - from.tile[1]) * k;
  out.shadowAlpha = from.shadowAlpha + (to.shadowAlpha - from.shadowAlpha) * k;
  out.alpha = from.alpha + (to.alpha - from.alpha) * k;
  out.depthFloor = from.depthFloor + (to.depthFloor - from.depthFloor) * k;
  out.ink = from.ink + (to.ink - from.ink) * k;
}

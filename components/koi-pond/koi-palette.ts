import { clamp } from "./koi-math";

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

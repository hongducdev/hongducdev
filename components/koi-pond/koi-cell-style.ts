import { FLAG_BARBEL, FLAG_EYE, FLAG_FIN } from "./koi-shape";
import { skinAt } from "./koi-markings";
import { clamp, hash3, valueNoise } from "./koi-math";
import { mix, ramp, shade, type Palette, type Rgb } from "./koi-palette";
import type { Koi } from "./koi-world";

/** Dense glyphs are etched into skin tiles, sparse where the light catches them. */
const TILE_GLYPHS = "t%SX8@#";

/** What to paint in one grid cell. */
export interface CellStyle {
  glyph: string;
  ink: Rgb;
  alpha: number;
  tile: Rgb | null;
  tileAlpha: number;
}

export interface CellInput {
  koi: Koi;
  palette: Palette;
  time: number;
  flag: number;
  across: number;
  /** Position along the spine, 0 snout .. 1 tail tip. */
  s: number;
  /** Signed pixel offset from the spine. */
  v: number;
  /** Spine direction at the sample. */
  tx: number;
  ty: number;
  coverage: number;
  /** Sub-sample centroid offset from the cell centre. */
  offset: number;
  /** Whether the cell centre and at least 60% of its samples are covered. */
  solid: boolean;
  /** Body-anchored hash key so a glyph rides along with the skin. */
  key: number;
  /** Final opacity budget for this koi (depth-dependent). */
  dim: number;
  cellWidth: number;
}

export function lineGlyph(dx: number, dy: number): string {
  const len = Math.hypot(dx, dy) || 1;
  if (Math.abs(dy) < 0.38 * len) return "-";
  if (Math.abs(dx) < 0.38 * len) return "|";
  return dx * dy > 0 ? "\\" : "/";
}

export function styleCell(input: CellInput, out: CellStyle): void {
  const { koi, palette: p, flag, coverage, dim } = input;
  const side = input.v >= 0 ? 1 : -1;
  out.glyph = " ";
  out.ink = p.fin;
  out.alpha = dim;
  out.tile = null;
  out.tileAlpha = 0;

  if (flag === FLAG_BARBEL) {
    out.glyph = lineGlyph(-input.tx - side * input.ty * 0.7, -input.ty + side * input.tx * 0.7);
    out.ink = shade(mix(p.bg, p.fin, 0.9), p.ink + 0.3);
    return;
  }
  if (flag === FLAG_EYE && input.solid) {
    out.tile = mix(p.bg, p.eye, 0.85);
    out.tileAlpha = dim;
    out.glyph = "o";
    out.ink = mix(p.bg, p.white, 0.9);
    return;
  }
  if (flag === FLAG_FIN) {
    out.tile = mix(p.bg, p.fin, 0.55);
    out.tileAlpha = dim * 0.45 * coverage;
    if (input.key % 2 === 0) {
      out.glyph = ".";
      out.alpha *= 0.6 * coverage;
    }
    return;
  }

  const skin = skinAt(koi, p, input.s, input.v, input.across);
  // Light comes from the top-left; the back is rounded, so the middle is brightest.
  const facing = side * (0.6 * input.ty - 0.8 * input.tx) * input.across;
  const lum = clamp(0.22 + 0.5 * Math.sqrt(1 - input.across * input.across) + 0.18 * facing, 0, 1);
  const length = koi.length;
  if (skin === p.red) {
    const lean = (hash3(koi.id, 5, 17) - 0.5) * 0.3;
    const grain = (valueNoise(input.s * 9 + koi.id, (input.v / length) * 18, koi.id + 21) - 0.5) * 0.25;
    const sheen = Math.max(0, Math.sin(input.s * 11 - input.time * 1.8 + koi.id) - 0.7) / 0.3;
    out.tile = ramp(p.hi, 0.15 + 0.8 * lum + lean + grain + sheen * 0.35);
  } else {
    out.tile = mix(p.bg, skin, p.tile[0] + (p.tile[1] - p.tile[0]) * lum);
  }

  if (coverage < 1) {
    out.tileAlpha = dim * coverage * 0.55;
    if (input.offset > input.cellWidth * 0.2 && input.key % 3 === 0) {
      out.glyph = ".";
      out.ink = shade(out.tile, p.ink);
    }
    return;
  }

  out.tileAlpha = dim;
  if (input.s < 0.035 && input.across < 0.6 && koi.gulp > 0.5) {
    out.glyph = "o";
    out.ink = p.eye;
    return;
  }
  const jitter = (input.key >>> 4) % 3;
  out.glyph = TILE_GLYPHS[clamp(Math.round((1 - lum) * 4) + jitter, 0, TILE_GLYPHS.length - 1)];
  out.ink = shade(out.tile, p.ink);
  if (skin === p.white) out.alpha *= 0.6;
  const tick = Math.floor(input.time * 1.4 + (input.key % 997) / 97);
  if (hash3(input.key, tick, 7) < 0.03) out.tile = mix(out.tile, p.bg, 0.45);
}

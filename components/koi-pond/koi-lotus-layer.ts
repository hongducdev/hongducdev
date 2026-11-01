import { lineGlyph } from "./koi-cell-style";
import type { PondGrid } from "./koi-grid";
import { flowerCenter, type Flower, type Pad } from "./koi-lotus";
import { TAU, angleDiff, clamp, hash3, smoothstep, valueNoise } from "./koi-math";
import { Fader } from "./koi-fader";
import { ramp, shade, type Palette, type Rgb } from "./koi-palette";
import type { World } from "./koi-world";

const PAD_TILE_ALPHA = 0.82;
const PAD_GLYPH_ALPHA = 0.7;
const FLOWER_ALPHA = 0.95;
const SPOKES = 14;
const PETAL_GLYPHS = ".:+*";
const NOTCH_CENTER_RADIUS = 0.05;

/** Paints lily pads and lotus flowers into the grid's pad layer, over the koi. */
export class LotusRasterizer {
  private fader = new Fader();
  private fade = 1;

  constructor(private grid: PondGrid) {}

  snap(): void {
    this.fader.snap();
  }

  rasterize(world: World, palette: Palette, dt: number): void {
    this.fade = this.fader.update(world.lotusOn ? 1 : 0, dt);
    if (this.fade <= 0.001) return;
    for (const pad of world.pads) this.paintPad(pad, palette, world.time);
    for (const pad of world.pads) {
      if (pad.flower) this.paintFlower(pad, pad.flower, palette, world.time);
    }
  }

  private put(i: number, tile: Rgb, tileAlpha: number, glyph: string, ink: Rgb, inkAlpha: number): void {
    this.grid.pad.put(i, tile, tileAlpha, glyph, ink, inkAlpha, this.fade);
  }

  private paintPad(pad: Pad, palette: Palette, time: number): void {
    const { cw, ch, cols, rows } = this.grid;
    const radius = pad.radius * (1 + 0.025 * pad.wobble * Math.sin(time * 16));
    const c0 = Math.max(0, Math.floor((pad.x - radius) / cw));
    const c1 = Math.min(cols - 1, Math.floor((pad.x + radius) / cw));
    const r0 = Math.max(0, Math.floor((pad.y - radius) / ch));
    const r1 = Math.min(rows - 1, Math.floor((pad.y + radius) / ch));

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const dx = (c + 0.5) * cw - pad.x;
        const dy = (r + 0.5) * ch - pad.y;
        const dist = Math.hypot(dx, dy);
        if (dist > radius) continue;
        const theta = Math.atan2(dy, dx);
        if (dist > radius * NOTCH_CENTER_RADIUS && Math.abs(angleDiff(pad.rot + pad.notchAngle, theta)) < pad.notchHalf) {
          continue;
        }

        const rim = dist / radius;
        // The leaf is a shallow dome lit from the top-left.
        const facing = -(dx * 0.6 + dy * 0.8) / radius;
        const grain = (valueNoise(dx / (cw * 3) + pad.radius, dy / (ch * 3) + pad.radius, 5) - 0.5) * 0.14;
        const lum = clamp(0.4 + 0.3 * facing + 0.22 * (1 - rim) + grain + 0.1 * pad.wobble, 0, 1);
        const tile = ramp(palette.pad, lum);

        const spoke = (theta - pad.rot) / (TAU / SPOKES);
        const offSpoke = Math.abs(spoke - Math.round(spoke)) * (TAU / SPOKES) * dist;
        let glyph = " ";
        if (dist > radius * 0.12 && offSpoke < cw * 0.45) glyph = lineGlyph(dx, dy);
        else if (rim > 1 - (cw * 0.9) / radius) glyph = ".";
        else if (hash3(c, r, 9) < 0.06) glyph = ".";
        const edge = rim > 1 - (cw * 0.6) / radius ? 0.65 : 1;
        this.put(r * cols + c, tile, PAD_TILE_ALPHA * edge, glyph, shade(tile, 1.4), PAD_GLYPH_ALPHA);
      }
    }
  }

  private paintFlower(pad: Pad, flower: Flower, palette: Palette, time: number): void {
    const { cw, ch, cols, rows } = this.grid;
    const centre = flowerCenter(pad, flower);
    // Slow breathing: petals close a little, then open again.
    const bloom = smoothstep(0.1, 0.9, 0.5 + 0.5 * Math.sin(time * 0.22 + flower.phase));
    const scale = 0.62 + 0.38 * bloom;
    const reach = flower.radius * scale;
    const tilt = pad.rot + time * 0.04 + flower.phase;
    const step = TAU / flower.petals;
    const c0 = Math.max(0, Math.floor((centre.x - reach) / cw));
    const c1 = Math.min(cols - 1, Math.floor((centre.x + reach) / cw));
    const r0 = Math.max(0, Math.floor((centre.y - reach) / ch));
    const r1 = Math.min(rows - 1, Math.floor((centre.y + reach) / ch));

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const dx = (c + 0.5) * cw - centre.x;
        const dy = (r + 0.5) * ch - centre.y;
        const dist = Math.hypot(dx, dy);
        if (dist > reach) continue;
        const i = r * cols + c;

        if (dist < reach * 0.17) {
          const seed = hash3(c, r, 3) < 0.5 ? "@" : "*";
          this.put(i, palette.stamen, FLOWER_ALPHA, seed, shade(palette.stamen, 0.55), 0.9);
          continue;
        }
        const theta = Math.atan2(dy, dx);
        const inner = this.petalHit(theta, dist, tilt + step / 2, step, reach * 0.62, 0.3);
        const outer = inner < 0 ? this.petalHit(theta, dist, tilt, step, reach, 0.3) : -1;
        if (inner < 0 && outer < 0) continue;

        const along = inner >= 0 ? inner : outer;
        const facing = -(dx * 0.6 + dy * 0.8) / reach;
        const lum = clamp((inner >= 0 ? 0.12 : 0.3) + 0.55 * along + 0.18 * facing, 0, 1);
        const tile = ramp(palette.petal, lum);
        const midrib = Math.abs(Math.sin(theta - tilt - (inner >= 0 ? step / 2 : 0)) * dist) < cw * 0.3;
        const glyph = midrib ? lineGlyph(dx, dy) : PETAL_GLYPHS[clamp(Math.floor(lum * 4), 0, 3)];
        this.put(i, tile, FLOWER_ALPHA, glyph, shade(tile, 1.35), 0.75);
      }
    }
  }

  /** How far (0 base .. 1 tip) a point lies along its nearest petal, or -1 outside every petal. */
  private petalHit(theta: number, dist: number, offset: number, step: number, length: number, slim: number): number {
    const a = (theta - offset) / step;
    const off = (a - Math.round(a)) * step;
    const along = dist * Math.cos(off);
    if (along <= 0 || along >= length) return -1;
    const t = along / length;
    const halfWidth = length * slim * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1)), 0.8);
    return dist * Math.abs(Math.sin(off)) < halfWidth ? t : -1;
  }
}

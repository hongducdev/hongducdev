import { lineGlyph } from "./koi-cell-style";
import { Fader } from "./koi-fader";
import type { PondGrid } from "./koi-grid";
import { TAU, clamp, hash3 } from "./koi-math";
import { ramp, shade, type Palette, type Rgb } from "./koi-palette";
import { swayPoint, type Blossom, type Branch } from "./koi-sakura";
import type { World } from "./koi-world";

const WOOD_ALPHA = 0.8;
const BLOSSOM_ALPHA = 0.9;
const PETAL_GLYPHS = ".:+*";
const PETALS = 5;

/** Paints the cherry-blossom branch into the grid's pad layer, over the koi. */
export class SakuraRasterizer {
  private fader = new Fader();
  private fade = 1;

  constructor(private grid: PondGrid) {}

  snap(): void {
    this.fader.snap();
  }

  rasterize(world: World, palette: Palette, dt: number): void {
    this.fade = this.fader.update(world.sakuraOn ? 1 : 0, dt);
    const branch = world.branch;
    if (this.fade <= 0.001 || !branch) return;
    const time = world.swayAllowed ? world.time : 0;
    for (const segment of branch.segments) this.paintWood(branch, segment, palette, time);
    for (const blossom of branch.blossoms) this.paintBlossom(branch, blossom, palette, time);
  }

  private put(i: number, tile: Rgb, tileAlpha: number, glyph: string, ink: Rgb, inkAlpha: number): void {
    this.grid.pad.put(i, tile, tileAlpha, glyph, ink, inkAlpha, this.fade);
  }

  private paintWood(
    branch: Branch,
    seg: { x0: number; y0: number; x1: number; y1: number; width: number },
    palette: Palette,
    time: number,
  ): void {
    const { cw, ch, cols, rows } = this.grid;
    const a = swayPoint(branch, time, seg.x0, seg.y0);
    const b = swayPoint(branch, time, seg.x1, seg.y1);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const steps = Math.ceil(len / (cw * 0.5));
    const glyph = lineGlyph(dx, dy);
    for (let n = 0; n <= steps; n++) {
      const t = n / steps;
      const px = a.x + dx * t;
      const py = a.y + dy * t;
      const c = Math.floor(px / cw);
      const r = Math.floor(py / ch);
      for (let k = 0; k < seg.width; k++) {
        const cc = c;
        const rr = r + k - (seg.width >> 1);
        if (cc < 0 || rr < 0 || cc >= cols || rr >= rows) continue;
        const lum = clamp(0.75 - k * 0.35 + (hash3(cc, rr, 13) - 0.5) * 0.3, 0, 1);
        const tile = ramp(palette.branch, lum);
        this.put(rr * cols + cc, tile, WOOD_ALPHA * (k === 0 ? 1 : 0.7), glyph, shade(tile, 1.4), 0.8);
      }
    }
  }

  private paintBlossom(branch: Branch, blossom: Blossom, palette: Palette, time: number): void {
    const { cw, ch, cols, rows } = this.grid;
    const at = swayPoint(branch, time, blossom.x, blossom.y);
    const reach = blossom.size;
    const c0 = Math.max(0, Math.floor((at.x - reach) / cw));
    const c1 = Math.min(cols - 1, Math.floor((at.x + reach) / cw));
    const r0 = Math.max(0, Math.floor((at.y - reach) / ch));
    const r1 = Math.min(rows - 1, Math.floor((at.y + reach) / ch));
    const lobe = TAU / PETALS;

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const dx = (c + 0.5) * cw - at.x;
        const dy = (r + 0.5) * ch - at.y;
        const dist = Math.hypot(dx, dy);
        if (dist > reach) continue;
        const i = r * cols + c;
        if (dist < reach * 0.2) {
          this.put(i, ramp(palette.blossom, 0.15), BLOSSOM_ALPHA, "*", palette.stamen, 0.9);
          continue;
        }
        const local = ((Math.atan2(dy, dx) - blossom.rot) % lobe + lobe) % lobe;
        const offCentre = Math.abs(local - lobe / 2);
        // A petal is widest mid-lobe and tapers toward the gap between neighbours; the tip is notched.
        const edge = reach * (0.55 + 0.45 * Math.cos((offCentre / (lobe / 2)) * 1.1));
        const notch = offCentre < 0.12 ? reach * 0.14 : 0;
        if (dist > edge - notch) continue;
        const gap = offCentre / (lobe / 2);
        const lum = clamp(0.3 + 0.55 * (dist / reach) - 0.3 * gap * gap + (hash3(c, r, 29) - 0.5) * 0.16, 0, 1);
        const tile = ramp(palette.blossom, lum);
        this.put(i, tile, BLOSSOM_ALPHA, PETAL_GLYPHS[clamp(Math.floor(lum * 4), 0, 3)], shade(tile, 0.8), 0.7);
      }
    }
  }
}

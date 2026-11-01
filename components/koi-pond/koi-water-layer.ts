import { lineGlyph } from "./koi-cell-style";
import type { PondGrid } from "./koi-grid";
import { smoothstep } from "./koi-math";
import { packRgb, type Palette, type Rgb } from "./koi-palette";
import { BITE_LIFE, KOI_NODES, PELLET_LIFE, PELLET_SINK, RIPPLE_SPEED, rippleLife, type World } from "./koi-world";

const MAX_STYLES = 4096;

/** Everything that happens on the water around the koi: wakes, ripples, pellets, bites and floor shadows. */
export class WaterLayer {
  private styles = new Map<number, string>();

  constructor(
    private ctx: CanvasRenderingContext2D,
    private grid: PondGrid,
  ) {}

  fillStyleFor(rgb: number): string {
    let style = this.styles.get(rgb);
    if (!style) {
      if (this.styles.size > MAX_STYLES) this.styles.clear();
      style =`rgb(${rgb >>> 16},${(rgb >>> 8) & 255},${rgb & 255})`;
      this.styles.set(rgb, style);
    }
    return style;
  }

  private glyphAt(index: number, glyph: string, rgb: Rgb, alpha: number): void {
    const { ctx, grid } = this;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.fillStyleFor(packRgb(rgb));
    ctx.fillText(
      glyph,
      (index % grid.cols) * grid.cw + grid.cw / 2,
      Math.floor(index / grid.cols) * grid.ch + grid.ch / 2,
    );
  }

  depositWake(world: World): void {
    const { grid } = this;
    for (const koi of world.koi) {
      for (let n = KOI_NODES - 4; n < KOI_NODES; n++) {
        const i = grid.cellIndex(koi.nodes[n * 2], koi.nodes[n * 2 + 1]);
        if (i >= 0) grid.energy[i] = Math.min(1.5, grid.energy[i] + 0.035 + koi.speed * 0.0012);
      }
    }
    if (world.pointer.active) {
      const i = grid.cellIndex(world.pointer.x, world.pointer.y);
      if (i >= 0) grid.energy[i] = Math.min(1.5, grid.energy[i] + 0.12);
    }
  }

  drawShadows(palette: Palette): void {
    const { grid } = this;
    for (let i = 0; i < grid.shadow.length; i++) {
      if (!grid.shadow[i] || grid.glyph[i]) continue;
      this.glyphAt(i, ":", palette.shadow, palette.shadowAlpha * grid.dim[i]);
    }
  }

  drawWake(palette: Palette): void {
    const { grid } = this;
    for (let i = 0; i < grid.energy.length; i++) {
      const e = grid.energy[i];
      if (e < 0.22 || grid.glyph[i] || grid.shadow[i]) continue;
      this.glyphAt(i, e > 0.5 ? "-" : ".", palette.water, Math.min(1, (e - 0.22) * 1.4) * 0.35);
    }
  }

  /** Expanding rings drawn as ASCII circles; the glyph follows the ring's tangent. */
  drawRipples(world: World, palette: Palette): void {
    const { grid } = this;
    const { cw, ch, cols, rows } = grid;
    for (const ripple of world.ripples) {
      const age = world.time - ripple.born;
      const fade = Math.pow(1 - age / rippleLife(ripple), 1.5) * ripple.strength;
      for (let ring = 0; ring < 2; ring++) {
        const radius = Math.max(0, age - ring * 0.45) * RIPPLE_SPEED * (0.7 + 0.5 * ripple.strength);
        if (radius < 2) continue;
        const band = cw * 0.6;
        const c0 = Math.max(0, Math.floor((ripple.x - radius - cw) / cw));
        const c1 = Math.min(cols - 1, Math.floor((ripple.x + radius + cw) / cw));
        const r0 = Math.max(0, Math.floor((ripple.y - radius - ch) / ch));
        const r1 = Math.min(rows - 1, Math.floor((ripple.y + radius + ch) / ch));
        const alpha = fade * (ring === 0 ? 0.55 : 0.3);
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const i = r * cols + c;
            if (grid.glyph[i]) continue;
            const dx = c * cw + cw / 2 - ripple.x;
            const dy = r * ch + ch / 2 - ripple.y;
            if (Math.abs(Math.hypot(dx, dy) - radius) > band) continue;
            this.glyphAt(i, ring === 1 ? "." : lineGlyph(-dy, dx), palette.water, alpha);
          }
        }
      }
    }
  }

  /** Pellets fall in (' then .), land as o, bob while floating, then dim to . as they sink. */
  drawPellets(world: World, palette: Palette, onPad: boolean): void {
    const { grid } = this;
    for (const pellet of world.pellets) {
      if (pellet.onPad !== onPad) continue;
      const age = world.time - pellet.born;
      if (!pellet.landed) {
        const fall = age / pellet.landAt;
        const i = grid.cellIndex(pellet.x, pellet.y - (1 - fall) * grid.ch * 1.5);
        if (i < 0 || grid.glyph[i]) continue;
        this.glyphAt(i, fall < 0.5 ? "'" : ".", palette.pellet, palette.alpha * (0.5 + 0.4 * fall));
        continue;
      }
      const i = grid.cellIndex(pellet.x, pellet.y);
      if (i < 0 || (!onPad && grid.glyph[i])) continue;
      const sink = smoothstep(PELLET_SINK, PELLET_LIFE, age);
      const bob = 0.8 + 0.2 * Math.sin(age * 3 + pellet.x);
      this.glyphAt(i, sink > 0.55 ? "." : "o", palette.pellet, palette.alpha * bob * (1 - 0.85 * sink));
    }
  }

  /** A bite flashes * over the mouth, settling to + then a dot as the splash takes over. */
  drawBites(world: World, palette: Palette): void {
    for (const bite of world.bites) {
      const i = this.grid.cellIndex(bite.x, bite.y);
      if (i < 0) continue;
      const t = (world.time - bite.born) / BITE_LIFE;
      this.glyphAt(i, t < 0.35 ? "*" : t < 0.7 ? "+" : ".", palette.pellet, Math.min(1, palette.alpha * 1.6) * (1 - t * t));
    }
  }
}

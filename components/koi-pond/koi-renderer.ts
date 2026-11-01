import { PondGrid } from "./koi-grid";
import { DARK, LIGHT, type Palette } from "./koi-palette";
import { KoiRasterizer } from "./koi-rasterizer";
import { WaterLayer } from "./koi-water-layer";
import type { Box, World } from "./koi-world";

const FALLBACK_FONT = "ui-monospace, SFMono-Regular, Menlo, monospace";

export class KoiRenderer {
  private ctx: CanvasRenderingContext2D;
  private grid = new PondGrid();
  private rasterizer = new KoiRasterizer(this.grid);
  private water: WaterLayer;
  private palette: Palette = DARK;
  private dpr = 1;
  private fontFamily = FALLBACK_FONT;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.water = new WaterLayer(ctx, this.grid);
  }

  setTheme(isLight: boolean): void {
    this.palette = isLight ? LIGHT : DARK;
  }

  setFontFamily(family: string): void {
    this.fontFamily = family ? `${family}, ${FALLBACK_FONT}` : FALLBACK_FONT;
  }

  setDimBoxes(boxes: readonly Box[]): void {
    this.grid.setDimBoxes(boxes);
  }

  resize(width: number, height: number, dpr: number): void {
    this.dpr = dpr;
    this.grid.resize(width, height);
    this.ctx.canvas.width = Math.round(width * dpr);
    this.ctx.canvas.height = Math.round(height * dpr);
  }

  render(world: World, dt: number): void {
    const { ctx, grid, palette, water } = this;
    if (grid.cols === 0) return;

    grid.clearFrame();
    // Deeper koi first, so the ones near the surface glide over them.
    const byDepth = [...world.koi].sort((a, b) => a.depth - b.depth);
    for (const koi of byDepth) this.rasterizer.rasterize(koi, palette, world.time);
    water.depositWake(world);
    grid.diffuse(dt);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.font = `600 ${Math.round(grid.ch * 0.72)}px ${this.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    water.drawShadows(palette);
    water.drawWake(palette);
    water.drawRipples(world, palette);
    water.drawPellets(world, palette);
    this.drawCells();
    water.drawBites(world, palette);
    ctx.globalAlpha = 1;
  }

  private drawCells(): void {
    const { ctx, grid, water } = this;
    const { cw, ch, cols } = grid;
    for (let i = 0; i < grid.glyph.length; i++) {
      const code = grid.glyph[i];
      if (!code) continue;
      const x = (i % cols) * cw;
      const y = Math.floor(i / cols) * ch;
      if (grid.tileAlpha[i] > 0) {
        ctx.globalAlpha = grid.tileAlpha[i] * grid.dim[i];
        ctx.fillStyle = water.fillStyleFor(grid.tile[i]);
        ctx.fillRect(x + 1, y + 1, cw - 1, ch - 1);
      }
      if (code === 32) continue;
      ctx.globalAlpha = grid.alpha[i] * grid.dim[i];
      ctx.fillStyle = water.fillStyleFor(grid.color[i]);
      ctx.fillText(String.fromCharCode(code), x + cw / 2, y + ch / 2 + 1);
    }
  }
}

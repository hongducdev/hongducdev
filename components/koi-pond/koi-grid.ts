import { clamp, smoothstep } from "./koi-math";
import { packRgb, type Rgb } from "./koi-palette";
import type { Box } from "./koi-world";

/** How visible a koi stays while swimming under page content. */
const DIM_UNDER_CONTENT = 0.15;

/** Cell buffers for one drawable layer: a tile fill plus an etched glyph per cell. */
export class CellLayer {
  glyph = new Uint16Array(0);
  color = new Uint32Array(0);
  alpha = new Float32Array(0);
  tile = new Uint32Array(0);
  tileAlpha = new Float32Array(0);

  resize(cells: number): void {
    this.glyph = new Uint16Array(cells);
    this.color = new Uint32Array(cells);
    this.alpha = new Float32Array(cells);
    this.tile = new Uint32Array(cells);
    this.tileAlpha = new Float32Array(cells);
  }

  clear(): void {
    this.glyph.fill(0);
    this.tileAlpha.fill(0);
  }

  put(i: number, tile: Rgb, tileAlpha: number, glyph: string, ink: Rgb, inkAlpha: number, fade: number): void {
    this.tile[i] = packRgb(tile);
    this.tileAlpha[i] = tileAlpha * fade;
    this.glyph[i] = glyph.charCodeAt(0);
    this.color[i] = packRgb(ink);
    this.alpha[i] = inkAlpha * fade;
  }
}

/** Per-cell scratch state for one frame of the glyph pond; koi occupy the grid's own buffers. */
export class PondGrid {
  cw = 8;
  ch = 10;
  cols = 0;
  rows = 0;

  glyph = new Uint16Array(0);
  color = new Uint32Array(0);
  alpha = new Float32Array(0);
  tile = new Uint32Array(0);
  tileAlpha = new Float32Array(0);
  /** 1 = fully visible; lower where koi pass under page content. */
  dim = new Float32Array(0);
  shadow = new Uint8Array(0);
  energy = new Float32Array(0);
  /** Lily pads and lotus flowers, drawn over the koi. */
  pad = new CellLayer();
  private energyTmp = new Float32Array(0);

  resize(width: number, height: number): void {
    this.cw = clamp(Math.round(width / 125), 8, 12);
    this.ch = this.cw + 2;
    this.cols = Math.ceil(width / this.cw);
    this.rows = Math.ceil(height / this.ch);
    const n = this.cols * this.rows;
    this.glyph = new Uint16Array(n);
    this.color = new Uint32Array(n);
    this.alpha = new Float32Array(n);
    this.tile = new Uint32Array(n);
    this.tileAlpha = new Float32Array(n);
    this.dim = new Float32Array(n).fill(1);
    this.shadow = new Uint8Array(n);
    this.pad.resize(n);
    this.energy = new Float32Array(n);
    this.energyTmp = new Float32Array(n);
  }

  clearFrame(): void {
    this.glyph.fill(0);
    this.tileAlpha.fill(0);
    this.shadow.fill(0);
    this.pad.clear();
  }

  cellIndex(x: number, y: number): number {
    const c = Math.floor(x / this.cw);
    const r = Math.floor(y / this.ch);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
    return r * this.cols + c;
  }

  /** Fades koi under the given canvas-space boxes, easing back in over a few cells around them. */
  setDimBoxes(boxes: readonly Box[]): void {
    const { cols, rows, cw, ch, dim } = this;
    dim.fill(1);
    const pad = cw * 4;
    for (const box of boxes) {
      const c0 = Math.max(0, Math.floor((box.left - pad) / cw));
      const c1 = Math.min(cols - 1, Math.floor((box.right + pad) / cw));
      const r0 = Math.max(0, Math.floor((box.top - pad) / ch));
      const r1 = Math.min(rows - 1, Math.floor((box.bottom + pad) / ch));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const x = c * cw + cw / 2;
          const y = r * ch + ch / 2;
          const dist = Math.hypot(Math.max(box.left - x, 0, x - box.right), Math.max(box.top - y, 0, y - box.bottom));
          const i = r * cols + c;
          dim[i] = Math.min(dim[i], DIM_UNDER_CONTENT + (1 - DIM_UNDER_CONTENT) * smoothstep(0, pad, dist));
        }
      }
    }
  }

  /** Blurs and decays the wake field so disturbances spread like ripples and fade. */
  diffuse(dt: number): void {
    const { cols, rows, energy, energyTmp: next } = this;
    const decay = Math.exp(-dt * 1.1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const left = c > 0 ? energy[i - 1] : energy[i];
        const right = c < cols - 1 ? energy[i + 1] : energy[i];
        const up = r > 0 ? energy[i - cols] : energy[i];
        const down = r < rows - 1 ? energy[i + cols] : energy[i];
        next[i] = (energy[i] * 4 + left + right + up + down) * 0.125 * decay;
      }
    }
    this.energy = next;
    this.energyTmp = energy;
  }
}

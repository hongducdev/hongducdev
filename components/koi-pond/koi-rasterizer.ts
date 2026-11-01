import { styleCell, type CellStyle } from "./koi-cell-style";
import type { PondGrid } from "./koi-grid";
import { clamp, hash3 } from "./koi-math";
import { packRgb, type Palette } from "./koi-palette";
import { FLAG_BARBEL, FLAG_FIN, bodyHalfWidth, classify, type ShapeHit } from "./koi-shape";
import { KOI_NODES, type Koi } from "./koi-world";

/** Sub-sample offsets within a cell, as fractions of its width and height. */
const SUBSAMPLES = [0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.75, 0.75];

/** Turns a koi's spine into glyph cells: body tiles, fins, eye, barbels and its shadow on the floor. */
export class KoiRasterizer {
  private spine = new Float32Array(KOI_NODES * 2);
  private arc = new Float32Array(KOI_NODES);
  private arcTotal = 1;
  private flareLeft = 1;
  private flareRight = 1;
  private hit: ShapeHit = { flag: 0, across: 1 };
  private hitS = 0;
  private hitV = 0;
  private hitDist = 0;
  private hitTx = 1;
  private hitTy = 0;
  private hitSeg = 0;
  private style: CellStyle = { glyph: " ", ink: [0, 0, 0], alpha: 1, tile: null, tileAlpha: 0 };

  constructor(private grid: PondGrid) {}

  /** Rebuilds the render spine: a travelling body wave that grows toward the tail, only while beating. */
  private buildSpine(koi: Koi): void {
    const { spine, arc } = this;
    const nodes = koi.nodes;
    const length = koi.length;
    const swim = 0.2 + 1.1 * koi.beat;
    for (let n = 0; n < KOI_NODES; n++) {
      const s = n / (KOI_NODES - 1);
      const a = Math.max(0, n - 1);
      const b = Math.min(KOI_NODES - 1, n + 1);
      let tx = nodes[a * 2] - nodes[b * 2];
      let ty = nodes[a * 2 + 1] - nodes[b * 2 + 1];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl;
      ty /= tl;
      const offset = length * 0.04 * (0.05 + 0.95 * Math.pow(s, 2.2)) * swim * Math.sin(koi.phase - s * 4.6);
      spine[n * 2] = nodes[n * 2] - ty * offset;
      spine[n * 2 + 1] = nodes[n * 2 + 1] + tx * offset;
    }
    arc[0] = 0;
    for (let n = 1; n < KOI_NODES; n++) {
      arc[n] = arc[n - 1] + Math.hypot(spine[n * 2] - spine[(n - 1) * 2], spine[n * 2 + 1] - spine[(n - 1) * 2 + 1]);
    }
    this.arcTotal = arc[KOI_NODES - 1] || 1;

    // Pectorals tuck in during a burst, scull while coasting, and the inner one braces in a turn.
    const spread = 1 - 0.25 * koi.beat;
    const scull = 0.18 * (1 - koi.beat) * Math.sin(koi.finPhase);
    const bank = clamp(koi.turn * 0.6, -0.35, 0.35);
    this.flareLeft = spread + scull - bank;
    this.flareRight = spread - scull + bank;
  }

  /** Finds the nearest spine point to (px, py) and classifies it against the koi outline. */
  private sample(px: number, py: number, length: number, from: number, to: number): boolean {
    const { spine, arc } = this;
    let best = Infinity;
    let bestS = 0;
    let bestSign = 1;
    let past = 0;
    let ahead = 0;
    let lateral = 0;
    for (let n = from; n <= to; n++) {
      const ax = spine[n * 2];
      const ay = spine[n * 2 + 1];
      const sx = spine[(n + 1) * 2] - ax;
      const sy = spine[(n + 1) * 2 + 1] - ay;
      const len2 = sx * sx + sy * sy || 1;
      const raw = ((px - ax) * sx + (py - ay) * sy) / len2;
      const u = clamp(raw, 0, 1);
      const d2 = (px - ax - sx * u) ** 2 + (py - ay - sy * u) ** 2;
      if (d2 >= best) continue;
      const len = Math.sqrt(len2);
      const cross = sx * (py - ay) - sy * (px - ax);
      best = d2;
      bestS = (arc[n] + u * len) / this.arcTotal;
      bestSign = cross >= 0 ? 1 : -1;
      past = n === KOI_NODES - 2 ? Math.max(0, raw - 1) * len : 0;
      ahead = n === 0 ? Math.max(0, -raw) * len : 0;
      lateral = Math.abs(cross) / len;
      this.hitTx = sx / len;
      this.hitTy = sy / len;
      this.hitSeg = n;
    }
    const dist = Math.sqrt(best);
    this.hitDist = dist;
    this.hitS = bestS;
    this.hitV = dist * bestSign;
    const flare = bestSign > 0 ? this.flareLeft : this.flareRight;
    return classify(bestS, dist / length, past / length, flare, this.hit, ahead / length, lateral / length);
  }

  rasterize(koi: Koi, palette: Palette, time: number): void {
    const grid = this.grid;
    const { cw, ch, cols, rows } = grid;
    const length = koi.length;
    this.buildSpine(koi);

    const { spine } = this;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let n = 0; n < KOI_NODES; n++) {
      minX = Math.min(minX, spine[n * 2]);
      maxX = Math.max(maxX, spine[n * 2]);
      minY = Math.min(minY, spine[n * 2 + 1]);
      maxY = Math.max(maxY, spine[n * 2 + 1]);
    }
    const reach = length * 0.26;
    const c0 = Math.max(0, Math.floor((minX - reach) / cw));
    const c1 = Math.min(cols - 1, Math.floor((maxX + reach) / cw));
    const r0 = Math.max(0, Math.floor((minY - reach) / ch));
    const r1 = Math.min(rows - 1, Math.floor((maxY + reach) / ch));
    if (c0 > c1 || r0 > r1) return;

    const diag = Math.hypot(cw, ch);
    // Near the surface a koi is brighter and its shadow falls farther away on the floor.
    const shadowDc = Math.round((length * 0.07 * koi.depth) / cw) + 1;
    const shadowDr = Math.round((length * 0.05 * koi.depth) / ch) + 1;
    const dim = palette.alpha * (palette.depthFloor + (1 - palette.depthFloor) * koi.depth);
    const hit = this.hit;
    const style = this.style;

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const x = c * cw;
        const y = r * ch;
        const centerHit = this.sample(x + cw / 2, y + ch / 2, length, 0, KOI_NODES - 2);
        if (!centerHit) {
          const waist = this.hitS > 0.4 && this.hitS < 0.62;
          const farthest = length * (waist ? 0.15 : 0.25) + diag;
          if (this.hitDist > farthest) {
            // Distance to the spine changes by at most a cell per cell, so skip cells that cannot reach it.
            c += Math.max(0, Math.floor((this.hitDist - farthest) / cw));
            continue;
          }
        }

        const from = Math.max(0, this.hitSeg - 2);
        const to = Math.min(KOI_NODES - 2, this.hitSeg + 2);
        let { flag, across } = hit;
        let s = this.hitS;
        let v = this.hitV;
        let tx = this.hitTx;
        let ty = this.hitTy;
        let hits = centerHit ? 1 : 0;
        let gx = 0;
        let gy = 0;
        const deepInside =
          centerHit &&
          flag !== FLAG_FIN &&
          flag !== FLAG_BARBEL &&
          s > 0.04 &&
          s < 0.72 &&
          bodyHalfWidth(s) * length - this.hitDist > diag * 0.35;
        if (deepInside) hits = 5;
        for (let q = 0; !deepInside && q < SUBSAMPLES.length; q += 2) {
          if (!this.sample(x + SUBSAMPLES[q] * cw, y + SUBSAMPLES[q + 1] * ch, length, from, to)) continue;
          gx += (SUBSAMPLES[q] - 0.5) * cw;
          gy += (SUBSAMPLES[q + 1] - 0.5) * ch;
          if (hits === 0) {
            ({ flag, across } = hit);
            s = this.hitS;
            v = this.hitV;
            tx = this.hitTx;
            ty = this.hitTy;
          }
          hits++;
        }
        if (hits === 0) continue;

        const coverage = hits / 5;
        const key = (hash3(Math.round(s * 90), Math.round(v / (cw * 0.8)), koi.id) * 4294967295) >>> 0;
        styleCell(
          {
            koi,
            palette,
            time,
            flag,
            across,
            s,
            v,
            tx,
            ty,
            coverage,
            offset: Math.hypot(gx, gy),
            solid: centerHit && coverage >= 0.6,
            key,
            dim,
            cellWidth: cw,
          },
          style,
        );
        if (style.glyph === " " && style.tileAlpha === 0) continue;

        const i = r * cols + c;
        if (hits === 5 && flag !== FLAG_FIN && flag !== FLAG_BARBEL) {
          const sc = c + shadowDc;
          const sr = r + shadowDr;
          if (sc < cols && sr < rows) grid.shadow[sr * cols + sc] = 1;
        }
        grid.tile[i] = style.tile ? packRgb(style.tile) : 0;
        grid.tileAlpha[i] = style.tileAlpha;
        grid.glyph[i] = style.glyph.charCodeAt(0);
        grid.color[i] = packRgb(style.ink);
        grid.alpha[i] = style.alpha;
      }
    }
  }
}

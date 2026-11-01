import { TAU, clamp, type Random } from "./koi-math";
import type { World } from "./koi-world";

export interface Segment {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Wood thickness in grid cells. */
  width: number;
}

export interface Blossom {
  x: number;
  y: number;
  /** Radius in pixels. */
  size: number;
  rot: number;
}

export interface Branch {
  /** Where the limb leaves the screen edge; the whole branch sways about this point. */
  anchorX: number;
  anchorY: number;
  reach: number;
  segments: Segment[];
  blossoms: Blossom[];
}

const SWAY_AMPLITUDE = 0.035;

/** A branch reaching in from the top-left corner, clear of the stats overlay at the top right. */
export function buildBranch(world: World, rng: Random): Branch {
  const { width: W, height: H, compact } = world;
  const reach = compact ? Math.min(W * 0.74, 340) : Math.min(W * 0.44, 700);
  const anchorX = -6;
  const anchorY = H * (compact ? 0.03 : 0.035);
  const segments: Segment[] = [];
  const blossoms: Blossom[] = [];
  const trunk = compact ? 2 : 4;
  const blossomSize = clamp(reach * 0.052, 16, 34);

  const bloom = (x: number, y: number, scale: number) => {
    blossoms.push({ x, y, size: blossomSize * scale * (0.85 + rng() * 0.3), rot: rng() * TAU });
  };

  // A full blossom with a smaller one or two nestled beside it reads as a cluster, not a lone flower.
  const cluster = (x: number, y: number, scale: number) => {
    bloom(x, y, scale);
    const extra = rng() < 0.45 ? 1 : 0;
    for (let k = 0; k < extra; k++) {
      const a = rng() * TAU;
      bloom(x + Math.cos(a) * blossomSize * 1.7, y + Math.sin(a) * blossomSize * 1.5, scale * 0.6);
    }
  };

  const growLimb = (x: number, y: number, angle: number, length: number, width: number, bend: number, depth: number) => {
    const steps = Math.max(3, Math.round(length / 60));
    let [cx, cy, a] = [x, y, angle];
    for (let i = 0; i < steps; i++) {
      a += bend + (rng() - 0.5) * 0.3;
      const nx = cx + Math.cos(a) * (length / steps);
      const ny = cy + Math.sin(a) * (length / steps);
      const taper = Math.max(1, Math.round(width * (1 - (i / steps) * 0.85)));
      segments.push({ x0: cx, y0: cy, x1: nx, y1: ny, width: taper });
      if (depth > 0 && i >= 1 && i < steps - 1 && rng() < 0.6) {
        const side = rng() < 0.65 ? 1 : -1;
        growLimb(nx, ny, a + side * (0.55 + rng() * 0.5), length * (0.3 + rng() * 0.2), Math.max(1, width - 2), 0.06 * side, depth - 1);
      }
      if (i >= 1 && (depth === 0 || rng() < 0.22)) cluster(nx, ny, depth === 0 ? 1 : 0.85);
      cx = nx;
      cy = ny;
    }
    cluster(cx, cy, 1.1);
  };

  growLimb(anchorX, anchorY, compact ? 0.22 : 0.3, reach, trunk, 0.035, compact ? 1 : 2);
  return { anchorX, anchorY, reach, segments, blossoms };
}

export function swayAngle(time: number, distance: number, reach: number): number {
  return Math.sin(time * 0.5) * SWAY_AMPLITUDE * (distance / reach);
}

/** A branch point after the wind has rocked the limb about its anchor. */
export function swayPoint(branch: Branch, time: number, x: number, y: number): { x: number; y: number } {
  const dx = x - branch.anchorX;
  const dy = y - branch.anchorY;
  const angle = swayAngle(time, Math.hypot(dx, dy), branch.reach);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: branch.anchorX + dx * cos - dy * sin, y: branch.anchorY + dx * sin + dy * cos };
}

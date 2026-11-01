import { repel } from "./koi-behavior";
import { TAU, angleDiff, clamp } from "./koi-math";
import type { World } from "./koi-world";

/** A lotus flower sitting on a pad; offsets are in pad-local space. */
export interface Flower {
  dx: number;
  dy: number;
  radius: number;
  petals: number;
  phase: number;
}

export interface Pad {
  x: number;
  y: number;
  radius: number;
  rot: number;
  vx: number;
  vy: number;
  spin: number;
  /** Direction of the wedge cut out of the pad, relative to `rot`. */
  notchAngle: number;
  notchHalf: number;
  /** 1 right after a koi bumps the pad, fading. */
  wobble: number;
  nextRipple: number;
  flower: Flower | null;
}

const MAX_DRIFT = 3;
const NOTCH_CENTER_RADIUS = 0.05;
const PAD_EDGE = 0.92;
/** Koi swimming deeper than this pass cleanly beneath the pads. */
const BUMP_DEPTH = 0.7;

function isCompact(world: World): boolean {
  return world.width < 768;
}

function overlaps(pads: readonly Pad[], x: number, y: number, radius: number): boolean {
  return pads.some((p) => Math.hypot(p.x - x, p.y - y) < (p.radius + radius) * 1.1);
}

/** Pads gather along the side margins so the centre and the text stay open water. */
export function seedPads(world: World): Pad[] {
  const { width: W, height: H } = world;
  const count = clamp(Math.round((W * H) / 220000), 3, 6);
  const flowers = clamp(Math.floor(count / 2), 1, 3);
  const baseRadius = clamp(Math.min(W, H) * 0.1, 46, 120);
  const pads: Pad[] = [];

  for (let i = 0; i < count; i++) {
    const radius = baseRadius * world.rand(0.7, 1.2);
    let x = W / 2;
    let y = H / 2;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (isCompact(world)) {
        x = world.rand(0.12, 0.88) * W;
        y = world.rand(0.06, 0.5) * H;
      } else {
        const left = i % 2 === 0;
        x = (left ? world.rand(0.03, 0.17) : world.rand(0.8, 0.97)) * W;
        y = world.rand(0.1, 0.9) * H;
      }
      if (!overlaps(pads, x, y, radius)) break;
    }
    const notchAngle = world.rand(0, TAU);
    pads.push({
      x,
      y,
      radius,
      rot: world.rand(0, TAU),
      vx: 0,
      vy: 0,
      spin: world.rand(-0.03, 0.03),
      notchAngle,
      notchHalf: world.rand(0.16, 0.28),
      wobble: 0,
      nextRipple: 0,
      flower:
        i < flowers
          ? {
              dx: -Math.cos(notchAngle) * radius * 0.12,
              dy: -Math.sin(notchAngle) * radius * 0.12,
              radius: radius * 0.85,
              petals: 8 + Math.floor(world.random() * 3),
              phase: world.rand(0, TAU),
            }
          : null,
    });
  }
  return pads;
}

/** The pad whose leaf covers (x, y), or null for open water (the notch is open water too). */
export function padAt(pads: readonly Pad[], x: number, y: number): Pad | null {
  for (const pad of pads) {
    const dx = x - pad.x;
    const dy = y - pad.y;
    const dist = Math.hypot(dx, dy);
    if (dist > pad.radius * PAD_EDGE) continue;
    if (dist > pad.radius * NOTCH_CENTER_RADIUS) {
      const toNotch = angleDiff(pad.rot + pad.notchAngle, Math.atan2(dy, dx));
      if (Math.abs(toNotch) < pad.notchHalf) continue;
    }
    return pad;
  }
  return null;
}

/** Where a flower's centre sits in canvas space. */
export function flowerCenter(pad: Pad, flower: Flower): { x: number; y: number } {
  const cos = Math.cos(pad.rot);
  const sin = Math.sin(pad.rot);
  return { x: pad.x + flower.dx * cos - flower.dy * sin, y: pad.y + flower.dx * sin + flower.dy * cos };
}

function bumpFromKoi(world: World, pad: Pad): void {
  for (const koi of world.koi) {
    if (koi.depth < BUMP_DEPTH) continue;
    for (let n = 0; n < koi.nodes.length / 2; n += 2) {
      const ox = pad.x - koi.nodes[n * 2];
      const oy = pad.y - koi.nodes[n * 2 + 1];
      const dist = Math.hypot(ox, oy);
      if (dist > pad.radius * 0.85 + koi.length * 0.05) continue;
      const ux = ox / (dist || 1);
      const uy = oy / (dist || 1);
      pad.wobble = 1;
      pad.vx += ux * 0.6;
      pad.vy += uy * 0.6;
      if (world.time > pad.nextRipple) {
        world.ripples.push({
          x: pad.x - ux * pad.radius * 0.95,
          y: pad.y - uy * pad.radius * 0.95,
          born: world.time,
          strength: 0.2,
        });
        pad.nextRipple = world.time + 0.9;
      }
      return;
    }
  }
}

export function stepPads(world: World, dt: number): void {
  const { width: W, height: H } = world;
  for (const pad of world.activePads) {
    pad.vx += (world.random() - 0.5) * dt * 1.2;
    pad.vy += (world.random() - 0.5) * dt * 1.2;

    const push = repel(world.avoid, pad.x, pad.y, pad.radius * 1.2);
    pad.vx += push.x * dt * 8;
    pad.vy += push.y * dt * 8;
    // Keep the pad on screen, drifting back from the edges.
    pad.vx += clamp((pad.radius - pad.x) / pad.radius, 0, 1) * dt * 4;
    pad.vx -= clamp((pad.x - (W - pad.radius)) / pad.radius, 0, 1) * dt * 4;
    pad.vy += clamp((pad.radius - pad.y) / pad.radius, 0, 1) * dt * 4;
    pad.vy -= clamp((pad.y - (H - pad.radius)) / pad.radius, 0, 1) * dt * 4;

    const damp = Math.exp(-dt * 0.8);
    pad.vx *= damp;
    pad.vy *= damp;
    const speed = Math.hypot(pad.vx, pad.vy);
    if (speed > MAX_DRIFT) {
      pad.vx *= MAX_DRIFT / speed;
      pad.vy *= MAX_DRIFT / speed;
    }
    pad.x += pad.vx * dt;
    pad.y += pad.vy * dt;
    pad.rot += pad.spin * dt;
    pad.wobble = Math.max(0, pad.wobble - dt * 1.2);
    bumpFromKoi(world, pad);
  }
}

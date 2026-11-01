import { stepKoi } from "./koi-behavior";
import { padAt, seedPads, stepPads, type Pad } from "./koi-lotus";
import { TAU, clamp, type Random } from "./koi-math";

export const KOI_NODES = 20;
export const RIPPLE_SPEED = 52;
export const PELLET_LIFE = 14;
/** Uneaten pellets start sinking this many seconds in and are gone by PELLET_LIFE. */
export const PELLET_SINK = 9;
export const BITE_LIFE = 0.45;
export const MAX_PELLETS = 24;
const THROW_RADIUS = 34;
const RUSH_RANGE = 650;
const ROLL_SPEED = 10;

export type Variety = "kohaku" | "sanke" | "tancho";

const VARIETY_WEIGHTS: ReadonlyArray<readonly [Variety, number]> = [
  ["kohaku", 3],
  ["sanke", 2],
  ["tancho", 1],
];

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Pellet {
  x: number;
  y: number;
  born: number;
  /** Seconds after `born` until it hits the water; koi cannot eat it before then. */
  landAt: number;
  landed: boolean;
  /** Resting on a lily pad: out of reach until it slides off the rim. */
  onPad: boolean;
  vx: number;
  vy: number;
}

export interface Bite {
  x: number;
  y: number;
  born: number;
}

export interface Ripple {
  x: number;
  y: number;
  born: number;
  strength: number;
}

export interface Koi {
  id: number;
  variety: Variety;
  length: number;
  /** Spine positions, snout first: x0, y0, x1, y1, ... */
  nodes: Float32Array;
  heading: number;
  speed: number;
  phase: number;
  /** Smoothed angular velocity; splays the fins into turns. */
  turn: number;
  wander: number;
  curiosity: number;
  /** 0.5 deep and dim .. 1 just under the surface. */
  depth: number;
  depthTarget: number;
  depthMax: number;
  nextDive: number;
  nextSurface: number;
  nextWake: number;
  /** 1 right after food splashes nearby, fading: the koi sprints and turns harder. */
  rush: number;
  food: Pellet | null;
  /** Tail-beat intensity: koi swim in bursts of beats, then coast. */
  beat: number;
  burstUntil: number;
  nextBurst: number;
  finPhase: number;
  /** 1 right after a fright, fading. */
  startle: number;
  fleeX: number;
  fleeY: number;
  /** How far the mouth opens while closing in on food. */
  gulp: number;
}

export function rippleLife(ripple: Ripple): number {
  return 2.2 + ripple.strength * 1.6;
}

export class World {
  width = 0;
  height = 0;
  time = 0;
  koi: Koi[] = [];
  pellets: Pellet[] = [];
  bites: Bite[] = [];
  ripples: Ripple[] = [];
  pads: Pad[] = [];
  pointer = { x: 0, y: 0, speed: 0, active: false };
  /** Page content the koi steer around, in canvas space. */
  avoid: Box[] = [];
  lastFeed = -Infinity;

  constructor(readonly random: Random = Math.random) {}

  rand(lo: number, hi: number): number {
    return lo + this.random() * (hi - lo);
  }

  resize(width: number, height: number): void {
    const first = this.width === 0;
    this.width = width;
    this.height = height;
    if (first) this.seed();
  }

  private pickVariety(): Variety {
    const total = VARIETY_WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = this.random() * total;
    for (const [variety, weight] of VARIETY_WEIGHTS) {
      roll -= weight;
      if (roll <= 0) return variety;
    }
    return "kohaku";
  }

  private seed(): void {
    const { width: W, height: H } = this;
    const baseLength = clamp(Math.min(W, H) * 0.5, 170, 420);
    const adults = clamp(Math.round((W * H) / 240000), 3, 6);
    const young = W >= 1024 ? 2 : 0;

    this.pads = seedPads(this);
    this.koi = [];
    for (let i = 0; i < adults + young; i++) {
      const isYoung = i >= adults;
      const length = baseLength * (isYoung ? this.rand(0.32, 0.45) : this.rand(0.6, 1));
      const depthMax = isYoung ? 0.72 : 1;
      const heading = this.rand(0, TAU);
      const x = this.rand(W * 0.1, W * 0.9);
      const y = this.rand(H * 0.1, H * 0.9);
      const nodes = new Float32Array(KOI_NODES * 2);
      const segment = length / (KOI_NODES - 1);
      for (let n = 0; n < KOI_NODES; n++) {
        nodes[n * 2] = x - Math.cos(heading) * segment * n;
        nodes[n * 2 + 1] = y - Math.sin(heading) * segment * n;
      }
      this.koi.push({
        id: i + 1,
        variety: this.pickVariety(),
        length,
        nodes,
        heading,
        speed: 20,
        phase: this.rand(0, TAU),
        turn: 0,
        wander: 0,
        curiosity: this.rand(0.35, 1),
        depth: this.rand(0.5, depthMax),
        depthTarget: this.rand(0.5, depthMax),
        depthMax,
        nextDive: this.rand(6, 18),
        nextSurface: this.rand(3, 14),
        nextWake: this.rand(0, 2),
        rush: 0,
        food: null,
        beat: 0,
        burstUntil: 0,
        nextBurst: this.rand(0, 3),
        finPhase: this.rand(0, TAU),
        startle: 0,
        fleeX: 0,
        fleeY: 0,
        gulp: 0,
      });
    }
  }

  /** A loose handful thrown at (x, y): pellets land a beat apart, each with its own splash. */
  feed(x: number, y: number): void {
    this.lastFeed = this.time;
    this.ripples.push({ x, y, born: this.time, strength: 0.35 });
    const count = Math.min(5 + Math.floor(this.random() * 3), MAX_PELLETS - this.pellets.length);
    for (let k = 0; k < count; k++) {
      const angle = this.rand(0, TAU);
      const radius = Math.sqrt(this.random()) * THROW_RADIUS;
      const drift = this.rand(2, 6);
      this.pellets.push({
        x: x + Math.cos(angle) * radius * 1.3,
        y: y + Math.sin(angle) * radius,
        born: this.time,
        landAt: this.rand(0.15, 0.45),
        landed: false,
        onPad: false,
        vx: Math.cos(angle) * drift,
        vy: Math.sin(angle) * drift,
      });
    }
  }

  step(dt: number): void {
    this.time += dt;
    this.pointer.speed *= Math.exp(-dt * 8);
    for (const koi of this.koi) stepKoi(this, koi, dt);
    stepPads(this, dt);

    const now = this.time;
    this.pellets = this.pellets.filter((p) => now - p.born < PELLET_LIFE);
    for (const pellet of this.pellets) {
      if (!pellet.landed) {
        if (now - pellet.born < pellet.landAt) continue;
        pellet.landed = true;
        // A pellet landing on a leaf makes no splash, so the koi do not rush for it.
        if (padAt(this.pads, pellet.x, pellet.y)) continue;
        this.ripples.push({ x: pellet.x, y: pellet.y, born: now, strength: 0.1 });
        for (const koi of this.koi) {
          if (Math.hypot(koi.nodes[0] - pellet.x, koi.nodes[1] - pellet.y) < RUSH_RANGE) koi.rush = 1;
        }
        continue;
      }
      this.driftPellet(pellet, dt);
    }
    this.ripples = this.ripples.filter((r) => now - r.born < rippleLife(r));
    this.bites = this.bites.filter((b) => now - b.born < BITE_LIFE);
  }

  /** Pellets float freely on open water; on a leaf they roll toward its rim. */
  private driftPellet(pellet: Pellet, dt: number): void {
    const pad = padAt(this.pads, pellet.x, pellet.y);
    pellet.onPad = pad !== null;
    if (pad) {
      const ox = pellet.x - pad.x;
      const oy = pellet.y - pad.y;
      const len = Math.hypot(ox, oy) || 1;
      pellet.vx = pad.vx + (ox / len) * ROLL_SPEED;
      pellet.vy = pad.vy + (oy / len) * ROLL_SPEED;
    } else {
      const damp = Math.exp(-dt * 0.2);
      pellet.vx *= damp;
      pellet.vy *= damp;
    }
    pellet.x += pellet.vx * dt;
    pellet.y += pellet.vy * dt;
  }

  /** Keeps the current target while it lasts; switches only for a pellet less than half as far. */
  pickFood(koi: Koi, x: number, y: number, range: number): Pellet | null {
    if (koi.food && (koi.food.onPad || !this.pellets.includes(koi.food))) koi.food = null;
    const nearest = this.nearestPellet(x, y, range);
    if (!koi.food) return (koi.food = nearest);
    const current = Math.hypot(koi.food.x - x, koi.food.y - y);
    if (current > range * 1.3) koi.food = nearest;
    else if (nearest && Math.hypot(nearest.x - x, nearest.y - y) < current * 0.5) koi.food = nearest;
    return koi.food;
  }

  private nearestPellet(x: number, y: number, range: number): Pellet | null {
    let best: Pellet | null = null;
    let bestDist = range * range;
    for (const pellet of this.pellets) {
      if (!pellet.landed || pellet.onPad) continue;
      const d = (pellet.x - x) ** 2 + (pellet.y - y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = pellet;
      }
    }
    return best;
  }

  /** Removes landed pellets within `radius` of the mouth; returns how many were eaten. */
  eatAt(x: number, y: number, radius: number): number {
    const before = this.pellets.length;
    this.pellets = this.pellets.filter((p) => !p.landed || p.onPad || (p.x - x) ** 2 + (p.y - y) ** 2 > radius * radius);
    const eaten = before - this.pellets.length;
    if (eaten > 0) {
      this.ripples.push({ x, y, born: this.time, strength: 0.6 });
      this.bites.push({ x, y, born: this.time });
    }
    return eaten;
  }
}

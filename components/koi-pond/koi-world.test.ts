import { describe, expect, test } from "bun:test";
import { createRng } from "./koi-math";
import { KOI_NODES, PELLET_LIFE, World } from "./koi-world";

const STEP = 1 / 60;

function makeWorld(width = 1280, height = 800, seed = 11) {
  const world = new World(createRng(seed));
  world.resize(width, height);
  return world;
}

function run(world: World, seconds: number, each?: () => void) {
  for (let i = 0; i < Math.round(seconds / STEP); i++) {
    world.step(STEP);
    each?.();
  }
}

describe("World seeding", () => {
  test("koi count follows the area, with young koi only on wide screens", () => {
    expect(makeWorld(1280, 800).koi.length).toBe(4 + 2);
    expect(makeWorld(390, 844).koi.length).toBe(3);
    expect(makeWorld(3000, 2000).koi.length).toBe(6 + 2);
  });

  test("koi are large: adults span 60-100% of half the short side, clamped to 170-420 px", () => {
    const world = makeWorld(1280, 800);
    const adults = world.koi.filter((k) => k.depthMax === 1);
    for (const koi of adults) {
      expect(koi.length).toBeGreaterThanOrEqual(0.6 * 400);
      expect(koi.length).toBeLessThanOrEqual(400);
    }
    expect(makeWorld(390, 844).koi[0].length).toBeLessThanOrEqual(195);
  });
});

describe("World.step", () => {
  test("every koi turns back toward the pond instead of leaving for good", () => {
    const world = makeWorld();
    run(world, 60, () => {
      for (const koi of world.koi) {
        expect(Number.isFinite(koi.nodes[0]) && Number.isFinite(koi.nodes[1])).toBe(true);
        expect(koi.nodes[0]).toBeGreaterThan(-koi.length * 1.5);
        expect(koi.nodes[0]).toBeLessThan(world.width + koi.length * 1.5);
        expect(koi.nodes[1]).toBeGreaterThan(-koi.length * 1.5);
        expect(koi.nodes[1]).toBeLessThan(world.height + koi.length * 1.5);
      }
    });
  });

  test("the spine keeps its segment length", () => {
    const world = makeWorld();
    run(world, 10);
    for (const koi of world.koi) {
      const segment = koi.length / (KOI_NODES - 1);
      for (let n = 1; n < KOI_NODES; n++) {
        const d = Math.hypot(
          koi.nodes[n * 2] - koi.nodes[(n - 1) * 2],
          koi.nodes[n * 2 + 1] - koi.nodes[(n - 1) * 2 + 1],
        );
        expect(d).toBeCloseTo(segment, 2);
      }
    }
  });

  test("a thrown handful lands, draws the koi, and is eaten before it sinks", () => {
    const world = makeWorld();
    world.feed(640, 400);
    expect(world.pellets.length).toBeGreaterThanOrEqual(5);
    expect(world.pellets.length).toBeLessThanOrEqual(7);
    expect(world.pellets.every((p) => !p.landed)).toBe(true);

    run(world, 1);
    expect(world.pellets.every((p) => p.landed)).toBe(true);
    expect(world.koi.some((k) => k.rush > 0 || k.food !== null)).toBe(true);

    let bitten = 0;
    run(world, PELLET_LIFE - 3, () => {
      bitten = Math.max(bitten, world.bites.length);
    });
    expect(bitten).toBeGreaterThan(0);
    expect(world.pellets.length).toBeLessThan(5);
  });

  test("a full pond takes no more food", () => {
    const world = makeWorld();
    for (let i = 0; i < 10; i++) world.feed(100 + i * 50, 100);
    expect(world.pellets.length).toBeLessThanOrEqual(24);
  });

  test("a fast swipe next to a koi spooks it, but not while it chases food", () => {
    const world = makeWorld();
    const koi = world.koi[0];
    world.pointer = { x: koi.nodes[0] + 5, y: koi.nodes[1], speed: 3000, active: true };
    world.step(STEP);
    expect(koi.startle).toBeGreaterThan(0.9);

    const calm = makeWorld();
    calm.feed(300, 300);
    calm.pointer = { x: calm.koi[0].nodes[0] + 5, y: calm.koi[0].nodes[1], speed: 3000, active: true };
    calm.step(STEP);
    expect(calm.koi[0].startle).toBe(0);
  });
});

describe("Lotus", () => {
  test("pads gather along the side margins and flowers sit on some of them", () => {
    const world = makeWorld(1280, 800);
    expect(world.pads.length).toBe(5);
    for (const pad of world.pads) {
      const edge = pad.x < 0.2 * world.width || pad.x > 0.78 * world.width;
      expect(edge).toBe(true);
    }
    const flowers = world.pads.filter((p) => p.flower).length;
    expect(flowers).toBeGreaterThanOrEqual(1);
    expect(flowers).toBeLessThanOrEqual(3);
    expect(makeWorld(390, 844).pads.every((p) => p.y < 0.6 * 844)).toBe(true);
  });

  test("pads drift but stay on screen", () => {
    const world = makeWorld();
    run(world, 120, () => {
      for (const pad of world.pads) {
        expect(pad.x).toBeGreaterThan(-pad.radius);
        expect(pad.x).toBeLessThan(world.width + pad.radius);
        expect(pad.y).toBeGreaterThan(-pad.radius);
        expect(pad.y).toBeLessThan(world.height + pad.radius);
      }
    });
  });

  test("a pellet on a leaf rolls to the rim, out of the koi's reach until then", () => {
    const world = makeWorld();
    const pad = world.pads[0];
    world.koi.forEach((k) => (k.food = null));
    // aim opposite the notch so the pellet lands on the leaf itself
    const angle = pad.rot + pad.notchAngle + Math.PI;
    world.pellets.push({
      x: pad.x + Math.cos(angle) * pad.radius * 0.3,
      y: pad.y + Math.sin(angle) * pad.radius * 0.3,
      born: world.time,
      landAt: 0,
      landed: false,
      onPad: false,
      vx: 0,
      vy: 0,
    });
    run(world, 0.5);
    const pellet = world.pellets[0];
    expect(pellet.landed).toBe(true);
    expect(pellet.onPad).toBe(true);
    expect(world.ripples.some((r) => r.strength === 0.1)).toBe(false);
    expect(world.eatAt(pellet.x, pellet.y, 50)).toBe(0);

    run(world, 8);
    const left = world.pellets[0];
    if (left) expect(left.onPad).toBe(false);
  });

  test("a koi swimming near the surface under a pad rocks it and sends a ring", () => {
    const world = makeWorld();
    const pad = world.pads[0];
    const koi = world.koi[0];
    koi.depth = 1;
    koi.depthTarget = 1;
    for (let n = 0; n < KOI_NODES; n++) {
      koi.nodes[n * 2] = pad.x;
      koi.nodes[n * 2 + 1] = pad.y;
    }
    world.step(STEP);
    expect(pad.wobble).toBeGreaterThan(0.9);
    expect(world.ripples.length).toBeGreaterThan(0);
  });
});

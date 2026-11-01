import { describe, expect, test } from "bun:test";
import { skinAt } from "./koi-markings";
import { createRng } from "./koi-math";
import { DARK, LIGHT, clonePalette, lerpPalette } from "./koi-palette";
import { swayPoint } from "./koi-sakura";
import { VARIETIES, VISIBILITY_THRESHOLD, allowedVarieties } from "./koi-varieties";
import { World } from "./koi-world";

const STEP = 1 / 60;

function makeWorld(seed = 11, width = 1280, height = 800) {
  const world = new World(createRng(seed), seed + 1);
  world.resize(width, height);
  return world;
}

function run(world: World, seconds: number) {
  for (let i = 0; i < Math.round(seconds / STEP); i++) world.step(STEP);
}

describe("lerpPalette", () => {
  test("k=0 matches the source and k=1 the target", () => {
    const out = clonePalette(DARK);
    lerpPalette(DARK, LIGHT, 0, out);
    expect(out.bg).toEqual(DARK.bg);
    expect(out.varieties.ogon.base).toEqual(DARK.varieties.ogon.base);
    expect(out.alpha).toBe(DARK.alpha);
    lerpPalette(DARK, LIGHT, 1, out);
    expect(out.bg).toEqual(LIGHT.bg);
    expect(out.hi).toEqual(LIGHT.hi);
    expect(out.varieties.kumonryu.patch).toEqual(LIGHT.varieties.kumonryu.patch);
    expect(out.depthFloor).toBe(LIGHT.depthFloor);
  });

  test("keeps array identity so red skin is still recognised by reference", () => {
    const out = clonePalette(DARK);
    const { red, hi, base } = { red: out.red, hi: out.hi[2], base: out.varieties.ogon.base };
    lerpPalette(DARK, LIGHT, 0.5, out);
    expect(out.red).toBe(red);
    expect(out.hi[2]).toBe(hi);
    expect(out.varieties.ogon.base).toBe(base);
  });

  test("ramps have equal stop counts in both themes", () => {
    for (const key of ["hi", "pad", "petal", "branch", "blossom"] as const) {
      expect(DARK[key].length).toBe(LIGHT[key].length);
    }
  });
});

describe("variety visibility", () => {
  test("kohaku and sanke stay allowed in both themes", () => {
    for (const palette of [DARK, LIGHT]) {
      const allowed = allowedVarieties(palette, VISIBILITY_THRESHOLD);
      expect(allowed).toContain("kohaku");
      expect(allowed).toContain("sanke");
    }
  });

  test("black koi are locked on dark and white koi on light", () => {
    expect(allowedVarieties(DARK, VISIBILITY_THRESHOLD)).not.toContain("kumonryu");
    expect(allowedVarieties(LIGHT, VISIBILITY_THRESHOLD)).not.toContain("platinum");
    expect(allowedVarieties(DARK, VISIBILITY_THRESHOLD)).toContain("platinum");
    expect(allowedVarieties(LIGHT, VISIBILITY_THRESHOLD)).toContain("kumonryu");
  });
});

describe("World varieties", () => {
  test("spawning honours the allowed set", () => {
    const world = new World(createRng(5), 6);
    world.setVarieties(["ogon"]);
    world.resize(1280, 800);
    expect(world.koi.every((k) => k.variety === "ogon")).toBe(true);
  });

  test("an empty set falls back to kohaku", () => {
    const world = makeWorld();
    world.setVarieties([]);
    expect(world.koi.every((k) => k.variety === "kohaku")).toBe(true);
  });

  test("reassigning rebuilds markings", () => {
    const world = makeWorld();
    const koi = world.koi[0];
    koi.variety = "kohaku";
    koi.markings = null;
    skinAt(koi, DARK, 0.4, 0, 0.2);
    expect(koi.markings).not.toBeNull();
    world.setVarieties(["benigoi"]);
    expect(koi.variety as string).toBe("benigoi");
    expect(koi.markings).toBeNull();
  });

  test("a newly enabled variety shows up on an existing koi", () => {
    const world = makeWorld();
    world.setVarieties(["kohaku"]);
    world.setVarieties(["kohaku", "ogon"]);
    expect(world.koi.some((k) => k.variety === "ogon")).toBe(true);
  });

  test("every variety has a positive weight and a unique id", () => {
    expect(new Set(VARIETIES.map((v) => v.id)).size).toBe(VARIETIES.length);
    expect(VARIETIES.every((v) => v.weight > 0)).toBe(true);
  });
});

describe("lotus toggle", () => {
  test("off empties activePads but keeps the pads, and back on restores them", () => {
    const world = makeWorld();
    const pads = [...world.pads];
    expect(world.activePads).toBe(world.pads);
    world.lotusOn = false;
    expect(world.activePads).toEqual([]);
    run(world, 2);
    world.lotusOn = true;
    expect(world.activePads.length).toBe(pads.length);
    expect(world.pads.every((p, i) => p === pads[i])).toBe(true);
  });

  test("a pellet landing on a former pad makes a splash like open water", () => {
    const world = makeWorld();
    const pad = world.pads[0];
    world.lotusOn = false;
    world.ripples = [];
    world.pellets.push({ x: pad.x, y: pad.y, born: world.time, landAt: 0.1, landed: false, onPad: false, vx: 0, vy: 0 });
    run(world, 0.3);
    expect(world.ripples.length).toBeGreaterThan(0);
  });
});

describe("sakura branch", () => {
  test("builds blossoms and wood on resize", () => {
    const world = makeWorld();
    expect(world.branch?.segments.length).toBeGreaterThan(0);
    expect(world.branch?.blossoms.length).toBeGreaterThan(0);
  });

  test("sway grows with distance from the anchor and leaves the anchor fixed", () => {
    const branch = makeWorld().branch!;
    const at = swayPoint(branch, 1.5, branch.anchorX, branch.anchorY);
    expect(at.x).toBeCloseTo(branch.anchorX);
    expect(at.y).toBeCloseTo(branch.anchorY);
    const far = swayPoint(branch, 1.5, branch.anchorX + branch.reach, branch.anchorY);
    expect(Math.abs(far.y - branch.anchorY)).toBeGreaterThan(0.1);
  });

  test("toggling sakura never shifts seeded koi positions", () => {
    const on = makeWorld();
    const off = makeWorld();
    off.sakuraOn = false;
    run(on, 20);
    run(off, 20);
    for (let i = 0; i < on.koi.length; i++) {
      expect(Array.from(off.koi[i].nodes)).toEqual(Array.from(on.koi[i].nodes));
    }
  });
});

import { hash3, valueNoise } from "./koi-math";
import type { Palette, Rgb } from "./koi-palette";
import type { Koi } from "./koi-world";

/** An elliptical marking in body space: centre (s, v) along/across the spine, radii (rs, rv), as fractions of length. */
interface Patch {
  s: number;
  v: number;
  rs: number;
  rv: number;
}

interface Markings {
  red: Patch[];
  black: Patch[];
}

const cache = new Map<number, Markings>();

/**
 * Markings are seeded by koi id so each fish keeps one pattern: kohaku has a red head and two or
 * three red saddles on white, sanke adds small black spots, tancho a single red disc on the crown.
 */
function buildMarkings(koi: Koi): Markings {
  const roll = (j: number) => hash3(koi.id, j, 41);
  if (koi.variety === "tancho") return { red: [{ s: 0.11, v: 0, rs: 0.05, rv: 0.055 }], black: [] };

  const red: Patch[] = [];
  if (roll(0) < 0.75) red.push({ s: 0.1, v: (roll(1) - 0.5) * 0.03, rs: 0.055 + roll(2) * 0.03, rv: 0.11 });
  const saddles = 2 + Math.floor(roll(3) * 2);
  const span = 0.42 / saddles;
  for (let j = 0; j < saddles; j++) {
    red.push({
      s: 0.25 + span * (j + 0.5) + (roll(10 + j) - 0.5) * span * 0.3,
      v: (roll(20 + j) - 0.5) * 0.05,
      rs: span * (0.32 + roll(30 + j) * 0.12),
      rv: 0.09 + roll(40 + j) * 0.05,
    });
  }

  const black: Patch[] = [];
  if (koi.variety === "sanke") {
    const spots = 4 + Math.floor(roll(50) * 3);
    for (let j = 0; j < spots; j++) {
      black.push({ s: 0.24 + roll(60 + j) * 0.44, v: (roll(70 + j) - 0.5) * 0.16, rs: 0.022, rv: 0.026 });
    }
  }
  return { red, black };
}

function markingsFor(koi: Koi): Markings {
  let markings = cache.get(koi.id);
  if (!markings) {
    markings = buildMarkings(koi);
    cache.set(koi.id, markings);
  }
  return markings;
}

function covers(patch: Patch, s: number, vn: number, wobble: number): boolean {
  return ((s - patch.s) / patch.rs) ** 2 + ((vn - patch.v) / patch.rv) ** 2 < 1 + wobble;
}

/** Base skin colour at body point (s, v); v is the signed offset from the spine in pixels. */
export function skinAt(koi: Koi, palette: Palette, s: number, v: number, across: number): Rgb {
  // Belly edges and the tail stalk stay white on every variety, which frames the markings.
  if (across > 0.9 || s > 0.74) return palette.white;
  const vn = v / koi.length;
  const wobble = (valueNoise(s * 14 + koi.id, vn * 30, koi.id + 3) - 0.5) * 0.6;
  const { red, black } = markingsFor(koi);
  for (const patch of black) if (covers(patch, s, vn, wobble)) return palette.black;
  for (const patch of red) if (covers(patch, s, vn, wobble)) return palette.red;
  return palette.white;
}

import { smoothstep } from "./koi-math";

export const FLAG_BODY = 1;
export const FLAG_FIN = 2;
export const FLAG_EYE = 3;
export const FLAG_DORSAL = 4;
export const FLAG_BARBEL = 5;

/** Result of classifying a point against the koi outline. */
export interface ShapeHit {
  flag: number;
  /** 0 on the spine .. 1 on the body edge. */
  across: number;
}

/** Body half-width (fraction of length) at control stations along the spine; eased between them. */
const BODY_STATIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.03, 0.062],
  [0.12, 0.11],
  [0.3, 0.135],
  [0.52, 0.098],
  [0.74, 0.033],
];
const BODY_END = BODY_STATIONS[BODY_STATIONS.length - 1][0];
const TAIL_START = 0.68;

export function bodyHalfWidth(s: number): number {
  if (s <= 0) return 0;
  for (let i = 1; i < BODY_STATIONS.length; i++) {
    const [s1, w1] = BODY_STATIONS[i];
    if (s <= s1) {
      const [s0, w0] = BODY_STATIONS[i - 1];
      return w0 + (w1 - w0) * smoothstep(s0, s1, s);
    }
  }
  return BODY_STATIONS[BODY_STATIONS.length - 1][1];
}

function tailHalfWidth(s: number): number {
  const u = smoothstep(0.7, 1, s);
  return 0.03 + 0.15 * u ** 0.8;
}

function isBarbel(ahead: number, lateral: number): boolean {
  return ahead < 0.05 && Math.abs(lateral - (0.045 + ahead * 0.7)) < 0.016;
}

function inTail(s: number, a: number, past: number, flare: number): boolean {
  if (s <= TAIL_START || past > 0) return false;
  const half = tailHalfWidth(s) * flare;
  // The trailing edge is notched: it sits further back the further it is from the spine.
  return a <= half && s <= 0.86 + 0.14 * (a / half);
}

/** Pectoral and pelvic fins: ellipses leaning back from a root just inside the body edge. */
function inFin(s: number, a: number, rootS: number, lean: number, reach: number, thickness: number): boolean {
  const ds = s - rootS;
  const da = a - bodyHalfWidth(rootS) * 0.85;
  const along = ds * Math.cos(lean) + da * Math.sin(lean) - reach;
  const across = -ds * Math.sin(lean) + da * Math.cos(lean);
  return (along / reach) ** 2 + (across / thickness) ** 2 <= 1;
}

/**
 * Classifies a point in body coordinates, all as fractions of length: `s` along the spine (0 snout,
 * 1 tail tip), `a` distance from the spine, `past` how far beyond the tail tip, `ahead` how far in
 * front of the snout and `lateral` the sideways offset used by the barbels. `flare` spreads the fins.
 */
export function classify(
  s: number,
  a: number,
  past: number,
  flare: number,
  out: ShapeHit,
  ahead: number,
  lateral: number,
): boolean {
  out.flag = 0;
  out.across = 1;

  if (ahead > 0) {
    if (!isBarbel(ahead, lateral)) return false;
    out.flag = FLAG_BARBEL;
    return true;
  }

  const half = bodyHalfWidth(s);
  if (s <= BODY_END && a <= half) {
    out.across = a / half;
    if (s > 0.055 && s < 0.1 && out.across > 0.5 && out.across < 0.85) out.flag = FLAG_EYE;
    else if (s > 0.28 && s < 0.6 && out.across < 0.14) out.flag = FLAG_DORSAL;
    else out.flag = FLAG_BODY;
    return true;
  }

  if (inTail(s, a, past, flare) || inFin(s, a, 0.19, 0.85 + 0.5 * (flare - 1), 0.066 * flare, 0.04)) {
    out.flag = FLAG_FIN;
    return true;
  }
  if (inFin(s, a, 0.47, 0.75, 0.036, 0.018)) {
    out.flag = FLAG_FIN;
    return true;
  }
  return false;
}

import { mix, type Palette, type Rgb } from "./koi-palette";

export type VarietyId =
  | "kohaku"
  | "sanke"
  | "tancho"
  | "benigoi"
  | "ogon"
  | "platinum"
  | "chagoi"
  | "asagi"
  | "kumonryu";

/** Varieties whose colours live in `Palette.varieties`; the others reuse white / red / black. */
export type ColorVarietyId = "ogon" | "platinum" | "chagoi" | "asagi" | "kumonryu";

export type Pattern = "kohaku" | "sanke" | "tancho" | "solid" | "inverse";

export interface VarietyColors {
  base: Rgb;
  belly: Rgb;
  patch: Rgb;
}

export interface VarietyDef {
  id: VarietyId;
  label: string;
  pattern: Pattern;
  weight: number;
}

export const VARIETIES: readonly VarietyDef[] = [
  { id: "kohaku", label: "kohaku", pattern: "kohaku", weight: 3 },
  { id: "sanke", label: "sanke", pattern: "sanke", weight: 2 },
  { id: "tancho", label: "tancho", pattern: "tancho", weight: 1 },
  { id: "benigoi", label: "benigoi", pattern: "solid", weight: 1 },
  { id: "ogon", label: "ogon", pattern: "solid", weight: 1 },
  { id: "platinum", label: "platinum", pattern: "solid", weight: 1 },
  { id: "chagoi", label: "chagoi", pattern: "solid", weight: 1 },
  { id: "asagi", label: "asagi", pattern: "solid", weight: 1 },
  { id: "kumonryu", label: "kumonryu", pattern: "inverse", weight: 1 },
];

export const DEFAULT_VARIETY: VarietyId = "kohaku";

const BY_ID = new Map<VarietyId, VarietyDef>(VARIETIES.map((v) => [v.id, v]));

export function varietyDef(id: VarietyId): VarietyDef {
  return BY_ID.get(id) ?? VARIETIES[0];
}

export function isVarietyId(value: unknown): value is VarietyId {
  return typeof value === "string" && BY_ID.has(value as VarietyId);
}

export function colorsOf(id: VarietyId, palette: Palette): VarietyColors {
  return palette.varieties[id as ColorVarietyId];
}

/** The colour that dominates a fish's body, which decides whether it can be seen against the page. */
export function baseSkin(def: VarietyDef, palette: Palette): Rgb {
  if (def.id === "benigoi") return palette.red;
  if (def.pattern === "solid" || def.pattern === "inverse") return colorsOf(def.id, palette).base;
  return palette.white;
}

/** Minimum WCAG contrast between the page and a variety's drawn colour for it to be allowed to spawn. */
export const VISIBILITY_THRESHOLD = 2;

const luminance = (c: Rgb): number => {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
};

/** Depth of a typical fish when judging visibility: between the dimmest and the brightest. */
const REFERENCE_DEPTH = 0.75;

/** WCAG contrast between the page and the colour actually drawn for a variety (tile weight, then opacity). */
export function contrastOf(def: VarietyDef, palette: Palette): number {
  const tileWeight = (palette.tile[0] + palette.tile[1]) / 2;
  const opacity = palette.alpha * (palette.depthFloor + (1 - palette.depthFloor) * REFERENCE_DEPTH);
  const drawn = mix(palette.bg, mix(palette.bg, baseSkin(def, palette), tileWeight), opacity);
  const a = luminance(palette.bg) + 0.05;
  const b = luminance(drawn) + 0.05;
  return Math.max(a, b) / Math.min(a, b);
}

export function allowedVarieties(palette: Palette, threshold: number): VarietyId[] {
  return VARIETIES.filter((v) => contrastOf(v, palette) >= threshold).map((v) => v.id);
}

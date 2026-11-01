# Phase 04 — Koi varieties and contrast lock

## Steps
- [x] `koi-varieties.ts`: `VARIETIES` defs `{ id, pattern, weight }` where `pattern` is `kohaku | sanke | tancho | solid | inverse`. Groups: kohaku, sanke (showa look), tancho, benigoi (solid red), ogon (gold), platinum (white), chagoi (tan), asagi (blue), kumonryu (black with white patches via `inverse`).
- [x] `Palette` gains per-variety colours (`varieties: Record<id, { base, belly, patch?, spot? }>`) in both DARK and LIGHT, so they crossfade. Existing kohaku, sanke and tancho keep `white/red/black`.
- [x] `skinAt()` dispatches on pattern; `solid` uses base with a lighter belly; `inverse` swaps the roles of base and patches.
- [x] `contrastOf(variety, palette)`: WCAG ratio between `bg` and the drawn colour (`mix(bg, skin, tile)` with `alpha * depthFloor`), not the raw skin colour. `allowedVarieties(palette, threshold)`. Kohaku and sanke must be allowed in both themes (unit test).
- [x] `World.setVarieties(allowed ∩ enabled)`: weighted `pickVariety` over that set, falling back to kohaku if empty; reassign existing koi and set their `markings` to `null`. The engine recomputes on theme change and on settings change.
- [x] Menu chips: swatch in the current theme colour; locked chips are `disabled` with `aria-disabled` and a title naming which background hides them; the last enabled chip cannot be switched off.

## Verify
- Tests: allowed set per theme, weights, empty-set fallback, reassign rebuilds markings.
- Real browser: in dark, kumonryu is locked and no black koi spawn; in light, platinum is locked. Tune the threshold by eye on both backgrounds and record the final value in `docs/code-standards.md` if it is not 2.5.
- Decide by eye whether the colour pop when a theme change reassigns koi is acceptable; if not, reassign at the crossfade midpoint.

# Phase 05 — Sakura branch and floating petals

## Steps
- [x] `koi-sakura.ts`: branch geometry built once per resize from `world.rand`: a main limb entering a top corner, 2-3 twigs, blossom anchor points. Wind angle `sin(time * 0.5) * k` grows along the limb (sway). Desktop corner is chosen clear of the koi stats overlay (or the overlay moves); compact gets a smaller, top-only branch.
- [x] `koi-sakura-layer.ts`: paints into the existing `grid.pad` layer after the lotus. Wood segments use `lineGlyph` and a brown ramp; blossoms are 5 notched petals with a `*` centre and a pink ramp. `palette.branch` and `palette.blossom` ramps have the same stop counts in DARK and LIGHT. Fade factor for the toggle.
- [x] `World.petals: Petal[]` with `{ x, y, z, vx, vy, born, state: falling | floating, onPad }`. Spawn from blossom anchors every 1-2.5 s using a **separate seeded RNG** (`petalRandom`) so existing seeded tests do not shift. Cap 18 (10 compact). Falling: `z` goes 1 -> 0 over ~2 s with wind drift and flutter. Landing: tiny ripple (`strength ~0.08`), no `koi.rush`.
- [x] Floating motion in `stepPetals(world, dt)` (in `koi-sakura.ts`), from world data only:
  - Ripple fronts: for each ripple, if `|dist - radius| < band`, add a radial impulse proportional to `ripple.strength` and its fade. Use `RIPPLE_SPEED` and `rippleLife` exactly as `WaterLayer.drawRipples` does, so petals ride the visible rings.
  - Koi near the surface (`depth > 0.6`): spine nodes within a small radius push the petal away.
  - On a lily pad (`padAt(activePads)`): ride `pad.vx/vy` like pellets.
  - Otherwise damped drift. After ~25 s fade out and remove.
- [x] Rendering: falling petals as small glyphs offset upward by `z`; floating petals as `*` / `,` in `palette.blossom`, drawn in `WaterLayer` next to pellets, above pads when `onPad`.
- [x] Sakura off: spawning stops, petals are cleared, the branch fades. Reduced motion: static branch, no petals. Compact: the 30 fps path already caps frame rate.

## Verify
- Tests (fixed `dt`, injected RNG): petal count respects the cap; a ripple passing a floating petal changes its velocity; a petal on a pad moves with the pad; sakura off spawns none and leaves seeded koi positions unchanged.
- Real browser: branch sways, petals fall and land, a pellet splash or koi wake visibly nudges nearby petals, readable in light and dark, at mobile width, with page text still legible beneath the branch.

# Phase 02 — Koi pond engine

Files (each < 200 lines): `components/koi-pond/koi-pond.tsx` (client canvas mount), `koi-simulation.ts` (step logic), `koi-fish.ts` (body chain + steering), `koi-renderer.ts` (draw), `koi-config.ts` (counts, colors, speeds), `use-pond-pointer.ts`.

## Behaviour
- Fish: spine of ~12 chained segments following a head that steers toward wandering targets; body width profile + tail/fin sway; koi palettes (white / orange / red / black patches) via pre-baked per-fish pattern.
- Interaction: pointer near a fish → scatter; click/tap → fish gather and ripple; ripples fade over ~2 s.
- Water: dark gradient + subtle vignette (caustics and lily pads cut from v1).
- Perf: fish count `clamp(round(area / 90_000), 5, 14)`; fixed-timestep update, `requestAnimationFrame` paused on `visibilitychange`; DPR ≤ 2 desktop / ≤ 1.5 mobile; 30 fps cap on mobile; `prefers-reduced-motion` → slow, no scatter.
- No allocations in the frame loop (preallocated typed arrays).

## Tasks
- [ ] Simulation + renderer behind a pure interface so it can be unit-tested without a DOM.
- [ ] Mount as fixed, `pointer-events: none` canvas; pointer tracked at `window` so cards don't block it; click-to-gather fires only when the target is not a link/button/card, and never on scroll gestures.
- [ ] Unit tests for steering bounds (fish stay on screen) and fish-count function.

## Verify
`bun test`; open the real page in the preview browser, screenshot at desktop + 390 px width, check frame time in DevTools performance (target ≥ 55 fps desktop).

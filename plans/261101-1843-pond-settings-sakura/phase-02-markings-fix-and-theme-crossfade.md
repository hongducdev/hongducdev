# Phase 02 — Markings fix and theme crossfade

## Steps
- [ ] Move the markings cache from the module `Map` in `koi-markings.ts` onto the `Koi` object (`koi.markings`, `null` until built). Ids are reused `1..N` on reseed, so the module cache can already go stale. Add a unit test that a variety change rebuilds markings.
- [ ] `koi-palette.ts`: `lerpPalette(from, to, k, out)` writing into a preallocated `out`. Keep `out.white/red/black/...` and every ramp array as the same objects across calls and rewrite values in place. Interpolate the numeric fields too (`tile`, `alpha`, `depthFloor`, `ink`, `shadowAlpha`).
- [ ] `KoiRenderer`: hold `from`, `to`, `mix`; `setTheme(isLight, animate)`; `render(dt)` advances `mix` by `dt / 0.45` and uses `out` while `mix < 1`, otherwise `to` directly. Reduced motion or `animate = false` is instant.
- [ ] `WaterLayer.fillStyleFor`: clear the Map when it exceeds 4096 entries.
- [ ] `KoiPond`: do not call `engine.setTheme` until `resolvedTheme` is defined; the first call is not animated, later ones are.
- [ ] `ThemeToggle`: optional `startTransition` around `setTheme` (keeps the button responsive); no visual claim attached to it.

## Verify
- Tests: `lerpPalette` at k=0 and k=1 equals source and target; identity of `out.red` is preserved.
- Real browser: toggling theme blends koi and page background over ~0.45 s with no hard cut; loading directly in light theme shows no dark -> light crossfade; reduced motion swaps instantly.

# Pond settings, koi varieties, sakura branch, persistent pond

Work context: `D:\MyProjects\hongducdev-new` (git repo; commits only on user request).
Builds on `plans/261101-1549-koi-portfolio` (phase 02 engine already complete).

## Goal
1. One persistent koi pond across language switches (`/vi` <-> `/en`) and theme toggles, with smooth transitions.
2. Settings menu: pick koi varieties, toggle lotus, toggle a cherry-blossom (hoa anh dao) branch with falling petals that float on the water and react to disturbed water.
3. Varieties that would be invisible on the current background (white on light, black on dark) are locked and not spawned.

## Locked decisions (user-approved, advisor-reviewed)
| Topic | Decision |
| --- | --- |
| Persistent pond | Lift `<html>`, `ThemeProvider`, settings provider and `<KoiPond />` into a new `app/layout.tsx`. `<html lang>` defaults to `vi`; `HtmlLangSync` (blocking inline script + effect) corrects it per locale. Add `alternates.languages` (hreflang) and `app/not-found.tsx` |
| Language switch | `startTransition(() => router.push(href))` in `LanguageSwitcher`; `isPending` only dims the link and sets `aria-busy`. `<Link>` already navigates in a transition, so this adds pending state, not smoothness. The pond persisting is what makes the switch smooth |
| Theme switch | Engine-side palette crossfade (~450 ms), not React. Skip the first apply until `resolvedTheme` is defined, so a light-theme load does not animate dark -> light |
| Flower | Cherry blossom (sakura, 5 notched petals, pink), not Tet peach blossom |
| Variety lock | Contrast of the colour actually drawn (tile mix x alpha x depthFloor) vs `palette.bg` must reach a tunable threshold (start 2.5). Variety colours live inside `Palette` so they crossfade |
| Persistence | `localStorage` key `pond-settings`, defaults all on. Read synchronously in the engine mount effect before first seed |
| Out of scope (YAGNI) | Petal shadow while falling, pointer pushing petals, koi spinning petals, per-koi colour crossfade on variety change |

## Phases
- [x] [Phase 01 — Root layout lift and locale switch](phase-01-root-layout-and-locale-switch.md)
- [x] [Phase 02 — Markings fix and theme crossfade](phase-02-markings-fix-and-theme-crossfade.md)
- [x] [Phase 03 — Settings store, menu, lotus toggle](phase-03-settings-menu-and-lotus-toggle.md)
- [x] [Phase 04 — Koi varieties and contrast lock](phase-04-koi-varieties-and-contrast-lock.md)
- [x] [Phase 05 — Sakura branch and floating petals](phase-05-sakura-branch-and-petals.md)
- [x] [Phase 06 — Docs, full verification](phase-06-docs-and-verification.md)

Run `bun test` and `bun run typecheck` after every phase.

## Key risks
1. **Unconfirmed premise**: that a locale switch remounts the pond. Phase 01 starts by observing it (DevTools Network, Doc filter) before changing anything.
2. **Palette identity**: `styleCell` compares `skin === p.red/white` by identity (`koi-cell-style.ts`). The crossfade scratch palette must keep its array objects and only rewrite values. New ramps need equal stop counts in both themes.
3. **Style cache growth**: the `WaterLayer.fillStyleFor` Map is already unbounded; crossfade makes it worse. Clear it when over 4096 entries.
4. **Seeded tests**: petal spawning must use its own RNG, or it shifts every seeded test in `koi-world.test.ts`.
5. **Layout clash**: a top-right branch overlaps the koi stats overlay in `koi-pond.tsx`. Move the stats or place the branch elsewhere on `lg`.
6. **Popover light-dismiss**: the dismissing click lands on the pond and drops food. Accepted unless it feels wrong in the real window.
7. **Static `lang`**: `/en` HTML ships `lang="vi"` until the inline script runs. Accepted, offset by hreflang.

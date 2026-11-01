# Phase 03 — Settings store, menu, lotus toggle

## Steps
- [ ] `components/koi-pond/pond-settings.ts`: type `PondSettings { varieties: string[]; lotus: boolean; sakura: boolean }`, `DEFAULTS`, `readSettings()` / `writeSettings()`. A JSON parse failure logs with context and falls back to defaults; never silent.
- [ ] `components/koi-pond/pond-settings-context.tsx`: provider and `usePondSettings()`; state starts at defaults and hydrates from storage in an effect. Provider is mounted in `app/layout.tsx`.
- [ ] `PondEngine`: accept initial settings in the constructor, read them synchronously in `KoiPond`'s mount effect before the first `resize()` seed, so pads and varieties are right on the first frame. `engine.setSettings(next)` handles later changes.
- [ ] `World`: add `lotusOn` and `get activePads()` (empty when off); keep `pads` so toggling back restores the same pads. Replace uses in `koi-world.ts` (pellet landing, `driftPellet`), `koi-lotus.ts` (`stepPads`, bump) and `koi-lotus-layer.ts`. Existing tests read `world.pads` and stay valid.
- [ ] `LotusRasterizer`: fade factor (0..1, ~400 ms ease) multiplied into tile and glyph alpha in `put()`.
- [ ] `components/settings-menu.tsx`: text button `settings` using the native Popover API (`popover`, `popoverTarget`), `data-pond-ignore` on the panel. Content: variety chips (placeholder list until phase 04), lotus toggle, sakura toggle (wired in phase 05). Place next to `ThemeToggle` in `app/[locale]/page.tsx`.
- [ ] Dictionaries: `settings` keys in `lib/i18n/dictionaries/vi.ts` (source of the `Dictionary` type) and `en.ts`.

## Verify
- Tests: lotus off -> `activePads` empty, a pellet landing on a former pad behaves as on open water, toggling back restores identical pads.
- Real browser: the toggle persists across reload; pads fade out and in; first paint with lotus off shows no pad flash; the button is focusable, Escape closes, chips and toggles are keyboard-operable; Vietnamese strings render with diacritics.

# Codebase Summary

| Path | Purpose |
| --- | --- |
| `app/[locale]/layout.tsx` | Root layout (`<html lang>`), locale validation, `generateStaticParams` for `vi`/`en`, `dynamicParams = false` |
| `app/[locale]/page.tsx` | Home page |
| `lib/i18n/config.ts` | `locales`, `defaultLocale`, `isLocale` guard |
| `lib/i18n/dictionaries/{vi,en}.ts` | Typed dictionaries; `vi.ts` defines the `Dictionary` type, `en.ts` must satisfy it |
| `lib/i18n/get-dictionary.ts` | `getDictionary(locale)` |
| `components/language-switcher.tsx` | Switches locale while keeping the current sub-path |
| `components/koi-pond/` | Full-screen glyph koi pond. `koi-world.ts` + `koi-behavior.ts` (DOM-free simulation: koi, pellets, ripples), `koi-shape.ts`/`koi-markings.ts`/`koi-cell-style.ts`/`koi-rasterizer.ts` (koi → tiles + etched glyphs), `koi-water-layer.ts` (wake, ripples, pellets, bites, shadows), `koi-lotus.ts` (lily pads + lotus flowers: drift, koi bumps, pellets roll off leaves) and `koi-lotus-layer.ts` (pad/flower tiles drawn over the koi), `koi-grid.ts`, `koi-palette.ts`, `koi-renderer.ts`, `koi-engine.ts` (loop, pointer, click-to-feed), `koi-pond.tsx` (mount + stats). Content to steer around carries `data-pond-avoid`; elements that must not drop food carry `data-pond-ignore` |
| `components/theme-toggle.tsx` | light/dark switch via `next-themes` (class on `<html>`; pond observes it) |
| `config/site.ts` | Site name, URL, social links |
| `next.config.ts` | `/` → `/vi` redirect and 301s from legacy `/blogs`, `/projects` paths |
| `open-next.config.ts`, `wrangler.jsonc` | Cloudflare Worker build (see `deployment-guide.md`) |

No middleware: routing is fully static (both locales pre-rendered).

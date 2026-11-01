# Codebase Summary

| Path | Purpose |
| --- | --- |
| `app/layout.tsx` | Root layout: `<html lang="vi">`, theme and pond-settings providers, and the persistent `<KoiPond />` so the pond survives locale and theme switches. `app/not-found.tsx` is the language-neutral 404 |
| `app/[locale]/layout.tsx` | Locale validation, `generateStaticParams` for `vi`/`en`, `dynamicParams = false`, header, `HtmlLangSync` (sets `<html lang>` per locale) |
| `app/[locale]/page.tsx` | Home page |
| `app/[locale]/{projects,books,contact,blogs}/`, `app/[locale]/blogs/[slug]/` | Content pages; the post page pre-renders every `locale × slug` and sets its canonical to the Vietnamese post when the English one is missing |
| `app/sitemap.ts`, `app/robots.ts` | Sitemap with per-locale alternates; robots pointing at it |
| `components/site-header.tsx`, `components/page-shell.tsx` | Fixed top nav (links, language, theme) and the shared column for sub-pages |
| `content/projects.ts` | Typed project list with per-locale descriptions |
| `scripts/sync-goodreads.ts`, `lib/goodreads/` | Build-time sync of Goodreads widget endpoints (currently-reading shelf + reading challenge) into `lib/generated/goodreads.json` (gitignored); a failed fetch keeps the previous value. Parsers read the widget JS as text, never execute it. The challenge id in `config/site.ts` is per year and must be updated each January |
| `content/blogs/<slug>.<vi\|en>.mdx` | Blog posts; images live in `public/blogs/` |
| `scripts/compile-mdx.mjs`, `scripts/rehype-fix-image-paths.mjs` | Build-time MDX → HTML into `lib/generated/blog-posts.json` (gitignored; Workers has no runtime `fs`) |
| `lib/blog/posts.ts` | Reads the generated JSON; `getPosts`/`getPost` fall back to the `vi` post and flag `translated: false` |
| `lib/i18n/config.ts` | `locales`, `defaultLocale`, `isLocale` guard |
| `lib/i18n/dictionaries/{vi,en}.ts` | Typed dictionaries; `vi.ts` defines the `Dictionary` type, `en.ts` must satisfy it |
| `lib/i18n/get-dictionary.ts` | `getDictionary(locale)` |
| `components/language-switcher.tsx` | Switches locale while keeping the current sub-path |
| `components/koi-pond/` | Full-screen glyph koi pond. `koi-world.ts` + `koi-behavior.ts` (DOM-free simulation: koi, pellets, ripples), `koi-shape.ts`/`koi-markings.ts`/`koi-cell-style.ts`/`koi-rasterizer.ts` (koi → tiles + etched glyphs), `koi-water-layer.ts` (wake, ripples, pellets, bites, shadows), `koi-lotus.ts` (lily pads + lotus flowers: drift, koi bumps, pellets roll off leaves) and `koi-lotus-layer.ts` (pad/flower tiles drawn over the koi), `koi-grid.ts`, `koi-palette.ts`, `koi-renderer.ts`, `koi-engine.ts` (loop, pointer, click-to-feed), `koi-pond.tsx` (mount + stats), `pond-settings.ts` + `pond-settings-context.tsx` (varieties / lotus / sakura toggles persisted in `localStorage` key `pond-settings`), `koi-varieties.ts` (variety defs, contrast lock via `VISIBILITY_THRESHOLD`), `koi-sakura.ts` + `koi-sakura-layer.ts` (swaying cherry-blossom branch), `koi-fader.ts` (toggle fades). `koi-palette.ts` also holds `lerpPalette` for the ~0.45 s theme crossfade. The settings popover is `components/settings-menu.tsx`. Content to steer around carries `data-pond-avoid`; elements that must not drop food carry `data-pond-ignore` |
| `components/theme-toggle.tsx` | light/dark switch via `next-themes` (class on `<html>`; pond observes it) |
| `config/site.ts` | Site name, URL, social links |
| `next.config.ts` | `/` → `/vi` redirect and 301s from legacy `/blogs`, `/projects` paths |
| `open-next.config.ts`, `wrangler.jsonc` | Cloudflare Worker build (see `deployment-guide.md`) |

No middleware: routing is fully static (both locales pre-rendered).

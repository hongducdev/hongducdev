# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Bilingual (vi/en) personal portfolio for hongduc.dev: Next.js 15 (App Router) + React 19 + Tailwind v4, deployed as a Cloudflare Worker via `@opennextjs/cloudflare`. Centerpiece is a full-screen interactive glyph koi pond. Package manager is `bun`.

## Commands

- `bun run dev` — `bun run prep` (compiles blog MDX, syncs Goodreads), then `next dev`
- `bun run build` / `bun run build:cf` — Next build / Cloudflare (OpenNext) build into `.open-next/`
- `bun run preview` — serve the Worker locally (plain `wrangler dev` 404s on pre-rendered pages)
- `bun run typecheck`, `bun run lint`, `bun test`
- Single test: `bun run blog && bun test path/to/file.test.ts` (tests are `*.test.ts` beside the code)

Run `next build` and `next dev` one at a time — both write `.next`, and a concurrent dev server makes pre-rendered pages return 500.

## Architecture

- **Routing is fully static, no middleware.** `app/[locale]/` pre-renders `vi` and `en` (`dynamicParams = false`); `/` redirects to `/vi` in `next.config.ts`, which also holds 301s from legacy paths. New locale-aware pages must validate `params.locale` with `isLocale` and `notFound()` otherwise.
- **i18n:** all user-facing strings live in `lib/i18n/dictionaries/{vi,en}.ts`; `vi.ts` defines the `Dictionary` type and `en.ts` must satisfy it, so a missing key fails typecheck.
- **Blog:** posts are `content/blogs/<slug>.<vi|en>.mdx`. `scripts/compile-mdx.mjs` compiles them at build time into `lib/generated/blog-posts.json` (gitignored) because Workers has no runtime `fs`. Every script needing posts runs `bun run blog` first. `lib/blog/posts.ts` falls back to the `vi` post when an English one is missing (`translated: false`).
- **Goodreads:** `/books` shows the currently-reading shelf and the yearly reading challenge. `scripts/sync-goodreads.ts` (part of `bun run prep`) fetches Goodreads' public widget endpoints into `lib/generated/goodreads.json` (gitignored; RSS and the API are gone). The challenge id in `config/site.ts` changes every year.
- **Koi pond** (`components/koi-pond/`): mounted once in the root `app/layout.tsx` so it persists across locale/theme switches. Simulation (`koi-world`, `koi-behavior`, lotus/sakura) is DOM-free; rasterizer/renderer/layers turn it into glyph tiles; `koi-engine` owns the loop and pointer input. Settings persist in `localStorage` key `pond-settings`. Mark content to steer fish around with `data-pond-avoid`, and elements that must not receive dropped food with `data-pond-ignore`. A koi variety only spawns if its colour reaches contrast 2.0 against the page (`VISIBILITY_THRESHOLD` in `koi-varieties.ts`).

See `docs/codebase-summary.md` for the full module index, `docs/code-standards.md` for conventions, and `docs/deployment-guide.md` for Cloudflare release steps. Plans live in `plans/`.

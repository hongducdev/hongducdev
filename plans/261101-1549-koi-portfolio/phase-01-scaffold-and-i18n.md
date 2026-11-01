# Phase 01 — Scaffold & i18n routing

## Tasks
- [x] `create-next-app` in the project root (TS, Tailwind v4, App Router, no src dir), pin Next 15.
- [x] Add deps: `next-mdx-remote`, `gray-matter`, `rehype-highlight`, `@opennextjs/cloudflare`, `wrangler`.
- [x] Routes under `app/[locale]/` with locales `vi` (default) and `en`, `dynamicParams = false`; `/` → `/vi` via `redirects()` in `next.config.ts` (no middleware).
- [x] Typed dictionaries `lib/i18n/dictionaries/{vi,en}.ts` + `getDictionary(locale)`; `generateStaticParams` for both locales.
- [x] Language switcher component (keeps current path).
- [x] `config/site.ts` with name, url, social links (values supplied by user).
- [x] `docs/` seed: `codebase-summary.md`, `code-standards.md`.

- [x] Use bun; confirm the `@opennextjs/cloudflare` version supporting the pinned Next 15.x; build Worker in WSL Ubuntu.
- [x] Read old `wrangler.jsonc` and `app/` tree via `gh` (record routes/bindings in `docs/deployment-guide.md`).
- [x] Ask the user before `git init` (needed to review diffs from phase 2 on).

## Verify
`bun run build` passes; `/vi` and `/en` render; `/` redirects; a minimal OpenNext `preview` of the scaffold runs in WSL so adapter problems show up now, not in phase 5.

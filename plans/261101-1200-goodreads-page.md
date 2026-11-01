# Goodreads page

Status: Completed

Scope (revised): currently-reading shelf + yearly reading challenge only. Goodreads RSS/API return 404, so data comes from the public widget endpoints at build time.

- [x] `lib/goodreads/parse-widgets.ts` (+ test): read widget JS as text, parse shelf and challenge
- [x] `scripts/sync-goodreads.ts`: fetch to `lib/generated/goodreads.json`, keep previous data on failure
- [x] `package.json`: `goodreads` and `prep` scripts chained into dev/build/build:cf/typecheck/test
- [x] `/[locale]/books` page, vi/en dictionary, nav item, sitemap entry
- [x] typecheck, lint, bun test (35 pass), build, rendered HTML checked for vi and en
- [x] Docs: `docs/codebase-summary.md`, `CLAUDE.md`

Open: scheduled redeploy (cron) so the page refreshes without a manual deploy.

# Deployment Guide

Target: Cloudflare Worker `hongduc-portfolio` (domain `hongduc.dev`), built with `@opennextjs/cloudflare`.

## Legacy site (`hongducdev/hongducdev-site`)
- `wrangler.jsonc`: name `hongduc-portfolio`, `main` `.open-next/worker.js`, flags `nodejs_compat` + `global_fetch_strictly_public`, `ASSETS` binding on `.open-next/assets`, self-service binding `WORKER_SELF_REFERENCE`. No routes, KV, or R2 declared. This repo's `wrangler.jsonc` keeps the same shape.
- Routes: `/`, `/blogs`, `/blogs/[slug]`, `/projects`, `/api/goodreads`, `/api/now-playing`, `/api/og`, `/llms.txt`, `robots`, `sitemap`, `manifest`. The new site drops the API routes, `llms.txt`, and dynamic OG (scope cuts); old page paths are redirected in `next.config.ts`.

## Build and preview
- `bun run build:cf` produces `.open-next/`.
- `bun run preview` fills the static-assets cache (`populateCache`) and serves the Worker locally. `wrangler dev` alone returns 404 for pre-rendered pages because that cache step is skipped.
- Incremental cache is `static-assets` (`open-next.config.ts`): fully static site, no R2/KV needed.
- The build ran fine on native Windows with Node 24 and OpenNext 1.20.15 against Next 15.5.25. Run the final deploy build in WSL only if Windows fails.

## Release
Use `wrangler versions upload` then `wrangler versions deploy` for staged rollout; `wrangler rollback` reverts.

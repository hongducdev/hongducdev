# Phase 05 — Polish, a11y, deploy

## Tasks
- [ ] A11y: skip link, visible focus rings, `aria-hidden` canvas, reduced-motion path, keyboard nav.
- [ ] Lighthouse: Performance ≥ 90 mobile, A11y ≥ 95; lazy-start pond after first paint.
- [ ] Fallback: if canvas unsupported → static dark gradient.
- [ ] `wrangler.jsonc` + `open-next.config.ts` (based on the old repo), `bun run deploy` script; `bun run preview` locally.
- [ ] Production redeploy over the existing site: diff against old `wrangler.jsonc` (routes, custom domain, bindings, flags); `wrangler versions upload` → smoke test → `versions deploy`; document `wrangler rollback` in `docs/deployment-guide.md`.
- [ ] `docs/system-architecture.md`, `docs/deployment-guide.md`, `docs/development-roadmap.md`.
- [ ] Final diff review, remove temp/debug code, report bundle size.

## Verify
`bun run build`, `bun run lint`, `bun test`, Workers `preview` smoke test of every route in both locales. Deploy only on user instruction.

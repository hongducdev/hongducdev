# Phase 06 — Docs and full verification

## Steps
- [ ] Update `docs/codebase-summary.md` (new modules: settings, varieties, sakura, root layout) and `docs/code-standards.md` if the contrast threshold or test commands changed. Read each file first and verify every referenced path exists.
- [ ] Update `plans/261101-1549-koi-portfolio/phase-03-layout-and-pages.md` only if it describes the old locale layout.
- [ ] Re-read the full diff; remove temporary and change-narrating comments.

## Verify (real output only)
- `bun test`, `bun run typecheck`, `bun run lint`, `bun run build`.
- Real browser matrix via `hd-computer-use` or preview: {vi, en} x {dark, light} x {desktop, mobile width}; every toggle on and off; reload persistence; screenshot evidence.
- Do not commit; ask the user afterwards.

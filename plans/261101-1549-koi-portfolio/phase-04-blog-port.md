# Phase 04 — Blog port

Source (private, read via `gh`): `hongducdev/hongducdev-site` — `content/blogs/*.mdx` (6 posts: 2025-dev-setup, cai-dat-oh-my-posh-tren-windows, custom-terminal-linux-cua-ban-sao-cho-ngau, hello-world, react-tips, setup-windows-than-toc-de-code-voi-powershell), `lib/blog/{index,mdx}.ts`, `components/blog/*`, `components/mdx/*`, `scripts/rehype-*.mjs`.

## Tasks
- [ ] Copy posts to `content/blogs/<slug>.vi.mdx`; keep frontmatter schema; copy `public/blogs/` images (check `rehype-fix-image-paths`).
- [ ] Routes `/[locale]/blogs` and `/[locale]/blogs/[slug]`; 301 redirects `/blogs`, `/blogs/:slug`, `/projects` → `/vi/...` in `next.config.ts`.
- [ ] `/en/blogs/<slug>` for untranslated posts: canonical → `/vi` version.
- [ ] Port `lib/blog` (list, get by slug, reading time, headings) with locale-aware lookup + vi fallback.
- [ ] Port blog list, post layout, table of contents, code block (no image modal); restyle with glass cards over the pond.
- [ ] Keep the old build-time `prebuild` MDX compile step (Workers has no runtime `fs`); highlighting and MDX are not bundled into the Worker.
- [ ] RSS/`llms.txt`: skipped.

## Verify
All 6 posts render in `/vi/blog/<slug>`, code blocks highlighted, images load, TOC works; `/en/blog` lists them with the "Vietnamese only" badge; verified on the Workers preview build, not only `next dev`.

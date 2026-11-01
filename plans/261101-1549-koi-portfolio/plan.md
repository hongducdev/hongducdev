# Koi Pond Portfolio (hongducdev)

Work context: `D:\MyProjects\hongducdev-new` (not a git repo yet — `git init` only on user request).

## Goal
Personal portfolio with a full-screen interactive koi pond as the background, glass content cards on top, bilingual (vi/en), and the blog ported from the private repo `hongducdev/hongducdev-site`.

## Locked decisions (user-approved)
| Topic | Decision |
| --- | --- |
| Approach | Next.js App Router + hand-written Canvas 2D koi pond (no Three.js) |
| Style | Minimal, frosted-glass cards, clean font |
| Pond theme | Night: deep blue-black water |
| Pages | Home/About, Projects, Blog, Contact |
| Languages | Vietnamese + English (UI bilingual) |
| Blog | Port the 6 MDX posts from `hongducdev-site/content/blogs` |
| Package manager | bun |
| Domain / Worker | Keep `hongduc.dev` and `hongduc-portfolio`; will redeploy over the existing site later |
| Locale routing | No middleware: `/` → `/vi` static redirect, both locales pre-rendered, `dynamicParams = false` (advisor review) |
| Old URLs | Old routes are `/blogs`, `/blogs/[slug]`, `/projects`; new site keeps `blogs` (plural) under `/vi` and 301-redirects the old paths via `next.config` `redirects()` |

## Stack (mirrors hongducdev-site so the blog ports cleanly)
Next 15 + React 19 + TypeScript, Tailwind v4, MDX (`next-mdx-remote`, `gray-matter`, `rehype-highlight`), `next-themes` not needed (night only), deploy to Cloudflare Workers via `@opennextjs/cloudflare`, package manager `bun` (install + `bun test`); run OpenNext/wrangler under node, not `bun --bun`, and build the Worker in WSL Ubuntu (OpenNext on native Windows is unreliable — verify against current docs in phase 1).

## Phases
- [ ] [Phase 01 — Scaffold & i18n routing](phase-01-scaffold-and-i18n.md)
- [ ] [Phase 02 — Koi pond engine](phase-02-koi-pond-engine.md)
- [ ] [Phase 03 — Layout, glass UI, pages](phase-03-layout-and-pages.md)
- [ ] [Phase 04 — Blog port](phase-04-blog-port.md)
- [ ] [Phase 05 — Polish, a11y, deploy](phase-05-polish-and-deploy.md)

## Key risks
1. **Canvas perf on mobile / low-end** — cap fish count by viewport, DPR clamp to 2, pause when tab hidden, honor `prefers-reduced-motion`.
2. **Text legibility + blur cost** — `backdrop-blur` over an animating canvas is re-computed every frame. Desktop: light blur; mobile: near-opaque card, no blur, 30 fps cap, DPR ≤ 1.5.
3. **Production redeploy** — overwriting the live site: read the old `wrangler.jsonc` (routes, bindings) first, use `wrangler versions upload` → `versions deploy` for staged rollout, note `wrangler rollback`.
4. **Blog content is Vietnamese only** — English UI shows vi posts with a "Vietnamese only" badge until translated (`slug.en.mdx` optional per post).
5. **Reference license** — nagomi/others are inspiration only; algorithm re-implemented, no code copied.
6. **Duplicate content** — `/en/blogs/<slug>` for untranslated posts gets canonical → `/vi` version (or noindex).
7. **Worker bundle size** — MDX compiled at build time into generated data; `rehype-highlight`/`next-mdx-remote` not bundled into the Worker.

## Scope cuts (YAGNI, per advisor)
Lily pads, caustics layer (add only if fps allows), image modal, dynamic OG image (one static image), RSS/`llms.txt`.

## Open items
- Project list content and real bio/contact links — placeholders must be replaced by user-provided text; none will be invented.

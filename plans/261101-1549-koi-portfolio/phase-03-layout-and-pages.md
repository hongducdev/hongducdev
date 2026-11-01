# Phase 03 — Layout, glass UI, pages

## Tasks
- [ ] Root layout: night palette tokens in `globals.css` (Tailwind v4 `@theme`), font via `next/font` with Vietnamese subset (Be Vietnam Pro or similar) — confirm diacritics render.
- [ ] `components/layout/`: top nav (Home, Projects, Blog, Contact + language switcher), footer.
- [ ] `components/ui/glass-card.tsx`: light `backdrop-blur` on desktop only, near-opaque bg on mobile, 1px border `white/10`; contrast ≥ 4.5:1 for body text.
- [ ] Home/About: hero (name, role, one-liner), short bio, currently-working-on, latest 3 posts.
- [ ] Projects: card grid from `content/projects.ts` (typed; entries supplied by user).
- [ ] Contact: links (email, GitHub, etc.) — no backend form (YAGNI).
- [ ] Page-level metadata, per-locale `alternates`, one static OG image, `sitemap.ts`, `robots.ts`.

## Verify
`bun run build && bun run lint`; screenshots of each page in vi and en at desktop + mobile; Vietnamese diacritics visibly correct.

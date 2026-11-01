# Phase 03 — Layout, pages

## Tasks
- [x] Root layout: warm light/dark tokens in `globals.css`, `next-themes`, JetBrains Mono with Vietnamese subset (done with the restyle).
- [ ] Top nav as small lowercase centered links (home, projects, blog, contact) next to the existing language + theme toggles; no footer.
- [ ] Content blocks are plain text + `.ink-link`, no cards; contrast ≥ 4.5:1 against both themes.
- [ ] Home/About: hero (name, role, one-liner), short bio, currently-working-on, latest 3 posts.
- [ ] Projects: list from `content/projects.ts` (typed; entries supplied by user).
- [ ] Contact: links (email, GitHub, etc.) — no backend form (YAGNI).
- [ ] Page-level metadata, per-locale `alternates`, one static OG image, `sitemap.ts`, `robots.ts`.

## Verify
`bun run build && bun run lint`; screenshots of each page in vi and en at desktop + mobile; Vietnamese diacritics visibly correct.

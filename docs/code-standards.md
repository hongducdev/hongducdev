# Code Standards

- Package manager: `bun`. TypeScript strict, no `any`.
- Files: kebab-case, under ~200 lines.
- Checks: `bun run typecheck`, `bun run lint`, `bun run build`, `bun test` (bun's runner, `*.test.ts` beside the code).
- Every user-facing string lives in `lib/i18n/dictionaries/*`; `en.ts` is typed against `vi.ts`, so a missing key fails typecheck.
- Blog posts: `content/blogs/<slug>.<vi|en>.mdx` with frontmatter `title`, `description`, `date` (ISO) and optional `tags`. Every script that needs the posts (`dev`, `build`, `build:cf`, `typecheck`, `test`) runs `bun run blog` first. Post HTML is compiled from files in this repo at build time, so it is trusted; never feed user input into it.
- New locale-aware pages must validate `params.locale` with `isLocale` and call `notFound()` otherwise.

- Koi variety visibility: a variety spawns only when its drawn colour reaches WCAG contrast 2.0 against the page (`VISIBILITY_THRESHOLD` in `components/koi-pond/koi-varieties.ts`); this locks kumonryu on dark and platinum on light.

# Code Standards

- Package manager: `bun`. TypeScript strict, no `any`.
- Files: kebab-case, under ~200 lines.
- Checks: `bun run typecheck`, `bun run lint`, `bun run build`, `bun test` (bun's runner, `*.test.ts` beside the code).
- Every user-facing string lives in `lib/i18n/dictionaries/*`; `en.ts` is typed against `vi.ts`, so a missing key fails typecheck.
- New locale-aware pages must validate `params.locale` with `isLocale` and call `notFound()` otherwise.

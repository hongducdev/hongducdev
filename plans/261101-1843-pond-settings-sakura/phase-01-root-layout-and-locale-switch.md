# Phase 01 — Root layout lift and locale switch

## Steps
- [x] Observe first: run the app, DevTools Network (Doc filter), click `en`; record whether a document request happens and whether the koi jump.
- [x] Create `app/layout.tsx`: `<html lang="vi" suppressHydrationWarning>`, font variable, `<body>`, `ThemeProvider` (same props as today), `<KoiPond />`.
- [x] Reduce `app/[locale]/layout.tsx` to `generateStaticParams`, `dynamicParams = false`, `generateMetadata` (+ `alternates.languages` for vi/en), the `notFound()` guard, `<HtmlLangSync locale />`, and `<div lang={locale} className="relative z-10">{children}</div>`.
- [x] `components/html-lang-sync.tsx`: renders a blocking `<script>` that sets `document.documentElement.lang`, plus an effect for client navigations.
- [x] `app/not-found.tsx` (simple, language-neutral).
- [x] `LanguageSwitcher`: `useTransition`; the click handler skips modified clicks, calls `preventDefault`, then `startTransition(() => router.push(href))`; `isPending` gives reduced opacity and `aria-busy`. Keep `href` / `hrefLang`.

## Verify
- `bun run typecheck`, `bun run lint`, `bun test`, `bun run build`.
- Real browser: switching `vi` <-> `en` keeps the same koi positions (no reseed); `document.documentElement.lang` is correct after a switch and after a direct load of `/en`; middle-click and ctrl-click still open a new tab.

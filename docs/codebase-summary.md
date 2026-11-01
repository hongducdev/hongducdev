# Codebase Summary

| Path | Purpose |
| --- | --- |
| `app/[locale]/layout.tsx` | Root layout (`<html lang>`), locale validation, `generateStaticParams` for `vi`/`en`, `dynamicParams = false` |
| `app/[locale]/page.tsx` | Home page |
| `lib/i18n/config.ts` | `locales`, `defaultLocale`, `isLocale` guard |
| `lib/i18n/dictionaries/{vi,en}.ts` | Typed dictionaries; `vi.ts` defines the `Dictionary` type, `en.ts` must satisfy it |
| `lib/i18n/get-dictionary.ts` | `getDictionary(locale)` |
| `components/language-switcher.tsx` | Switches locale while keeping the current sub-path |
| `config/site.ts` | Site name, URL, social links |
| `next.config.ts` | `/` → `/vi` redirect and 301s from legacy `/blogs`, `/projects` paths |
| `open-next.config.ts`, `wrangler.jsonc` | Cloudflare Worker build (see `deployment-guide.md`) |

No middleware: routing is fully static (both locales pre-rendered).

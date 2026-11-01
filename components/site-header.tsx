import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SettingsMenu } from "@/components/settings-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const NAV_ITEMS = [
  { key: "home", path: "" },
  { key: "projects", path: "/projects" },
  { key: "blogs", path: "/blogs" },
  { key: "contact", path: "/contact" },
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <header
      data-pond-avoid
      className="fixed inset-x-0 top-0 z-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 pt-8 text-[13px] lowercase"
    >
      <nav aria-label={dict.nav.label} className="flex gap-6">
        {NAV_ITEMS.map(({ key, path }) => (
          <Link
            key={key}
            href={`/${locale}${path}`}
            className="opacity-60 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100"
          >
            {dict.nav[key]}
          </Link>
        ))}
      </nav>
      <LanguageSwitcher locale={locale} label={dict.switcher.label} />
      <ThemeToggle label={dict.theme.toggle} light={dict.theme.light} dark={dict.theme.dark} />
      <SettingsMenu text={dict.settings} />
    </header>
  );
}

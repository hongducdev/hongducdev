import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileMenu } from "@/components/mobile-menu";
import { NavLinks, type NavItem } from "@/components/nav-links";
import { SettingsMenu } from "@/components/settings-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const NAV_ITEMS = [
  { key: "home", path: "" },
  { key: "projects", path: "/projects" },
  { key: "blogs", path: "/blogs" },
  { key: "books", path: "/books" },
  { key: "contact", path: "/contact" },
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const items: NavItem[] = NAV_ITEMS.map(({ key, path }) => ({ href: `/${locale}${path}`, label: dict.nav[key] }));
  const utilities = (
    <>
      <LanguageSwitcher locale={locale} label={dict.switcher.label} />
      <ThemeToggle label={dict.theme.toggle} light={dict.theme.light} dark={dict.theme.dark} />
      <SettingsMenu text={dict.settings} />
    </>
  );

  return (
    <header
      data-pond-avoid
      className="fixed inset-x-0 top-0 z-20 flex justify-center px-4 pt-4 text-[13px] lowercase md:px-6 md:pt-6"
    >
      <div className="hidden items-center border border-foreground/10 bg-background/60 p-1 backdrop-blur-md md:flex">
        <NavLinks
          items={items}
          label={dict.nav.label}
          className="flex"
          linkClassName="px-3.5 py-2"
        />
        <span aria-hidden="true" className="mx-2 h-4 w-px bg-foreground/15" />
        <div className="flex items-center gap-4 pr-3 pl-2">{utilities}</div>
      </div>
      <div className="w-full max-w-md md:hidden">
        <MobileMenu
          items={items}
          navLabel={dict.nav.label}
          openLabel={dict.nav.menu}
          closeLabel={dict.nav.close}
        >
          {utilities}
        </MobileMenu>
      </div>
    </header>
  );
}

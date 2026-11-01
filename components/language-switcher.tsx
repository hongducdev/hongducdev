"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const prefix = `/${locale}`;
  const rest =
    pathname === prefix || pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;

  return (
    <nav aria-label={label} className="flex gap-2 text-sm">
      {locales.map((target) => (
        <Link
          key={target}
          href={`/${target}${rest}`}
          hrefLang={target}
          aria-current={target === locale ? "true" : undefined}
          className={target === locale ? "font-semibold" : "opacity-60 hover:opacity-100"}
        >
          {target.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}

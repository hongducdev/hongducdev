"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, type Locale } from "@/lib/i18n/config";
import { isModifiedClick } from "@/lib/is-modified-click";

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname() ?? `/${locale}`;
  const prefix = `/${locale}`;
  const rest =
    pathname === prefix || pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;

  return (
    <nav aria-label={label} aria-busy={isPending} className={`flex gap-3 ${isPending ? "opacity-60" : ""}`}>
      {locales.map((target) => {
        const href = `/${target}${rest}`;
        return (
          <Link
            key={target}
            href={href}
            hrefLang={target}
            aria-current={target === locale ? "true" : undefined}
            onClick={(e) => {
              if (isModifiedClick(e) || target === locale) return;
              e.preventDefault();
              startTransition(() => router.push(href));
            }}
            className={`outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 ${target === locale ? "opacity-100" : "opacity-50"}`}
          >
            {target}
          </Link>
        );
      })}
    </nav>
  );
}

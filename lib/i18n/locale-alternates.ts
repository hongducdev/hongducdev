import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { locales, type Locale } from "./config";

export function localeAlternates(locale: Locale, path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: `${siteConfig.url}/${locale}${path}`,
    languages: Object.fromEntries(locales.map((l) => [l, `${siteConfig.url}/${l}${path}`])),
  };
}

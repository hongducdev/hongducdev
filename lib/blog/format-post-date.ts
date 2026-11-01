import type { Locale } from "@/lib/i18n/config";

export function formatPostDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(isoDate),
  );
}

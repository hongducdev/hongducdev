import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localeAlternates } from "@/lib/i18n/locale-alternates";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { alternates: localeAlternates(locale, "") } : {};
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex h-[100dvh] w-full flex-col justify-end gap-10 px-6 pt-28 pb-12 lg:px-[20vw] lg:pb-32">
      <div data-pond-avoid className="flex flex-col gap-3 text-[14px] leading-relaxed lg:text-[15px]">
        <h1>{dict.home.greeting}</h1>
        <p className="opacity-60">{dict.home.role}</p>
        <p className="opacity-60">{dict.home.hobby}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {Object.entries(siteConfig.social).map(([name, url]) => (
            <li key={name}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ink-link opacity-60 hover:opacity-100 focus-visible:opacity-100"
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

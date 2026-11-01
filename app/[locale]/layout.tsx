import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { HtmlLangSync } from "@/components/html-lang-sync";
import { NavigationPendingProvider } from "@/components/navigation-pending";
import { NavigationProgress } from "@/components/navigation-progress";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getDictionary(locale);
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <NavigationPendingProvider>
      <HtmlLangSync locale={locale} />
      <NavigationProgress />
      <SiteHeader locale={locale} />
      <div lang={locale} className="relative z-10">
        {children}
      </div>
    </NavigationPendingProvider>
  );
}

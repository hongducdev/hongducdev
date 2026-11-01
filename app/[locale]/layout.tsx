import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../globals.css";
import { KoiPond } from "@/components/koi-pond/koi-pond";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const monoFont = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-mono-face",
});

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
  return { title: meta.title, description: meta.description };
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
    <html lang={locale} className={monoFont.variable} suppressHydrationWarning>
      <body className="bg-background font-mono text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="theme">
          <KoiPond />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}

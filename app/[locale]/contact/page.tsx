import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/config/site";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localeAlternates } from "@/lib/i18n/locale-alternates";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { contact } = getDictionary(locale);
  return { title: `${contact.title} · hongducdev`, description: contact.description, alternates: localeAlternates(locale, "/contact") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { contact } = getDictionary(locale);

  return (
    <PageShell title={contact.title} description={contact.description} dimPond>
      <ul data-pond-avoid className="flex flex-col gap-3">
        {Object.entries(siteConfig.social).map(([name, url]) => (
          <li key={name}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="ink-link opacity-70 hover:opacity-100 focus-visible:opacity-100"
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

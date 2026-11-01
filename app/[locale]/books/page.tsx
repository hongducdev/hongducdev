import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/config/site";
import { goodreads } from "@/lib/goodreads/data";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localeAlternates } from "@/lib/i18n/locale-alternates";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { books: copy } = getDictionary(locale);
  return { title: `${copy.title} · hongducdev`, description: copy.description, alternates: localeAlternates(locale, "/books") };
}

export default async function BooksPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getDictionary(locale).books;
  const { currentlyReading, challenge } = goodreads;
  const percent = challenge && challenge.goal > 0 ? Math.min(100, Math.round((challenge.read / challenge.goal) * 100)) : 0;

  return (
    <PageShell title={copy.title} description={copy.description}>
      <section data-pond-avoid className="flex flex-col gap-5">
        <h2 className="text-[13px] opacity-40">{copy.currentlyReading}</h2>
        {currentlyReading.length === 0 ? (
          <p className="opacity-60">{copy.nothingReading}</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {currentlyReading.map((book) => (
              <li key={book.url} className="flex flex-col gap-1">
                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ink-link w-fit opacity-90 hover:opacity-100 focus-visible:opacity-100"
                >
                  {book.title}
                </a>
                <p className="text-[12px] opacity-40">{book.author}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      {challenge && (
        <section data-pond-avoid className="flex flex-col gap-3">
          <h2 className="text-[13px] opacity-40">{copy.challenge(challenge.year)}</h2>
          <a
            href={challenge.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ink-link w-fit opacity-90 hover:opacity-100 focus-visible:opacity-100"
          >
            {copy.progress(challenge.read, challenge.goal)}
            <span className="ml-2 text-[12px] opacity-40">{percent}%</span>
          </a>
          <div
            role="progressbar"
            aria-label={copy.challenge(challenge.year)}
            aria-valuemin={0}
            aria-valuemax={challenge.goal}
            aria-valuenow={challenge.read}
            className="h-px w-full max-w-xs bg-current/15"
          >
            <div className="h-full bg-current/60" style={{ width: `${percent}%` }} />
          </div>
        </section>
      )}
      <a
        data-pond-avoid
        href={siteConfig.social.goodreads}
        target="_blank"
        rel="noopener noreferrer"
        className="ink-link w-fit opacity-60 hover:opacity-100 focus-visible:opacity-100"
      >
        {copy.profile}
      </a>
    </PageShell>
  );
}

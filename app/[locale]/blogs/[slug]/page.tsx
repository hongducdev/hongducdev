import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { formatPostDate } from "@/lib/blog/format-post-date";
import { getPost, getPostSlugs } from "@/lib/blog/posts";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => getPostSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = getPost(slug, locale);
  if (!post) return {};
  const canonicalLocale = post.translated ? locale : post.locale;
  return {
    title: `${post.title} · hongducdev`,
    description: post.description,
    alternates: { canonical: `${siteConfig.url}/${canonicalLocale}/blogs/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getPost(slug, locale);
  if (!post) notFound();
  const { blogs } = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 pt-28 pb-24 text-[14px] leading-relaxed lg:text-[15px]">
      <article data-pond-avoid className="flex flex-col gap-8">
        <Link
          href={`/${locale}/blogs`}
          className="ink-link w-fit text-[13px] opacity-60 hover:opacity-100 focus-visible:opacity-100"
        >
          {blogs.back}
        </Link>
        <header className="flex flex-col gap-2">
          <h1 className="text-[15px] lg:text-base">{post.title}</h1>
          <p className="text-[12px] opacity-40">
            {formatPostDate(post.date, locale)} · {blogs.minutes(post.minutes)}
            {!post.translated && ` · ${blogs.untranslated}`}
          </p>
        </header>
        <div className="post" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
    </main>
  );
}

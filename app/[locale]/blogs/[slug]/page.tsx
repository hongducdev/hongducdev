import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PondDim } from "@/components/pond-dim";
import { TransitionLink } from "@/components/transition-link";
import { siteConfig } from "@/config/site";
import { formatPostDate } from "@/lib/blog/format-post-date";
import { getPost, getPostSlugs, postLanguages } from "@/lib/blog/posts";
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
  const url = `${siteConfig.url}/${canonicalLocale}/blogs/${slug}`;
  return {
    title: `${post.title} · hongducdev`,
    description: post.description,
    alternates: { canonical: url, languages: postLanguages(slug) },
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: canonicalLocale === "vi" ? "vi_VN" : "en_US",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      tags: post.tags,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: { images: ["/opengraph-image"] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getPost(slug, locale);
  if (!post) notFound();
  const { blogs } = getDictionary(locale);

  const postUrl = `${siteConfig.url}/${post.translated ? locale : post.locale}/blogs/${slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          inLanguage: post.locale,
          keywords: post.tags.join(", "),
          mainEntityOfPage: postUrl,
          author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
        }}
      />
      <PondDim />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 pt-28 pb-24 text-[14px] leading-relaxed lg:text-[15px]">
        <article data-pond-avoid className="flex flex-col gap-8">
          <TransitionLink
            href={`/${locale}/blogs`}
            className="ink-link w-fit text-[13px] opacity-60 hover:opacity-100 focus-visible:opacity-100"
          >
            {blogs.back}
          </TransitionLink>
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
    </>
  );
}

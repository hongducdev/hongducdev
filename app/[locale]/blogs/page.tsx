import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getPosts } from "@/lib/blog/posts";
import { formatPostDate } from "@/lib/blog/format-post-date";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localeAlternates } from "@/lib/i18n/locale-alternates";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { blogs } = getDictionary(locale);
  return { title: `${blogs.title} · hongducdev`, description: blogs.description, alternates: localeAlternates(locale, "/blogs") };
}

export default async function BlogsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { blogs } = getDictionary(locale);
  const posts = getPosts(locale);

  return (
    <PageShell title={blogs.title} description={blogs.description}>
      {posts.length === 0 ? (
        <p data-pond-avoid className="opacity-60">
          {blogs.empty}
        </p>
      ) : (
        <ul data-pond-avoid className="flex flex-col gap-7">
          {posts.map((post) => (
            <li key={post.slug} className="flex flex-col gap-1">
              <Link
                href={`/${locale}/blogs/${post.slug}`}
                className="ink-link w-fit opacity-90 hover:opacity-100 focus-visible:opacity-100"
              >
                {post.title}
              </Link>
              <p className="opacity-60">{post.description}</p>
              <p className="text-[12px] opacity-40">
                {formatPostDate(post.date, locale)} · {blogs.minutes(post.minutes)}
                {!post.translated && ` · ${blogs.untranslated}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

import { siteConfig } from "@/config/site";
import compiled from "@/lib/generated/blog-posts.json";
import type { Locale } from "@/lib/i18n/config";
import { defaultLocale, locales } from "@/lib/i18n/config";

export interface BlogPost {
  slug: string;
  locale: Locale;
  title: string;
  description: string;
  date: string;
  tags: string[];
  minutes: number;
  html: string;
}

export interface LocalizedPost extends BlogPost {
  translated: boolean;
}

const allPosts = compiled as BlogPost[];

function pick(slug: string, locale: Locale): LocalizedPost | null {
  const own = allPosts.find((p) => p.slug === slug && p.locale === locale);
  if (own) return { ...own, translated: true };
  const fallback = allPosts.find((p) => p.slug === slug && p.locale === defaultLocale);
  return fallback ? { ...fallback, translated: false } : null;
}

export function getPostSlugs(): string[] {
  return [...new Set(allPosts.map((p) => p.slug))];
}

export function getPosts(locale: Locale): LocalizedPost[] {
  return getPostSlugs()
    .map((slug) => pick(slug, locale))
    .filter((p): p is LocalizedPost => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string, locale: Locale): LocalizedPost | null {
  return pick(slug, locale);
}

export function postLanguages(slug: string): Record<string, string> | undefined {
  const translated = locales.filter((l) => allPosts.some((p) => p.slug === slug && p.locale === l));
  if (translated.length < 2) return undefined;
  return Object.fromEntries(translated.map((l) => [l, `${siteConfig.url}/${l}/blogs/${slug}`]));
}

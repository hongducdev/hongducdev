import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPosts } from "@/lib/blog/posts";
import { locales } from "@/lib/i18n/config";

const STATIC_PATHS = ["", "/projects", "/blogs", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${siteConfig.url}/${l}${path}`])),
      },
    })),
  );
  const postEntries = locales.flatMap((locale) =>
    getPosts(locale)
      .filter((post) => post.translated)
      .map((post) => ({
        url: `${siteConfig.url}/${locale}/blogs/${post.slug}`,
        lastModified: post.date,
      })),
  );
  return [...staticEntries, ...postEntries];
}

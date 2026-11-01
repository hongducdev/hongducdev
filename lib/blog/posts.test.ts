import { describe, expect, test } from "bun:test";
import { getPost, getPostSlugs, getPosts } from "./posts";

describe("blog posts", () => {
  test("lists every slug once", () => {
    const slugs = getPostSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("english falls back to vietnamese and is flagged untranslated", () => {
    const slug = getPostSlugs()[0];
    const post = getPost(slug, "en");
    expect(post?.locale).toBe("vi");
    expect(post?.translated).toBe(false);
  });

  test("vietnamese posts are translated and sorted newest first", () => {
    const posts = getPosts("vi");
    expect(posts.every((p) => p.translated)).toBe(true);
    const dates = posts.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test("unknown slug returns null", () => {
    expect(getPost("does-not-exist", "vi")).toBeNull();
  });
});

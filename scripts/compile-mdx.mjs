import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeFixImagePaths from "./rehype-fix-image-paths.mjs";
import rehypeDemoteH1 from "./rehype-demote-h1.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOGS_DIR = path.join(root, "content", "blogs");
const OUTPUT_FILE = path.join(root, "lib", "generated", "blog-posts.json");
const FILE_PATTERN = /^(?<slug>.+)\.(?<locale>vi|en)\.mdx$/;
const WORDS_PER_MINUTE = 200;

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeHighlight)
  .use(rehypeFixImagePaths)
  .use(rehypeDemoteH1)
  .use(rehypeStringify, { allowDangerousHtml: true });

function requireField(data, field, file) {
  if (typeof data[field] !== "string" || data[field] === "") {
    throw new Error(`${file}: frontmatter "${field}" is required`);
  }
  return data[field];
}

async function compilePost(file) {
  const match = FILE_PATTERN.exec(file);
  if (!match?.groups) throw new Error(`${file}: expected <slug>.<vi|en>.mdx`);
  const { data, content } = matter(await fs.readFile(path.join(BLOGS_DIR, file), "utf8"));
  const html = String(await processor.process(content));
  return {
    slug: match.groups.slug,
    locale: match.groups.locale,
    title: requireField(data, "title", file),
    description: requireField(data, "description", file),
    date: requireField(data, "date", file),
    tags: Array.isArray(data.tags) ? data.tags : [],
    minutes: Math.max(1, Math.round(content.split(/\s+/).length / WORDS_PER_MINUTE)),
    html,
  };
}

const files = (await fs.readdir(BLOGS_DIR)).filter((f) => f.endsWith(".mdx")).sort();
const posts = await Promise.all(files.map(compilePost));
posts.sort((a, b) => b.date.localeCompare(a.date));

await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
const output = JSON.stringify(posts);
// Rewriting an identical file still makes a running dev server rebuild, so only write on change.
const previous = await fs.readFile(OUTPUT_FILE, "utf8").catch(() => null);
if (previous !== output) await fs.writeFile(OUTPUT_FILE, output);
console.log(`compiled ${posts.length} blog posts -> ${path.relative(root, OUTPUT_FILE)}`);

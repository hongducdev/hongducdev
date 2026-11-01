import type { CurrentBook, ReadingChallenge } from "./types";

const ESCAPES: Record<string, string> = { n: "\n", r: "\r", t: "\t" };

// Widget responses are JS that assigns an HTML string; the literal is read as data and never executed.
function unescapeJsString(literal: string): string {
  return literal.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_, esc: string) =>
    esc.startsWith("u") && esc.length === 5 ? String.fromCharCode(Number.parseInt(esc.slice(1), 16)) : (ESCAPES[esc] ?? esc),
  );
}

export function extractWidgetHtml(script: string): string {
  const match = /(?:widget_code\s*=|innerHTML\s*=)\s*'((?:[^'\\]|\\.)*)'/.exec(script);
  if (!match) throw new Error("Goodreads widget response has no HTML payload");
  return unescapeJsString(match[1]);
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function bookUrl(chunk: string, fallback: string): string {
  const bookId = /\/books\/[^"']*?\/(\d+)\._S[XY]\d+_/.exec(chunk)?.[1];
  return bookId ? `https://www.goodreads.com/book/show/${bookId}` : fallback;
}

export function parseCurrentlyReading(script: string): CurrentBook[] {
  const html = extractWidgetHtml(script);
  return html
    .split(/class="gr_custom_each_container_\d*"/)
    .slice(1)
    .flatMap((chunk) => {
      const title = /gr_custom_title_\d*">\s*<a[^>]*href="([^"]*)"[^>]*>([^<]*)</.exec(chunk);
      const author = /gr_custom_author_\d*">\s*by\s*<a[^>]*>([^<]*)</.exec(chunk);
      if (!title || !author) return [];
      const reviewUrl = decodeEntities(title[1]).split("?")[0];
      return [{ title: decodeEntities(title[2]).trim(), author: decodeEntities(author[1]).trim(), url: bookUrl(chunk, reviewUrl) }];
    });
}

export function parseChallenge(script: string): ReadingChallenge {
  const html = extractWidgetHtml(script);
  const progress = /(\d+)\s+of\s+(\d+)\s+\(\d+%\)/.exec(html);
  const link = /href="(https:\/\/www\.goodreads\.com\/challenges\/[^"?]+)/.exec(html);
  const year = /(\d{4})\s+Reading Challenge/.exec(html);
  if (!progress || !link || !year) throw new Error("Goodreads challenge widget has an unexpected shape");
  return { year: Number(year[1]), read: Number(progress[1]), goal: Number(progress[2]), url: link[1] };
}

import { readFile, writeFile } from "node:fs/promises";

const README = new URL("../README.md", import.meta.url);
const IDIOMS = new URL("../data/idioms.json", import.meta.url);
const START = "<!--START_SECTION:daily-->";
const END = "<!--END_SECTION:daily-->";

const SUBJECTS = [
  "fiction", "fantasy", "science fiction", "philosophy", "psychology", "history",
  "biography", "science", "business", "self-help", "poetry", "technology",
];
const MIN_RATINGS = 30;

const day = Math.floor(Date.now() / 86_400_000);
const mix = (n) => Math.imul(n ^ (n >>> 15), 2246822519) >>> 0;

async function searchBooks(subject, offset, limit) {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", `subject:"${subject}" ratings_count:[${MIN_RATINGS} TO *]`);
  url.searchParams.set("sort", "rating");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("fields", "key,title,author_name,first_publish_year,ratings_average");

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "hongducdev-readme (https://hongduc.dev)" } });
      if (!res.ok) throw new Error(`Open Library responded ${res.status}`);
      return await res.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
  throw lastError;
}

async function pickBook() {
  const subject = SUBJECTS[mix(day) % SUBJECTS.length];
  const { numFound } = await searchBooks(subject, 0, 1);
  if (!numFound) throw new Error(`No books found for subject "${subject}"`);
  const { docs } = await searchBooks(subject, mix(day + 1) % numFound, 1);
  if (!docs[0]) throw new Error(`Empty result for subject "${subject}"`);
  return { ...docs[0], subject };
}

const idioms = JSON.parse(await readFile(IDIOMS, "utf8"));
const idiom = idioms[day % idioms.length];
const book = await pickBook();

const author = book.author_name?.[0] ?? "unknown";
const year = book.first_publish_year ? ` (${book.first_publish_year})` : "";
const rating = book.ratings_average ? ` · ★ ${book.ratings_average.toFixed(1)}` : "";

const section = `${START}
<p align="center"><b>“${idiom.text}”</b><br><sub>${idiom.meaning}</sub></p>
<p align="center">📚 <a href="https://openlibrary.org${book.key}"><b>${book.title}</b></a> · ${author}${year}${rating}<br><sub>sách gợi ý hôm nay · thể loại: ${book.subject}</sub></p>
${END}`;

const readme = await readFile(README, "utf8");
const from = readme.indexOf(START);
const to = readme.indexOf(END);
if (from === -1 || to === -1 || to < from) throw new Error("daily section markers not found in README.md");

const next = readme.slice(0, from) + section + readme.slice(to + END.length);
if (next !== readme) await writeFile(README, next);
console.log(`${idiom.text} | ${book.title} — ${author}`);

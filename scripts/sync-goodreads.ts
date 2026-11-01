import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../config/site";
import { parseChallenge, parseCurrentlyReading } from "../lib/goodreads/parse-widgets";
import type { GoodreadsData } from "../lib/goodreads/types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_FILE = path.join(root, "lib", "generated", "goodreads.json");
const { userId, challengeId } = siteConfig.goodreads;

const SHELF_URL = `https://www.goodreads.com/review/custom_widget/${userId}.Reading?shelf=currently-reading&num_books=20&show_author=1&show_title=1&show_cover=1`;
const CHALLENGE_URL = `https://www.goodreads.com/user_challenges/widget/${userId}?challenge_id=${challengeId}&v=2`;

function loadPrevious(): GoodreadsData {
  const empty: GoodreadsData = { currentlyReading: [], challenge: null };
  if (!existsSync(OUTPUT_FILE)) return empty;
  try {
    return JSON.parse(readFileSync(OUTPUT_FILE, "utf8")) as GoodreadsData;
  } catch (error) {
    console.warn(`goodreads: ignoring unreadable ${path.basename(OUTPUT_FILE)} (${error instanceof Error ? error.message : String(error)})`);
    return empty;
  }
}

// Several scripts run this sync (dev, build, test, typecheck). Skipping an unchanged file avoids needless dev-server rebuilds, and a temp file + rename keeps readers from seeing a half-written one.
function writeAtomically(file: string, contents: string): void {
  if (existsSync(file) && readFileSync(file, "utf8") === contents) return;
  const temp = `${file}.${process.pid}.tmp`;
  try {
    writeFileSync(temp, contents, "utf8");
    renameSync(temp, file);
  } catch (error) {
    rmSync(temp, { force: true });
    throw error;
  }
}

async function fetchWidget(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { "User-Agent": "hongduc.dev build" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

// A failed fetch keeps the previous value so a Goodreads outage never blanks the page.
async function refresh<T>(label: string, previous: T, load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.warn(`goodreads: ${label} not refreshed, keeping previous data (${error instanceof Error ? error.message : String(error)})`);
    return previous;
  }
}

const previous = loadPrevious();
const data: GoodreadsData = {
  currentlyReading: await refresh("currently-reading", previous.currentlyReading, async () => parseCurrentlyReading(await fetchWidget(SHELF_URL))),
  challenge: await refresh("challenge", previous.challenge, async () => parseChallenge(await fetchWidget(CHALLENGE_URL))),
};

mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
writeAtomically(OUTPUT_FILE, `${JSON.stringify(data, null, 2)}\n`);
console.log(`goodreads: ${data.currentlyReading.length} currently reading, challenge ${data.challenge ? `${data.challenge.read}/${data.challenge.goal}` : "unavailable"}`);

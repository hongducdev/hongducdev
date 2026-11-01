import type { Locale } from "./config";
import { en } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";
import type { Dictionary } from "./dictionaries/vi";

const dictionaries: Record<Locale, Dictionary> = { vi, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

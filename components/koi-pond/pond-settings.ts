import { VARIETIES, isVarietyId, type VarietyId } from "./koi-varieties";

export interface PondSettings {
  varieties: VarietyId[];
  lotus: boolean;
  sakura: boolean;
}

export const STORAGE_KEY = "pond-settings";

export const DEFAULT_SETTINGS: PondSettings = {
  varieties: VARIETIES.map((v) => v.id),
  lotus: true,
  sakura: true,
};

function sanitize(raw: unknown): PondSettings {
  if (typeof raw !== "object" || raw === null) return DEFAULT_SETTINGS;
  const { varieties, lotus, sakura } = raw as Record<string, unknown>;
  const ids = Array.isArray(varieties) ? varieties.filter(isVarietyId) : [];
  return {
    varieties: ids.length > 0 ? ids : DEFAULT_SETTINGS.varieties,
    lotus: typeof lotus === "boolean" ? lotus : DEFAULT_SETTINGS.lotus,
    sakura: typeof sakura === "boolean" ? sakura : DEFAULT_SETTINGS.sakura,
  };
}

export function readSettings(): PondSettings {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? DEFAULT_SETTINGS : sanitize(JSON.parse(stored));
  } catch (error) {
    console.error(`pond: could not read "${STORAGE_KEY}" from localStorage, using defaults`, error);
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: PondSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error(`pond: could not save "${STORAGE_KEY}" to localStorage`, error);
  }
}

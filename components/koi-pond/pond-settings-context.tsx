"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS, readSettings, writeSettings, type PondSettings } from "./pond-settings";

interface PondSettingsValue {
  settings: PondSettings;
  /** False until the stored settings have replaced the defaults on the client. */
  hydrated: boolean;
  update: (patch: Partial<PondSettings>) => void;
}

const PondSettingsContext = createContext<PondSettingsValue | null>(null);

export function PondSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PondSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(readSettings());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<PondSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, hydrated, update }), [settings, hydrated, update]);
  return <PondSettingsContext.Provider value={value}>{children}</PondSettingsContext.Provider>;
}

export function usePondSettings(): PondSettingsValue {
  const value = useContext(PondSettingsContext);
  if (!value) throw new Error("usePondSettings must be used inside PondSettingsProvider");
  return value;
}

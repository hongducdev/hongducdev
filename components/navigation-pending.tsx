"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type PendingContextValue = { pending: boolean; setLinkPending: (id: string, pending: boolean) => void };

const PendingContext = createContext<PendingContextValue | null>(null);

export function NavigationPendingProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<ReadonlySet<string>>(new Set());

  const setLinkPending = useCallback((id: string, pending: boolean) => {
    setIds((prev) => {
      if (prev.has(id) === pending) return prev;
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ pending: ids.size > 0, setLinkPending }), [ids, setLinkPending]);
  return <PendingContext.Provider value={value}>{children}</PendingContext.Provider>;
}

export function useNavigationPending(): PendingContextValue {
  const ctx = useContext(PendingContext);
  if (!ctx) throw new Error("useNavigationPending must be used inside NavigationPendingProvider");
  return ctx;
}

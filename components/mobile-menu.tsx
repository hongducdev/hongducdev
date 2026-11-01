"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLinks, useActiveItem, type NavItem } from "@/components/nav-links";

const PANEL_ID = "mobile-menu-panel";

export function MobileMenu({
  items,
  navLabel,
  openLabel,
  closeLabel,
  children,
}: {
  items: readonly NavItem[];
  navLabel: string;
  openLabel: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const active = useActiveItem(items);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative md:hidden">
      <div className="flex items-center justify-between border border-foreground/10 bg-background/70 py-1 pr-1 pl-4 backdrop-blur-md">
        <span className="opacity-60">~/{active?.label ?? ""}</span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 outline-none transition-colors duration-150 hover:bg-foreground/[0.08] focus-visible:bg-foreground/10"
        >
          <span>{open ? closeLabel : openLabel}</span>
          <span aria-hidden="true" className="opacity-60">
            {open ? "[x]" : "[+]"}
          </span>
        </button>
      </div>
      {open && (
        <div
          id={PANEL_ID}
          className="absolute inset-x-0 top-full mt-2 flex flex-col border border-foreground/10 bg-background/95 backdrop-blur-md"
        >
          <NavLinks
            items={items}
            label={navLabel}
            className="flex flex-col"
            linkClassName="border-b border-foreground/10 px-4 py-3.5 text-[15px]"
          />
          <div className="flex items-center justify-between gap-6 px-4 py-3.5">{children}</div>
        </div>
      )}
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/transition-link";

export type NavItem = { href: string; label: string };

export function isActivePath(pathname: string | null, href: string, homeHref: string): boolean {
  if (!pathname) return false;
  return href === homeHref ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function useActiveItem(items: readonly NavItem[]): NavItem | undefined {
  const pathname = usePathname();
  return items.find((item) => isActivePath(pathname, item.href, items[0].href));
}

export function NavLinks({
  items,
  label,
  className,
  linkClassName,
}: {
  items: readonly NavItem[];
  label: string;
  className?: string;
  linkClassName: string;
}) {
  const active = useActiveItem(items);
  return (
    <nav aria-label={label} className={className}>
      {items.map((item) => {
        const current = item === active;
        return (
          <TransitionLink
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`${linkClassName} outline-none transition-[opacity,background-color] duration-150 focus-visible:bg-foreground/10 ${
              current ? "bg-foreground/[0.08] opacity-100" : "opacity-55 hover:opacity-100"
            }`}
          >
            {item.label}
          </TransitionLink>
        );
      })}
    </nav>
  );
}

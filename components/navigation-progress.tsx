"use client";

import { useNavigationPending } from "@/components/navigation-pending";

export function NavigationProgress() {
  const { pending } = useNavigationPending();
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 h-0.5 overflow-hidden transition-opacity duration-200 ${pending ? "opacity-100" : "opacity-0"}`}
    >
      <div className="nav-progress-bar h-full w-1/3 bg-foreground/70" />
    </div>
  );
}

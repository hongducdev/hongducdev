"use client";

import { useTheme } from "next-themes";

export function ThemeToggle({ label, light, dark }: { label: string; light: string; dark: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className="opacity-50 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100"
    >
      <span className="hidden dark:inline">{light}</span>
      <span className="dark:hidden">{dark}</span>
    </button>
  );
}

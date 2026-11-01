import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import "./globals.css";
import { KoiPond } from "@/components/koi-pond/koi-pond";
import { PondSettingsProvider } from "@/components/koi-pond/pond-settings-context";

const monoFont = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-mono-face",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={monoFont.variable} suppressHydrationWarning>
      <body className="bg-background font-mono text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="theme">
          <PondSettingsProvider>
            <KoiPond />
            {children}
          </PondSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

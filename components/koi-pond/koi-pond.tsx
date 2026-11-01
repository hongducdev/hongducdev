"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { PondEngine, type PondStats } from "./koi-engine";

export function KoiPond() {
  const isLight = useTheme().resolvedTheme === "light";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PondEngine | null>(null);
  const [stats, setStats] = useState<PondStats>({ koi: 0, pellets: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new PondEngine(canvas, setStats);
    engineRef.current = engine;
    const applyFont = () =>
      engine.setFontFamily(getComputedStyle(document.body).getPropertyValue("--font-mono-face").trim());
    applyFont();
    void document.fonts.ready.then(applyFont);
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setTheme(isLight);
  }, [isLight]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
      {stats.koi > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-8 right-6 z-10 text-[11px] leading-relaxed tabular-nums max-lg:hidden lg:right-[20vw]"
        >
          <div className="opacity-30">{stats.koi}</div>
          <div key={stats.pellets} className="animate-[pellet-flash_600ms_ease-out_forwards]">
            {stats.pellets}
          </div>
        </div>
      )}
    </>
  );
}

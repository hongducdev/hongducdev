"use client";

import { useTheme } from "next-themes";
import { useId } from "react";
import { DARK, LIGHT, packRgb } from "@/components/koi-pond/koi-palette";
import { VARIETIES, VISIBILITY_THRESHOLD, allowedVarieties, baseSkin, type VarietyId } from "@/components/koi-pond/koi-varieties";
import { usePondSettings } from "@/components/koi-pond/pond-settings-context";
import type { Dictionary } from "@/lib/i18n/dictionaries/vi";

function swatch(rgb: number): string {
  return `rgb(${rgb >>> 16},${(rgb >>> 8) & 255},${rgb & 255})`;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-6 outline-none focus-visible:underline"
    >
      <span>{label}</span>
      <span className={checked ? "opacity-100" : "opacity-40"}>{checked ? "[x]" : "[ ]"}</span>
    </button>
  );
}

export function SettingsMenu({ text }: { text: Dictionary["settings"] }) {
  const panelId = useId();
  const isLight = useTheme().resolvedTheme === "light";
  const { settings, update } = usePondSettings();
  const palette = isLight ? LIGHT : DARK;
  const visible = allowedVarieties(palette, VISIBILITY_THRESHOLD);
  const enabledVisible = settings.varieties.filter((id) => visible.includes(id));

  const toggleVariety = (id: VarietyId) => {
    const on = settings.varieties.includes(id);
    update({ varieties: on ? settings.varieties.filter((v) => v !== id) : [...settings.varieties, id] });
  };

  return (
    <>
      <button
        type="button"
        popoverTarget={panelId}
        aria-haspopup="dialog"
        className="opacity-50 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100"
      >
        {text.button}
      </button>
      <div
        id={panelId}
        popover="auto"
        role="dialog"
        aria-label={text.title}
        data-pond-ignore
        className="fixed inset-auto top-16 left-1/2 m-0 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 border border-foreground/15 bg-background p-5 text-[13px] text-foreground lowercase"
      >
        <div className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 opacity-60">{text.varieties}</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {VARIETIES.map((variety) => {
                const locked = !visible.includes(variety.id);
                const on = settings.varieties.includes(variety.id);
                const last = on && !locked && enabledVisible.length <= 1;
                const title = locked ? (isLight ? text.lockedOnLight : text.lockedOnDark) : last ? text.lastVariety : undefined;
                return (
                  <button
                    key={variety.id}
                    type="button"
                    role="checkbox"
                    aria-checked={on && !locked}
                    aria-disabled={locked || last}
                    disabled={locked || last}
                    title={title}
                    onClick={() => toggleVariety(variety.id)}
                    className={`flex items-center gap-2 outline-none focus-visible:underline disabled:cursor-not-allowed ${on && !locked ? "opacity-100" : "opacity-40"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block size-2.5 border border-foreground/30"
                      style={{ backgroundColor: swatch(packRgb(baseSkin(variety, palette))) }}
                    />
                    {variety.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <Toggle label={text.lotus} checked={settings.lotus} onChange={(lotus) => update({ lotus })} />
          <Toggle label={text.sakura} checked={settings.sakura} onChange={(sakura) => update({ sakura })} />
        </div>
      </div>
    </>
  );
}

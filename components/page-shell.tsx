import type { ReactNode } from "react";

export function PageShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 pt-28 pb-24 text-[14px] leading-relaxed lg:text-[15px]">
      <div data-pond-avoid className="flex flex-col gap-2">
        <h1 className="text-[15px] lg:text-base">{title}</h1>
        {description && <p className="opacity-60">{description}</p>}
      </div>
      {children}
    </main>
  );
}

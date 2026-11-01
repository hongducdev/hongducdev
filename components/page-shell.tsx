import type { ReactNode } from "react";

type PageShellProps = { title: string; description?: string; dimPond?: boolean; children: ReactNode };

export function PageShell({ title, description, dimPond = false, children }: PageShellProps) {
  return (
    <>
      {dimPond && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-background/70 backdrop-blur-[1px]" />
      )}
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 pt-28 pb-24 text-[14px] leading-relaxed lg:text-[15px]">
        <div data-pond-avoid className="flex flex-col gap-2">
          <h1 className="text-[15px] lg:text-base">{title}</h1>
          {description && <p className="opacity-60">{description}</p>}
        </div>
        {children}
      </main>
    </>
  );
}

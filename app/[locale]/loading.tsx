export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex w-full max-w-2xl animate-pulse flex-col gap-10 px-6 pt-28 pb-24"
    >
      <div className="flex flex-col gap-3">
        <div className="h-4 w-40 rounded bg-foreground/10" />
        <div className="h-3 w-64 rounded bg-foreground/10" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-3 w-full rounded bg-foreground/10" />
        <div className="h-3 w-5/6 rounded bg-foreground/10" />
        <div className="h-3 w-2/3 rounded bg-foreground/10" />
      </div>
    </main>
  );
}

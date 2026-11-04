export default function Loading() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-live="polite">
      <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-primary/15">
        <div className="h-full w-1/3 animate-[le-progress_1s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
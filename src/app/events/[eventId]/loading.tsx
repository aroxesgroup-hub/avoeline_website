export default function PublicEventLoading() {
  return (
    <main className="w-full animate-pulse">
      <div className="aspect-video w-full bg-[var(--mkt-surface-low)] md:aspect-[21/9]" />
      <div className="mx-auto -mt-6 w-full max-w-[var(--mkt-max,80rem)] px-6 sm:-mt-8 lg:px-10">
        <div className="h-44 rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)]" />
      </div>
      <div className="mt-4 border-y border-[var(--mkt-line)] bg-[var(--mkt-surface)] py-5">
        <div className="mx-auto grid max-w-[var(--mkt-max,80rem)] gap-4 px-6 sm:grid-cols-5 lg:px-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-[var(--mkt-line)]/60" />
          ))}
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[var(--mkt-max,80rem)] gap-10 px-6 py-10 lg:grid-cols-[1.35fr_0.9fr] lg:px-10">
        <div className="order-2 space-y-6 lg:order-1">
          <div className="h-8 w-2/3 rounded-lg bg-[var(--mkt-surface-low)]" />
          <div className="h-24 w-full rounded-xl bg-[var(--mkt-surface-low)]" />
          <div className="h-40 w-full rounded-xl bg-[var(--mkt-surface-low)]" />
        </div>
        <div className="order-1 h-80 rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] lg:order-2" />
      </div>
    </main>
  );
}

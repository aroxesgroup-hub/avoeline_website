import type { BlockDataMap } from "../schemas";
import { SectionShell, hasText } from "./shared";

export function StatsStripRenderer({ data }: { data: BlockDataMap["stats_strip"] }) {
  const items = (data.items ?? []).filter((item) => hasText(item.value) && hasText(item.label));
  if (items.length === 0) return null;

  return (
    <SectionShell className="border-y border-[var(--mkt-line)] bg-[var(--mkt-surface)] py-12 sm:py-14">
      {hasText(data.title) ? (
        <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mkt-muted)]">
          {data.title.trim()}
        </p>
      ) : null}
      <div
        className={`grid gap-8 sm:grid-cols-2 ${
          items.length <= 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"
        }`}
      >
        {items.map((item, i) => (
          <dl key={`${item.key || item.label}-${i}`} className="text-center sm:text-left">
            <dd className="font-display text-3xl font-semibold tracking-tight text-[var(--mkt-ink)] sm:text-4xl">
              {item.value.trim()}
            </dd>
            <dt className="mt-1 text-sm text-[var(--mkt-muted)]">{item.label.trim()}</dt>
          </dl>
        ))}
      </div>
    </SectionShell>
  );
}

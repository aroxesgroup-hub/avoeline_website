import type { BlockDataMap } from "../schemas";
import { SectionShell, SectionTitle, hasText } from "./shared";

export function FaqRenderer({ data }: { data: BlockDataMap["faq"] }) {
  const items = (data.items ?? []).filter((item) => hasText(item.question));
  if (items.length === 0) return null;

  return (
    <SectionShell className="bg-[var(--mkt-surface)]">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
        Got questions?
      </p>
      <SectionTitle title={data.title} />
      <div className="mkt-card divide-y divide-[var(--mkt-line)] rounded-2xl">
        {items.map((item, i) => (
          <details key={`${item.question}-${i}`} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-medium text-[var(--mkt-ink)] marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {item.question.trim()}
                <span
                  aria-hidden="true"
                  className="text-[var(--mkt-muted)] transition group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            {hasText(item.answer) ? (
              <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-muted)]">
                {item.answer.trim()}
              </p>
            ) : null}
          </details>
        ))}
      </div>
    </SectionShell>
  );
}

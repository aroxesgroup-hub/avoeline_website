import type { BlockDataMap } from "../schemas";
import { SectionShell, SectionTitle, hasText } from "./shared";

type Side = NonNullable<BlockDataMap["comparison"]["left"]>;

function SideCard({ side, accent }: { side: Side | undefined; accent: boolean }) {
  if (!side) return null;
  const items = (side.items ?? []).filter(hasText);
  const hasContent = hasText(side.title) || hasText(side.label) || items.length > 0;
  if (!hasContent) return null;

  return (
    <div
      className={`mkt-card flex h-full flex-col rounded-2xl p-6 sm:p-7 ${
        accent
          ? "border-[var(--mkt-accent)] bg-[var(--mkt-accent-tint)]/40"
          : "bg-[var(--mkt-panel)]"
      }`}
    >
      {hasText(side.label) ? (
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
            accent ? "text-[var(--mkt-accent-deep)]" : "text-[var(--mkt-muted)]"
          }`}
        >
          {side.label.trim()}
        </p>
      ) : null}
      {hasText(side.title) ? (
        <h3 className="mt-2 font-display text-xl font-semibold text-[var(--mkt-ink)] sm:text-2xl">
          {side.title.trim()}
        </h3>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-5 space-y-2.5 text-sm text-[var(--mkt-muted)]">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  accent ? "bg-[var(--mkt-accent)]" : "bg-[var(--mkt-muted)]"
                }`}
              />
              <span>{item.trim()}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ComparisonRenderer({ data }: { data: BlockDataMap["comparison"] }) {
  const leftOk =
    hasText(data.left?.title) ||
    hasText(data.left?.label) ||
    (data.left?.items ?? []).some(hasText);
  const rightOk =
    hasText(data.right?.title) ||
    hasText(data.right?.label) ||
    (data.right?.items ?? []).some(hasText);
  if (!leftOk && !rightOk) return null;

  return (
    <SectionShell>
      <SectionTitle title={data.title} body={data.body} />
      <div className="grid gap-5 lg:grid-cols-2">
        <SideCard side={data.left} accent={false} />
        <SideCard side={data.right} accent />
      </div>
    </SectionShell>
  );
}

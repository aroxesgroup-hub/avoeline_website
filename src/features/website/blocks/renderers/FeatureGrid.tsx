import type { BlockDataMap } from "../schemas";
import { SectionShell, SectionTitle, hasText } from "./shared";

function spanClass(span?: string) {
  const s = (span ?? "").trim().toLowerCase();
  if (s === "large") return "sm:col-span-2 sm:row-span-2";
  if (s === "wide") return "sm:col-span-2 lg:col-span-3";
  return "";
}

export function FeatureGridRenderer({ data }: { data: BlockDataMap["feature_grid"] }) {
  const items = (data.items ?? []).filter((item) => hasText(item.title));
  if (items.length === 0) return null;

  const eyebrow = hasText(data.eyebrow) ? data.eyebrow.trim() : "Comprehensive capabilities";
  const anchorId = hasText(data.anchorId) ? data.anchorId.trim() : undefined;

  return (
    <SectionShell id={anchorId}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
        {eyebrow}
      </p>
      <SectionTitle title={data.title} body={data.body} />
      <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const tags = (item.tags ?? []).filter(hasText);
          return (
            <li
              key={`${item.title}-${i}`}
              className={`mkt-card lift flex flex-col rounded-2xl bg-[var(--mkt-accent-tint)]/50 p-6 transition hover:-translate-y-0.5 hover:border-[var(--mkt-accent)] ${spanClass(item.span)}`}
            >
              {hasText(item.icon) ? (
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--mkt-accent)]">
                  {item.icon.trim()}
                </p>
              ) : null}
              <h3 className="font-display text-xl font-semibold text-[var(--mkt-ink)]">
                {item.title.trim()}
              </h3>
              {hasText(item.body) ? (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--mkt-muted)]">
                  {item.body.trim()}
                </p>
              ) : null}
              {tags.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-lg bg-[var(--mkt-panel)] px-2.5 py-1 text-[11px] font-semibold text-[var(--mkt-accent-deep)]"
                    >
                      {tag.trim()}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

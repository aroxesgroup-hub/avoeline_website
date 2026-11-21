import Link from "next/link";
import type { BlockDataMap } from "../schemas";
import { SectionShell, SectionTitle, hasText } from "./shared";

export function PricingTeaserRenderer({ data }: { data: BlockDataMap["pricing_teaser"] }) {
  const items = (data.items ?? []).filter((item) => hasText(item.name));
  if (items.length === 0) return null;
  const showRecommended = data.showRecommended !== false;

  return (
    <SectionShell>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
        Clear pricing
      </p>
      <SectionTitle title={data.title} body={data.body} />
      <ul className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {items.map((item, i) => {
          const recommended = showRecommended && item.recommended;
          const cta = hasText(item.ctaLabel)
            ? item.ctaLabel.trim()
            : recommended
              ? "Upgrade Now"
              : "Start Free";
          return (
            <li
              key={`${item.name}-${i}`}
              className={`mkt-card flex flex-col rounded-2xl p-6 ${
                recommended ? "border-[var(--mkt-accent)] bg-[var(--mkt-accent-tint)]" : ""
              }`}
            >
              {recommended ? (
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--mkt-accent)]">
                  Recommended
                </p>
              ) : null}
              <h3 className="font-display text-2xl font-semibold text-[var(--mkt-ink)]">
                {item.name.trim()}
              </h3>
              {hasText(item.tagline) ? (
                <p className="mt-2 text-sm text-[var(--mkt-muted)]">{item.tagline.trim()}</p>
              ) : null}
              {hasText(item.price) ? (
                <p className="mt-4 font-display text-3xl font-semibold text-[var(--mkt-ink)]">
                  {item.price.trim()}
                </p>
              ) : null}
              {(item.features ?? []).filter(hasText).length > 0 ? (
                <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--mkt-muted)]">
                  {(item.features ?? []).filter(hasText).map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mkt-accent)]" />
                      <span>{f.trim()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1" />
              )}
              {hasText(item.href) ? (
                <Link
                  href={item.href.trim()}
                  className={`mt-6 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition ${
                    recommended
                      ? "mkt-btn"
                      : "border border-[var(--mkt-line)] bg-[var(--mkt-panel)] text-[var(--mkt-ink)] hover:border-[var(--mkt-accent)]"
                  }`}
                >
                  {cta}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
      {hasText(data.ctaLabel) && hasText(data.ctaHref) ? (
        <div className="mt-8 text-center">
          <Link
            href={data.ctaHref.trim()}
            className="text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:text-[var(--mkt-accent)]"
          >
            {data.ctaLabel.trim()} →
          </Link>
        </div>
      ) : null}
    </SectionShell>
  );
}

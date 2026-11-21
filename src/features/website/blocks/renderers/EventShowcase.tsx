import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { BlockDataMap } from "../schemas";
import { SectionShell, hasText } from "./shared";

export function EventShowcaseRenderer({ data }: { data: BlockDataMap["event_showcase"] }) {
  const items = (data.items ?? []).filter((item) => hasText(item.title));
  if (items.length === 0) return null;

  const viewAllLabel = hasText(data.viewAllLabel)
    ? data.viewAllLabel.trim()
    : "View all upcoming events";
  const viewAllHref = hasText(data.viewAllHref) ? data.viewAllHref.trim() : "/events";

  return (
    <SectionShell>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
        Live on platform
      </p>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {hasText(data.title) ? (
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--mkt-ink)] sm:text-4xl">
              {data.title.trim()}
            </h2>
          ) : null}
          {hasText(data.body) ? (
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--mkt-muted)] sm:text-base">
              {data.body.trim()}
            </p>
          ) : null}
        </div>
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:text-[var(--mkt-accent)]"
        >
          {viewAllLabel} →
        </Link>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const href = hasText(item.href) ? item.href.trim() : `/events/${item.eventId}`;
          const cta = hasText(item.ctaLabel) ? item.ctaLabel.trim() : "Register";
          return (
            <li
              key={`${item.eventId || item.title}-${i}`}
              className="mkt-card flex flex-col overflow-hidden rounded-2xl transition hover:border-[var(--mkt-accent)]"
            >
              {hasText(item.imageUrl) ? (
                <div className="relative aspect-[16/10] bg-[var(--mkt-surface-low)]">
                  <Image
                    src={item.imageUrl.trim()}
                    alt={hasText(item.imageAlt) ? item.imageAlt.trim() : item.title.trim()}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 360px"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-[var(--mkt-accent-tint)]" />
              )}
              <div className="flex flex-1 flex-col p-5">
                {hasText(item.dateLabel) ? (
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--mkt-accent)]">
                    {item.dateLabel.trim()}
                  </p>
                ) : null}
                <h3 className="mt-2 font-display text-lg font-semibold text-[var(--mkt-ink)]">
                  {item.title.trim()}
                </h3>
                {hasText(item.location) ? (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-[var(--mkt-muted)]">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {item.location.trim()}
                  </p>
                ) : hasText(item.meta) ? (
                  <p className="mt-2 text-sm text-[var(--mkt-muted)]">{item.meta.trim()}</p>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  {hasText(item.priceLabel) ? (
                    <p className="text-sm font-semibold text-[var(--mkt-ink)]">
                      {item.priceLabel.trim()}
                    </p>
                  ) : (
                    <span />
                  )}
                  <Link
                    href={href}
                    className="mkt-btn inline-flex h-9 items-center rounded-xl px-3.5 text-sm font-semibold transition"
                  >
                    {cta}
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

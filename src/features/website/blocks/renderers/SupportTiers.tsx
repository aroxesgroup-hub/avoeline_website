import Link from "next/link";
import type { BlockDataMap } from "../schemas";
import { SectionShell, SectionTitle, hasText } from "./shared";

export function SupportTiersRenderer({ data }: { data: BlockDataMap["support_tiers"] }) {
  const items = (data.items ?? []).filter((item) => hasText(item.title));
  if (items.length === 0) return null;

  return (
    <SectionShell>
      <SectionTitle title={data.title} body={data.body} />
      <ul className="grid gap-5 md:grid-cols-3">
        {items.map((item, i) => {
          const topic = (item.topicKey ?? "").trim() || "general";
          const href = `/contact?topic=${encodeURIComponent(topic)}#contact-desk`;
          const email = (item.email ?? "").trim();
          return (
            <li key={`${item.title}-${i}`} className="mkt-card flex flex-col rounded-2xl p-6">
              {hasText(item.icon) ? (
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mkt-accent-tint)] text-xs font-bold uppercase tracking-wide text-[var(--mkt-accent-deep)]">
                  {item.icon.trim().slice(0, 2)}
                </span>
              ) : null}
              {hasText(item.badge) ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
                  {item.badge.trim()}
                </p>
              ) : null}
              <h3 className="mt-2 font-display text-xl font-semibold text-[var(--mkt-ink)]">
                {item.title.trim()}
              </h3>
              {hasText(item.body) ? (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--mkt-muted)]">
                  {item.body.trim()}
                </p>
              ) : null}
              <div className="mt-5 space-y-2 border-t border-[var(--mkt-line)] pt-4">
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="block text-sm font-semibold text-[var(--mkt-accent-deep)] underline-offset-2 hover:underline"
                  >
                    {email}
                  </a>
                ) : null}
                <Link
                  href={href}
                  className="inline-flex text-sm font-semibold text-[var(--mkt-ink)] transition hover:text-[var(--mkt-accent-deep)]"
                >
                  {(item.ctaLabel ?? "").trim() || "Select topic →"}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

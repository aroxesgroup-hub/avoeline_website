import Image from "next/image";
import Link from "next/link";
import type { BlockDataMap } from "../schemas";
import { SectionShell, SectionTitle, hasText } from "./shared";

export function AudienceTabsRenderer({ data }: { data: BlockDataMap["audience_tabs"] }) {
  const tabs = (data.tabs ?? []).filter((tab) => hasText(tab.title));
  if (tabs.length === 0) return null;

  const gateway = tabs.some((t) => hasText(t.imageUrl) || hasText(t.ctaHref));

  return (
    <SectionShell>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
        {gateway ? "Collaboration paths" : "Targeted experiences"}
      </p>
      <SectionTitle title={data.title} body={data.body} />
      <div className={`grid gap-5 ${gateway ? "lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {tabs.map((tab, i) => {
          const bullets = (tab.bullets ?? []).filter(hasText);
          const showCta = hasText(tab.ctaHref) && hasText(tab.ctaLabel);
          return (
            <div
              key={`${tab.title}-${i}`}
              className="mkt-card flex flex-col overflow-hidden rounded-2xl transition hover:border-[var(--mkt-accent)]"
            >
              {!gateway || !hasText(tab.imageUrl) ? (
                <div className="px-6 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mkt-accent-tint)] font-display text-sm font-bold text-[var(--mkt-accent-deep)]">
                    {hasText(tab.icon) ? tab.icon.trim().slice(0, 2).toUpperCase() : String(i + 1)}
                  </div>
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold text-[var(--mkt-ink)]">
                  {tab.title.trim()}
                </h3>
                {hasText(tab.body) ? (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--mkt-muted)]">
                    {tab.body.trim()}
                  </p>
                ) : null}
                {bullets.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-sm text-[var(--mkt-muted)]">
                    {bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mkt-accent)]" />
                        <span>{b.trim()}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {hasText(tab.imageUrl) ? (
                  <div className="relative mt-5 aspect-[16/10] w-full overflow-hidden rounded-xl bg-[var(--mkt-surface)]">
                    <Image
                      src={tab.imageUrl.trim()}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}

                {showCta ? (
                  <Link
                    href={tab.ctaHref!.trim()}
                    className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--mkt-accent-tint)] px-4 text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:bg-[var(--mkt-accent-soft)]"
                  >
                    {tab.ctaLabel!.trim()}
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

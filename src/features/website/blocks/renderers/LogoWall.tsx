import Image from "next/image";
import type { BlockDataMap } from "../schemas";
import { SectionShell, SectionTitle, hasText } from "./shared";

export function LogoWallRenderer({ data }: { data: BlockDataMap["logo_wall"] }) {
  const items = (data.items ?? []).filter((item) => hasText(item.name) || hasText(item.logoUrl));
  if (items.length === 0) return null;

  return (
    <SectionShell>
      <SectionTitle title={data.title || "Verified partners & campus ecosystem"} body={data.body} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const body = (
            <div className="mkt-card flex h-full flex-col rounded-2xl p-5 transition hover:border-[var(--mkt-accent)]">
              <div className="flex h-12 items-center">
                {hasText(item.logoUrl) ? (
                  <Image
                    src={item.logoUrl.trim()}
                    alt={
                      hasText(item.alt)
                        ? item.alt.trim()
                        : hasText(item.name)
                          ? item.name.trim()
                          : ""
                    }
                    width={160}
                    height={48}
                    className="h-10 w-auto max-w-[160px] object-contain"
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mkt-accent-tint)] text-sm font-bold text-[var(--mkt-accent-deep)]">
                    {(item.name || "?").trim().slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              {hasText(item.name) ? (
                <p className="mt-3 font-display text-base font-semibold text-[var(--mkt-ink)]">
                  {item.name.trim()}
                </p>
              ) : null}
              {hasText(item.description) ? (
                <p className="mt-1 text-sm leading-relaxed text-[var(--mkt-muted)]">
                  {item.description.trim()}
                </p>
              ) : null}
            </div>
          );
          return (
            <li key={`${item.name}-${i}`}>
              {hasText(item.href) ? (
                <a
                  href={item.href.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {body}
                </a>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

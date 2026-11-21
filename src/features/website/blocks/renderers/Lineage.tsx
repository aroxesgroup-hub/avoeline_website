import type { BlockDataMap } from "../schemas";
import { SectionShell, hasText } from "./shared";

export function LineageRenderer({ data }: { data: BlockDataMap["lineage"] }) {
  const products = (data.products ?? []).filter((p) => hasText(p.name));
  const highlights = (data.highlights ?? []).filter(hasText);
  if (!hasText(data.title) && products.length === 0) return null;

  return (
    <SectionShell dark>
      {hasText(data.eyebrow) ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
          {data.eyebrow.trim()}
        </p>
      ) : null}
      {hasText(data.title) ? (
        <h2 className="max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {data.title.trim()}
        </h2>
      ) : null}
      {hasText(data.body) ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">{data.body.trim()}</p>
      ) : null}

      {products.length > 0 ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {products.map((p, i) => {
            const active = /active/i.test(p.status ?? "");
            return (
              <li
                key={`${p.name}-${i}`}
                className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-semibold text-white">{p.name.trim()}</h3>
                  {hasText(p.status) ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        active
                          ? "bg-[var(--mkt-accent-soft)] text-[var(--mkt-accent-deep)]"
                          : "bg-white/15 text-white/80"
                      }`}
                    >
                      {p.status!.trim()}
                    </span>
                  ) : null}
                </div>
                {hasText(p.description) ? (
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {p.description.trim()}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {highlights.length > 0 ? (
        <ul className="mt-8 flex flex-wrap gap-2">
          {highlights.map((h) => (
            <li
              key={h}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85"
            >
              {h.trim()}
            </li>
          ))}
        </ul>
      ) : null}
    </SectionShell>
  );
}

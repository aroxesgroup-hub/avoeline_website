import Link from "next/link";
import { Check } from "lucide-react";
import type { BlockDataMap } from "../schemas";
import { SectionShell, SectionTitle, hasText } from "./shared";

export function StepsRenderer({ data }: { data: BlockDataMap["steps"] }) {
  const items = (data.items ?? []).filter((item) => hasText(item.title));
  if (items.length === 0) return null;

  const panel = data.panel;
  const panelRows = (panel?.rows ?? []).filter((r) => hasText(r.label) || hasText(r.value));
  const showPanel = Boolean(panel && (hasText(panel.title) || panelRows.length > 0));
  const progress = Math.min(100, Math.max(0, Number(panel?.progressPercent) || 0));

  if (showPanel) {
    return (
      <SectionShell className="bg-[var(--mkt-surface-low)]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
              Trust protocol
            </p>
            <SectionTitle title={data.title} body={data.body} />
            <ul className="mt-2 space-y-4">
              {items.map((item, i) => (
                <li key={`${item.title}-${i}`} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mkt-accent-tint)] text-[var(--mkt-accent-deep)]">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--mkt-ink)]">{item.title.trim()}</p>
                    {hasText(item.body) ? (
                      <p className="mt-1 text-sm leading-relaxed text-[var(--mkt-muted)]">
                        {item.body.trim()}
                      </p>
                    ) : null}
                    {hasText(item.linkLabel) && hasText(item.href) ? (
                      <Link
                        href={item.href.trim()}
                        className="mt-2 inline-block text-sm font-semibold text-[var(--mkt-accent-deep)] hover:underline"
                      >
                        {item.linkLabel.trim()} →
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mkt-card rounded-2xl p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-[var(--mkt-ink)]">
                {hasText(panel?.title) ? panel!.title!.trim() : "Live example"}
              </h3>
              {hasText(panel?.badge) ? (
                <span className="rounded-full bg-[var(--mkt-accent-tint)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--mkt-accent-deep)]">
                  {panel!.badge!.trim()}
                </span>
              ) : null}
            </div>
            {progress > 0 || hasText(panel?.progressLabel) ? (
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-[var(--mkt-muted)]">
                  <span>
                    {hasText(panel?.progressLabel) ? panel!.progressLabel!.trim() : "Progress"}
                  </span>
                  <span className="font-semibold text-[var(--mkt-ink)]">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--mkt-surface)]">
                  <div
                    className="h-full rounded-full bg-[var(--mkt-accent)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}
            {panelRows.length > 0 ? (
              <ul className="mt-5 grid gap-3 sm:grid-cols-1">
                {panelRows.map((row, i) => (
                  <li
                    key={`${row.label}-${i}`}
                    className="rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-4 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--mkt-muted)]">
                      {hasText(row.label) ? row.label.trim() : "Metric"}
                    </p>
                    {hasText(row.value) ? (
                      <p className="mt-1 font-display text-xl font-semibold text-[var(--mkt-ink)]">
                        {row.value.trim()}
                      </p>
                    ) : null}
                    {hasText(row.hint) ? (
                      <p className="mt-0.5 text-xs text-[var(--mkt-muted)]">{row.hint.trim()}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {hasText(panel?.footer) ? (
              <p className="mt-5 rounded-lg bg-[var(--mkt-accent-tint)] px-3 py-2 text-xs font-medium text-[var(--mkt-accent-deep)]">
                {panel!.footer!.trim()}
              </p>
            ) : null}
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell className="bg-[var(--mkt-surface-low)]">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
        Seamless lifecycle
      </p>
      <SectionTitle title={data.title} body={data.body} />
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <li
            key={`${item.title}-${i}`}
            className="mkt-card flex flex-col rounded-2xl p-5 transition hover:border-[var(--mkt-accent)]"
          >
            <p className="font-display text-2xl font-semibold text-[var(--mkt-accent)]">
              {hasText(item.icon) ? item.icon.trim() : String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold text-[var(--mkt-ink)]">
              {item.title.trim()}
            </h3>
            {hasText(item.body) ? (
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--mkt-muted)]">
                {item.body.trim()}
              </p>
            ) : null}
            {hasText(item.linkLabel) && hasText(item.href) ? (
              <Link
                href={item.href.trim()}
                className="mt-4 text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:text-[var(--mkt-accent)]"
              >
                {item.linkLabel.trim()} →
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

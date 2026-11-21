import type { BlockDataMap } from "../schemas";
import { hasText } from "./shared";

type Command = NonNullable<BlockDataMap["hero"]["command"]>;

/**
 * CMS-driven Live Event Dashboard mock for the marketing hero.
 */
export function HeroCommandPanel({ command }: { command: Command }) {
  const title = hasText(command.title) ? command.title.trim() : "Live Event Dashboard";
  const eventName = hasText(command.eventName) ? command.eventName.trim() : "";
  const badge = hasText(command.badge) ? command.badge.trim() : "LIVE";
  const stats = (command.stats ?? []).filter((s) => hasText(s.label) || hasText(s.value));
  const activity = (command.activity ?? []).filter((a) => hasText(a.text));
  const pct = Math.max(0, Math.min(100, Number(command.capacityPercent) || 0));

  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(70%_60%_at_70%_30%,color-mix(in_srgb,var(--mkt-accent)_22%,transparent),transparent_70%)]"
      />
      <div className="mkt-card relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mkt-accent)] opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--mkt-accent)]" />
              </span>
              <h3 className="font-display text-base font-semibold tracking-tight text-[var(--mkt-ink)]">
                {title}
              </h3>
            </div>
            {eventName ? (
              <p className="mt-1 truncate text-sm text-[var(--mkt-muted)]">{eventName}</p>
            ) : null}
          </div>
          {badge ? (
            <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--mkt-accent)_18%,transparent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--mkt-accent-deep)]">
              {badge}
            </span>
          ) : null}
        </div>

        {stats.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {stats.map((stat) => (
              <div
                key={`${stat.label}-${stat.value}`}
                className="rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-3 py-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mkt-muted)]">
                  {stat.label?.trim() || "—"}
                </p>
                <p className="mt-1 font-display text-xl font-semibold tracking-tight text-[var(--mkt-ink)]">
                  {stat.value?.trim() || "—"}
                </p>
                {hasText(stat.hint) ? (
                  <p className="mt-0.5 text-[11px] text-[var(--mkt-accent-deep)]">
                    {stat.hint.trim()}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {hasText(command.capacityLabel) || hasText(command.capacityValue) ? (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="font-medium text-[var(--mkt-ink)]">
                {command.capacityLabel?.trim() || "Capacity"}
              </p>
              {hasText(command.capacityValue) ? (
                <p className="text-[var(--mkt-muted)]">{command.capacityValue.trim()}</p>
              ) : null}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--mkt-surface-low)]">
              <div
                className="h-full rounded-full bg-[var(--mkt-accent-deep)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : null}

        {activity.length > 0 ? (
          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mkt-muted)]">
              Live logs
            </p>
            <ul className="mt-2 max-h-36 space-y-2 overflow-hidden">
              {activity.map((row) => (
                <li
                  key={`${row.text}-${row.time}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-3 py-2"
                >
                  <span className="truncate text-sm text-[var(--mkt-ink)]">{row.text.trim()}</span>
                  {hasText(row.time) ? (
                    <span className="shrink-0 text-xs text-[var(--mkt-muted)]">
                      {row.time.trim()}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {hasText(command.footerNote) ? (
          <p className="mt-4 text-center text-[11px] italic text-[var(--mkt-muted)]">
            {command.footerNote.trim()}
          </p>
        ) : null}
      </div>
    </div>
  );
}

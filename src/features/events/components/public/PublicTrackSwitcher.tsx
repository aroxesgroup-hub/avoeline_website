"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicCompetition } from "@/src/features/events/types";

function formatMoney(amount: number, currency: string): string {
  if (!amount) return "Free";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "PKR"} ${amount}`;
  }
}

/** Tabbed multi-track panel for hackathon public pages (DTO-only). */
export function PublicTrackSwitcher({
  eventId,
  competitions,
  qsSuffix = "",
  initialTrackId = null,
}: {
  eventId: string;
  competitions: PublicCompetition[];
  qsSuffix?: string;
  initialTrackId?: string | null;
}) {
  const initial = useMemo(() => {
    if (initialTrackId && competitions.some((c) => c.id === initialTrackId)) {
      return initialTrackId;
    }
    return competitions[0]?.id ?? "";
  }, [competitions, initialTrackId]);

  const [activeId, setActiveId] = useState(initial);
  const active = competitions.find((c) => c.id === activeId) ?? competitions[0];
  if (!competitions.length || !active) return null;

  const registerHref = `#register`;
  const detailHref = `/events/${eventId}/tracks/${active.id}${qsSuffix}`;
  const rulesLines = (active.rulesText || "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <section id="tracks" className="scroll-mt-24 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
            Competitions
          </p>
          <h2 className="mt-1 font-display text-xl text-[var(--mkt-ink)] sm:text-2xl">
            {competitions.length} autonomous specialized track
            {competitions.length === 1 ? "" : "s"}
          </h2>
        </div>
        <Link
          href={`/events/${eventId}/tracks${qsSuffix}`}
          className="rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-3 py-1.5 text-xs font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)]"
        >
          Full track list
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Competition tracks"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {competitions.map((track) => {
          const selected = track.id === active.id;
          return (
            <button
              key={track.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(track.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-[var(--mkt-accent-deep)] text-white"
                  : "border border-[var(--mkt-line)] bg-[var(--mkt-panel)] text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]"
              }`}
            >
              {track.name}
            </button>
          );
        })}
      </div>

      <article role="tabpanel" className="mkt-card overflow-hidden rounded-3xl">
        {active.imageUrl ? (
          <div className="relative aspect-[21/9] w-full bg-[var(--mkt-surface-low)]">
            <Image
              src={active.imageUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain object-center"
            />
          </div>
        ) : null}

        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--mkt-accent-tint)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--mkt-accent-deep)]">
              Team {active.minTeamSize}–{active.maxTeamSize} members
            </span>
            {active.prizePool ? (
              <span className="rounded-full border border-[var(--mkt-line)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--mkt-ink)]">
                Prize: {active.prizePool}
              </span>
            ) : null}
            <span className="rounded-full border border-[var(--mkt-line)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--mkt-muted)]">
              {formatMoney(active.due || active.fee, active.currency)}
            </span>
          </div>

          <div>
            <h3 className="font-display text-2xl tracking-tight text-[var(--mkt-ink)]">
              {active.name}
            </h3>
            {active.description ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--mkt-muted)]">
                {active.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-[var(--mkt-ink)]">
                Rules &amp; evaluation
              </h4>
              {rulesLines.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--mkt-muted)]">
                  {rulesLines.map((line) => (
                    <li key={line.slice(0, 48)}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[var(--mkt-muted)]">
                  Full rules are available on the track page.
                </p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--mkt-ink)]">
                Prizes &amp; deadlines
              </h4>
              {active.prizes.length ? (
                <ul className="mt-2 space-y-1.5 text-sm text-[var(--mkt-muted)]">
                  {active.prizes.slice(0, 5).map((p) => (
                    <li key={`${p.positionLabel}-${p.amount}`}>
                      <span className="font-medium text-[var(--mkt-ink)]">{p.positionLabel}</span>
                      {p.amount ? ` — ${p.amount}` : null}
                      {p.description ? `: ${p.description}` : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[var(--mkt-muted)]">
                  {active.prizePool || "Prize details announced by the organizer."}
                </p>
              )}
              {active.effectiveRegistrationClosesAt ? (
                <p className="mt-3 text-xs text-[var(--mkt-muted)]">
                  Registration closes{" "}
                  {new Date(active.effectiveRegistrationClosesAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {active.closeInherited ? " (event deadline)" : null}
                </p>
              ) : null}
              {active.submissionDeadline ? (
                <p className="mt-1 text-xs text-[var(--mkt-muted)]">
                  Submission deadline{" "}
                  {new Date(active.submissionDeadline).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href={`${registerHref}?track=${encodeURIComponent(active.id)}`}
              className="mkt-btn rounded-xl px-5 py-2.5 text-sm font-semibold"
              onClick={(e) => {
                // Prefer hash + query so sticky form can pick track; fall back to hash only.
                e.preventDefault();
                const url = new URL(window.location.href);
                url.hash = "register";
                url.searchParams.set("track", active.id);
                window.history.replaceState({}, "", url.toString());
                document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
                window.dispatchEvent(
                  new CustomEvent("avoeline:select-track", { detail: { trackId: active.id } }),
                );
              }}
            >
              Apply for {active.name}
            </a>
            <Link
              href={detailHref}
              className="rounded-xl border border-[var(--mkt-line)] px-5 py-2.5 text-sm font-semibold text-[var(--mkt-ink)]"
            >
              Track details
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

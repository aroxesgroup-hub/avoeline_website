"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/src/shared_components/ui/StatusBadge";
import type { PublicEventDto } from "@/src/features/events/types";
import { PublicShareMenu } from "./PublicShareMenu";
import { PublicCalendarMenu } from "./PublicCalendarMenu";
import { lifecycleLabel } from "./publicPage.logic";

/**
 * Banner uses object-contain (no edge crop) + meta below: breadcrumbs, badge, title, share/calendar.
 */
export function PublicEventHero({ dto, preview }: { dto: PublicEventDto; preview: boolean }) {
  const statusLabel = lifecycleLabel(dto.lifecycle, preview);
  const category = dto.categoryLabel?.trim() || null;
  const curatedBadge =
    category ||
    dto.tags.find((t) => /summit|conference|academic|industry/i.test(t)) ||
    dto.tags[0] ||
    null;

  return (
    <header className="border-b border-[var(--mkt-line)] bg-[var(--mkt-canvas)]">
      <div className="relative w-full overflow-hidden bg-[var(--mkt-surface-low)]">
        <div className="relative aspect-video w-full md:aspect-[21/9]">
          {dto.bannerImage ? (
            <Image
              src={dto.bannerImage}
              alt={dto.title ? `${dto.title} banner` : "Event banner"}
              fill
              priority
              sizes="100vw"
              className="object-contain object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--mkt-surface)] via-[var(--mkt-panel)] to-[var(--mkt-accent-tint)]" />
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-6 w-full max-w-[var(--mkt-max,80rem)] px-6 sm:-mt-8 lg:px-10">
        <div className="mkt-card rounded-2xl px-4 py-6 shadow-[0_16px_40px_-28px_rgba(8,31,31,0.45)] sm:px-6 sm:py-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-[var(--mkt-muted)]">
              <li className="flex items-center gap-1">
                <Link
                  href="/events"
                  className="rounded-sm transition hover:text-[var(--mkt-ink)] focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Events
                </Link>
              </li>
              {category ? (
                <li className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
                  <Link
                    href={`/events?category=${encodeURIComponent(category)}`}
                    className="rounded-sm transition hover:text-[var(--mkt-ink)]"
                  >
                    {category}
                  </Link>
                </li>
              ) : null}
              <li className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
                <span className="font-medium text-[var(--mkt-ink)]" aria-current="page">
                  {dto.title}
                </span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={preview ? "unpublished" : dto.lifecycle}
              label={statusLabel}
              size="sm"
              marker="dot"
            />
            {curatedBadge ? (
              <span className="rounded-full bg-[var(--mkt-accent-tint)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--mkt-accent-deep)]">
                {curatedBadge}
              </span>
            ) : null}
            {dto.tags
              .filter((t) => t !== curatedBadge)
              .slice(0, 3)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-surface-low)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--mkt-muted)]"
                >
                  {tag}
                </span>
              ))}
          </div>

          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold text-[var(--mkt-ink)] sm:text-4xl md:text-5xl">
            {dto.title}
          </h1>

          {dto.shortDescription ? (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--mkt-muted)] sm:text-lg">
              {dto.shortDescription}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!preview &&
            dto.registration.canRegister &&
            dto.registration.state !== "closed" &&
            dto.registration.state !== "full" ? (
              <a href="#register" className="mkt-btn rounded-xl px-5 py-2.5 text-sm font-semibold">
                {dto.isHackathon ? "Register team" : "Register"}
              </a>
            ) : null}
            {dto.isHackathon && dto.competitions.length ? (
              <a
                href="#tracks"
                className="rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-5 py-2.5 text-sm font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)]"
              >
                Explore {dto.competitions.length} track
                {dto.competitions.length === 1 ? "" : "s"}
              </a>
            ) : (
              <a
                href="#gallery"
                className="rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-5 py-2.5 text-sm font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)]"
              >
                View gallery
              </a>
            )}
            {dto.registration.state === "closing_soon" ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                Closing soon
              </span>
            ) : null}
            <OrganizerChip name={dto.organizerChip.name} logoUrl={dto.organizerChip.logoUrl} />
            <PublicCalendarMenu dto={dto} preview={preview} />
            <PublicShareMenu sharePath={dto.sharePath} title={dto.title} />
          </div>
        </div>
      </div>
    </header>
  );
}

function OrganizerChip({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-surface-low)] px-2.5 py-1.5 text-sm text-[var(--mkt-ink)]">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mkt-accent-tint)] text-[10px] font-bold text-[var(--mkt-accent-deep)]">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="font-medium">{name}</span>
    </div>
  );
}

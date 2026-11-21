import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatDateMedium } from "@/src/lib/datetime";
import type { BrowseEventCard } from "../../browse.service";
import { EventsBrowseMedia } from "./EventsBrowseMedia";

function formatLabel(format: string): string {
  const f = format.toLowerCase();
  if (f === "online" || f === "virtual") return "Online";
  if (f === "hybrid") return "Hybrid";
  if (f === "physical" || f === "onsite" || f === "on-site") return "On-site";
  return format || "Event";
}

function slotsLabel(card: BrowseEventCard): string | null {
  if (card.availableSeats == null) return null;
  if (card.availableSeats <= 0) return "Waitlist open";
  if (card.availableSeats <= 25) return `${card.availableSeats} slots remaining`;
  return null;
}

export function EventsBrowseCard({ event }: { event: BrowseEventCard }) {
  const place =
    [event.venueName, event.city].filter(Boolean).join(", ") || formatLabel(event.format);
  const slots = slotsLabel(event);

  return (
    <article className="mkt-card flex h-full flex-col overflow-hidden rounded-2xl">
      <Link href={event.href} className="relative block">
        <EventsBrowseMedia
          title={event.title}
          imageUrl={event.imageUrl}
          category={event.category}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {event.eventType ? (
            <span className="rounded-md bg-[var(--mkt-accent-deep)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {event.eventType}
            </span>
          ) : null}
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              event.isPaid
                ? "bg-[var(--mkt-panel)] text-[var(--mkt-ink)]"
                : "bg-[var(--mkt-accent-tint)] text-[var(--mkt-accent-deep)]"
            }`}
          >
            {event.isPaid ? "Paid" : "Free"}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-[var(--mkt-muted)]">
          {formatDateMedium(event.startDate)}
          {place ? (
            <>
              {" · "}
              <span className="inline-flex items-center gap-1">
                <MapPin className="inline h-3 w-3" aria-hidden="true" />
                {place}
              </span>
            </>
          ) : null}
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-[var(--mkt-ink)]">
          <Link href={event.href} className="hover:text-[var(--mkt-accent-deep)]">
            {event.title}
          </Link>
        </h3>
        {event.shortDescription ? (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--mkt-muted)]">
            {event.shortDescription}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.category ? (
            <span className="rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--mkt-muted)]">
              {event.category}
            </span>
          ) : null}
          {event.eventType && event.eventType !== event.category ? (
            <span className="rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--mkt-muted)]">
              {event.eventType}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-[var(--mkt-ink)]">{event.priceLabel}</p>
            {slots ? <p className="text-xs text-[var(--mkt-muted)]">{slots}</p> : null}
          </div>
          <Link
            href={event.href}
            className="inline-flex h-9 shrink-0 items-center rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-3.5 text-sm font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)] hover:bg-[var(--mkt-accent-tint)]"
          >
            Register
          </Link>
        </div>
      </div>
    </article>
  );
}

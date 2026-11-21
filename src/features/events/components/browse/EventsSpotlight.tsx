import Link from "next/link";
import { CalendarDays, MapPin, QrCode, ShieldCheck, Users } from "lucide-react";
import { formatDateMedium } from "@/src/lib/datetime";
import type { BrowseEventCard } from "../../browse.service";
import { EventsBrowseMedia } from "./EventsBrowseMedia";

export function EventsSpotlight({ event }: { event: BrowseEventCard }) {
  const place = [event.venueName, event.city].filter(Boolean).join(", ") || "Location TBA";

  return (
    <section className="overflow-hidden rounded-3xl bg-[var(--mkt-accent-deep)] text-white shadow-[var(--mkt-card-shadow)]">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[220px] lg:min-h-full">
          <EventsBrowseMedia
            title={event.title}
            imageUrl={event.imageUrl}
            category={event.category}
            className="h-full min-h-[220px] rounded-none lg:absolute lg:inset-0 lg:aspect-auto"
            priority
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              Spotlight event
            </span>
            {event.websiteFeatured ? (
              <span className="rounded-full bg-[var(--mkt-accent-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-accent-deep)]">
                Featured
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {event.title}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
            <li className="inline-flex items-center gap-1.5">
              <CalendarDays
                className="h-4 w-4 shrink-0 text-[var(--mkt-accent-soft)]"
                aria-hidden
              />
              {formatDateMedium(event.startDate)}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--mkt-accent-soft)]" aria-hidden />
              {place}
            </li>
            <li className="inline-flex items-center gap-1.5 font-semibold text-white">
              From {event.priceLabel}
            </li>
          </ul>
          {event.shortDescription ? (
            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/70">
              {event.shortDescription}
            </p>
          ) : null}
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/75">
            <li className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden />
              Open registration
            </li>
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Verifiable certificates
            </li>
            <li className="inline-flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5" aria-hidden />
              Instant QR check-in
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={event.href}
              className="inline-flex h-11 items-center rounded-xl bg-[var(--mkt-accent-soft)] px-5 text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:bg-white"
            >
              Register Now →
            </Link>
            <Link
              href={`${event.href}#agenda`}
              className="inline-flex h-11 items-center rounded-xl border border-white/35 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              View Schedule
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

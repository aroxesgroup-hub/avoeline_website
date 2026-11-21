import Link from "next/link";
import { CalendarSearch } from "lucide-react";
import { EmptyState } from "@/src/shared_components/ui/EmptyState";
import { getEventsDirectory } from "@/src/features/events/browse.service";
import { parseBrowseFilters, eventsBrowseHref } from "@/src/features/events/browseFilters";
import { EventsBrowseToolbar } from "@/src/features/events/components/browse/EventsBrowseToolbar";
import { EventsSpotlight } from "@/src/features/events/components/browse/EventsSpotlight";
import { EventsBrowseCard } from "@/src/features/events/components/browse/EventsBrowseCard";
import { EventsBrowseCtas } from "@/src/features/events/components/browse/EventsBrowseCtas";

export const metadata = {
  title: "Discover events — Avoeline",
  description: "Find conferences, hackathons, and campus events on Avoeline.",
};

/**
 * Public events discovery — live catalog + URL filters (no mock events).
 */
export default async function BrowseEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseBrowseFilters(sp);
  const { events, spotlight, facets, total } = await getEventsDirectory(filters);
  const hasActiveFilters = Boolean(
    filters.q ||
    (filters.city && filters.city !== "all") ||
    (filters.category && filters.category !== "all") ||
    (filters.when && filters.when !== "upcoming") ||
    (filters.price && filters.price !== "all"),
  );

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pb-6 pt-14 lg:px-10 lg:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_0%,color-mix(in_srgb,var(--mkt-surface)_100%,transparent),transparent_70%)]" />
        <div className="relative mx-auto flex max-w-[var(--mkt-max,80rem)] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-accent-tint)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-accent-deep)]">
                Live discovery portal
              </span>
              <span className="rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-muted)]">
                Open schedule
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--mkt-ink)] sm:text-4xl lg:text-5xl">
              Discover conferences, hackathons, and campus events.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--mkt-muted)]">
              Register for experiences on Avoeline, or sign in later to collect tickets and
              certificates.
            </p>
          </div>
          <p className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-4 py-2 text-sm font-semibold text-[var(--mkt-ink)] shadow-[var(--mkt-card-shadow)] lg:self-auto">
            <span className="h-2 w-2 rounded-full bg-[var(--mkt-accent)]" aria-hidden />
            {total} verified event{total === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <section className="px-6 pb-10 lg:px-10">
        <div className="mx-auto max-w-[var(--mkt-max,80rem)]">
          <EventsBrowseToolbar
            filters={filters}
            cities={facets.cities}
            categories={facets.categories}
          />
        </div>
      </section>

      {spotlight ? (
        <section className="px-6 pb-12 lg:px-10">
          <div className="mx-auto max-w-[var(--mkt-max,80rem)]">
            <EventsSpotlight event={spotlight} />
          </div>
        </section>
      ) : null}

      <section className="px-6 pb-14 lg:px-10">
        <div className="mx-auto max-w-[var(--mkt-max,80rem)]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--mkt-ink)]">
                Upcoming community &amp; institutional events
              </h2>
              <p className="mt-1 text-sm text-[var(--mkt-muted)]">
                {events.length === 0 && !spotlight
                  ? "No matches for these filters."
                  : `${events.length} event${events.length === 1 ? "" : "s"}${
                      filters.q ? ` matching “${filters.q}”` : ""
                    }`}
              </p>
            </div>
            {hasActiveFilters ? (
              <Link
                href="/events"
                className="text-sm font-semibold text-[var(--mkt-accent-deep)] hover:underline"
              >
                Clear filters
              </Link>
            ) : null}
          </div>

          {events.length === 0 && !spotlight ? (
            <EmptyState
              icon={<CalendarSearch size={28} />}
              title={
                hasActiveFilters ? "Nothing matches these filters" : "No events are open just now"
              }
              description={
                hasActiveFilters
                  ? "Try another city, category, or clear filters to see everything that is open."
                  : "Check back soon — new events are published regularly."
              }
              action={
                hasActiveFilters ? (
                  <Link
                    href={eventsBrowseHref({})}
                    className="inline-flex h-10 items-center rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-4 text-sm font-semibold text-[var(--mkt-ink)]"
                  >
                    Clear filters
                  </Link>
                ) : undefined
              }
            />
          ) : events.length === 0 ? (
            <p className="text-sm text-[var(--mkt-muted)]">
              Spotlight is the only match — try clearing a filter to see more events.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <li key={event.id}>
                  <EventsBrowseCard event={event} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="border-t border-[var(--mkt-line)] bg-[var(--mkt-surface-low)] px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-[var(--mkt-max,80rem)]">
          <EventsBrowseCtas />
        </div>
      </section>
    </main>
  );
}

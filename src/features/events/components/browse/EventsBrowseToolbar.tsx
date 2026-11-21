import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import type { BrowseFilters } from "../../browse.service";
import { eventsBrowseHref } from "../../browseFilters";

const WHEN_OPTS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "weekend", label: "This Weekend" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All" },
] as const;

const PRICE_OPTS = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
] as const;

export function EventsBrowseToolbar({
  filters,
  cities,
  categories,
}: {
  filters: BrowseFilters;
  cities: string[];
  categories: string[];
}) {
  const when = filters.when || "upcoming";
  const price = filters.price || "all";
  const category = filters.category || "all";
  const city = filters.city || "all";

  return (
    <div className="mkt-card rounded-2xl p-4 sm:p-5">
      <form action="/events" method="get" className="flex flex-col gap-3 lg:flex-row lg:items-end">
        {when !== "upcoming" ? <input type="hidden" name="when" value={when} /> : null}
        {price !== "all" ? <input type="hidden" name="price" value={price} /> : null}
        {category !== "all" ? <input type="hidden" name="category" value={category} /> : null}

        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--mkt-muted)]">
            Search
          </span>
          <span className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mkt-muted)]"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={filters.q || ""}
              placeholder="Search by event name, topic, or university…"
              className="h-11 w-full rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] pl-10 pr-3 text-sm text-[var(--mkt-ink)] outline-none ring-[var(--mkt-accent)] placeholder:text-[var(--mkt-muted)] focus:ring-2"
            />
          </span>
        </label>

        <label className="flex w-full flex-col gap-1.5 lg:w-56">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--mkt-muted)]">
            Location
          </span>
          <span className="relative">
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mkt-muted)]"
              aria-hidden
            />
            <select
              name="city"
              defaultValue={city}
              className="h-11 w-full appearance-none rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] pl-10 pr-8 text-sm text-[var(--mkt-ink)] outline-none ring-[var(--mkt-accent)] focus:ring-2"
            >
              <option value="all">All cities (Pakistan &amp; Remote)</option>
              <option value="remote">Remote / Online</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button
          type="submit"
          className="mkt-btn inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
        >
          Apply
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-3 border-t border-[var(--mkt-line)] pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="list" aria-label="Categories">
          <FilterPill
            href={eventsBrowseHref(filters, { category: undefined })}
            active={!filters.category || filters.category === "all"}
            label="All"
          />
          {categories.map((c) => (
            <FilterPill
              key={c}
              href={eventsBrowseHref(filters, { category: c })}
              active={category.toLowerCase() === c.toLowerCase()}
              label={c}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-panel)] p-1">
            {WHEN_OPTS.map((opt) => (
              <FilterPill
                key={opt.value}
                href={eventsBrowseHref(filters, {
                  when: opt.value === "upcoming" ? undefined : opt.value,
                })}
                active={when === opt.value}
                label={opt.label}
                compact
              />
            ))}
          </div>
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-panel)] p-1">
            {PRICE_OPTS.map((opt) => (
              <FilterPill
                key={opt.value}
                href={eventsBrowseHref(filters, {
                  price: opt.value === "all" ? undefined : opt.value,
                })}
                active={price === opt.value}
                label={opt.label}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
  compact,
}: {
  href: string;
  active: boolean;
  label: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full text-sm font-semibold transition ${
        compact ? "px-3 py-1.5" : "px-3.5 py-1.5"
      } ${
        active
          ? "bg-[var(--mkt-btn)] text-[var(--mkt-btn-fg)]"
          : "text-[var(--mkt-muted)] hover:bg-[var(--mkt-accent-tint)] hover:text-[var(--mkt-ink)]"
      }`}
      aria-current={active ? "true" : undefined}
    >
      {label}
    </Link>
  );
}

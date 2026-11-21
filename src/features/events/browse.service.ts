import { cache } from "react";
import { TABLES } from "@/data/collections";
import { MEDIA_BUCKET, supabaseAdmin } from "@/data/supabase";
import { UserService } from "@/src/services/user.service";
import { EventModel } from "@/src/services/models/event.model";
import { eventLifecycle, isActiveLifecycle } from "@/src/lib/eventState";
import { matchesQuery, normalizeQuery } from "@/src/lib/search";
import { parseScheduleDateTime } from "@/src/lib/datetime";
import { formatCurrency } from "@/src/lib/money";
import { isListedPublicly } from "@/src/features/access/access.service";
import { isPaidEvent, ticketFor } from "@/src/features/registration/registration.service";

export type BrowseWhen = "upcoming" | "weekend" | "month" | "all";
export type BrowsePrice = "all" | "free" | "paid";

export type BrowseFilters = {
  q?: string;
  city?: string;
  category?: string;
  when?: BrowseWhen;
  price?: BrowsePrice;
};

export type BrowseEventCard = {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  eventType: string;
  format: string;
  startDate: string | null;
  startTime: string | null;
  city: string;
  venueName: string;
  imageUrl: string;
  priceLabel: string;
  isPaid: boolean;
  href: string;
  websiteFeatured: boolean;
  availableSeats: number | null;
  capacityTotal: number | null;
};

export type BrowseDirectory = {
  events: BrowseEventCard[];
  spotlight: BrowseEventCard | null;
  facets: { cities: string[]; categories: string[] };
  total: number;
};

function publicStorageUrl(path: string | null | undefined): string {
  const p = String(path ?? "").trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const { data } = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(p);
  return data.publicUrl;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Saturday–Sunday of the current calendar week (local). */
function thisWeekendRange(now = new Date()): { start: Date; end: Date } {
  const day = now.getDay(); // 0 Sun … 6 Sat
  const toSat = day === 0 ? -1 : 6 - day;
  const sat = new Date(now);
  sat.setDate(now.getDate() + toSat);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  return { start: startOfDay(sat), end: endOfDay(sun) };
}

function eventStart(event: EventModel): Date | null {
  return parseScheduleDateTime(event.schedule?.startDate, event.schedule?.startTime);
}

function matchesWhen(event: EventModel, when: BrowseWhen, now = new Date()): boolean {
  if (when === "all") return true;
  const start = eventStart(event);
  const life = eventLifecycle(event.status, event.schedule, now);
  if (when === "upcoming") {
    return life === "upcoming" || life === "ongoing" || life === "published";
  }
  if (!start) return false;
  if (when === "weekend") {
    const { start: w0, end: w1 } = thisWeekendRange(now);
    return start >= w0 && start <= w1;
  }
  if (when === "month") {
    return start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
  }
  return true;
}

function toCard(event: EventModel, websiteFeatured: boolean): BrowseEventCard {
  const { price } = ticketFor(event);
  const seats = event.capacity?.availableSeats;
  const total = event.capacity?.totalSeats;
  return {
    id: event.id,
    title: event.title,
    shortDescription: event.shortDescription || "",
    category: event.category || "",
    eventType: event.eventType || "",
    format: String(event.format || ""),
    startDate: event.schedule?.startDate ? String(event.schedule.startDate) : null,
    startTime: event.schedule?.startTime ? String(event.schedule.startTime) : null,
    city: event.location?.city ? String(event.location.city) : "",
    venueName: event.location?.venueName ? String(event.location.venueName) : "",
    imageUrl: publicStorageUrl(event.bannerImage),
    priceLabel:
      price > 0 ? formatCurrency(price, event.pricing?.currency || "PKR", "Free") : "Free",
    isPaid: isPaidEvent(event),
    href: `/events/${event.id}`,
    websiteFeatured,
    availableSeats: typeof seats === "number" ? seats : null,
    capacityTotal: typeof total === "number" ? total : null,
  };
}

type ListedRow = { event: EventModel; websiteFeatured: boolean };

async function loadListedEvents(): Promise<ListedRow[]> {
  const [{ data }, suspended] = await Promise.all([
    supabaseAdmin
      .from(TABLES.EVENTS)
      .select("*")
      .is("deleted_at", null)
      .is("archived_at", null)
      .eq("is_demo", false),
    UserService.suspendedOrganizerIds(),
  ]);

  return (data ?? [])
    .map((d) => {
      const event = EventModel.fromJson({ ...d, eventId: d.id });
      return {
        event,
        websiteFeatured: Boolean((d as { website_featured?: boolean }).website_featured),
      };
    })
    .filter(({ event }) => !suspended.has(String(event.organizerId)))
    .filter(({ event }) => isActiveLifecycle(eventLifecycle(event.status, event.schedule)))
    .filter(({ event }) => isListedPublicly(event));
}

function applyFilters(rows: ListedRow[], filters: BrowseFilters): ListedRow[] {
  const q = normalizeQuery(filters.q);
  const city = String(filters.city || "")
    .trim()
    .toLowerCase();
  const category = String(filters.category || "")
    .trim()
    .toLowerCase();
  const when: BrowseWhen = filters.when || "upcoming";
  const price: BrowsePrice = filters.price || "all";

  return rows.filter(({ event }) => {
    if (!matchesWhen(event, when)) return false;
    if (price === "free" && isPaidEvent(event)) return false;
    if (price === "paid" && !isPaidEvent(event)) return false;
    if (city === "remote") {
      const fmt = String(event.format || "").toLowerCase();
      const c = String(event.location?.city || "").toLowerCase();
      if (!(fmt === "online" || fmt === "virtual" || c === "remote" || c === "online")) {
        return false;
      }
    } else if (city && city !== "all") {
      if (String(event.location?.city || "").toLowerCase() !== city) return false;
    }
    if (category && category !== "all") {
      if (String(event.category || "").toLowerCase() !== category) return false;
    }
    if (q) {
      if (
        !matchesQuery(q, [
          event.title,
          event.shortDescription,
          event.description,
          event.category,
          event.eventType,
          event.location?.city,
          event.location?.venueName,
          String(event.format || ""),
        ])
      ) {
        return false;
      }
    }
    return true;
  });
}

function sortByStart(rows: ListedRow[]): ListedRow[] {
  return [...rows].sort((a, b) => {
    const feat = Number(b.websiteFeatured) - Number(a.websiteFeatured);
    if (feat !== 0) return feat;
    const as = eventStart(a.event)?.getTime() ?? Number.POSITIVE_INFINITY;
    const bs = eventStart(b.event)?.getTime() ?? Number.POSITIVE_INFINITY;
    return as - bs;
  });
}

export const getEventsDirectory = cache(
  async (filters: BrowseFilters = {}): Promise<BrowseDirectory> => {
    try {
      const listed = await loadListedEvents();

      const cities = [
        ...new Set(
          listed.map(({ event }) => String(event.location?.city || "").trim()).filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b));
      const categories = [
        ...new Set(listed.map(({ event }) => String(event.category || "").trim()).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b));

      const filtered = sortByStart(applyFilters(listed, filters));
      const cards = filtered.map(({ event, websiteFeatured }) => toCard(event, websiteFeatured));

      const spotlightIdx = cards.findIndex((c) => c.websiteFeatured);
      const spotlight =
        spotlightIdx >= 0 ? cards[spotlightIdx]! : cards.length > 0 ? cards[0]! : null;
      const events = spotlight == null ? cards : cards.filter((c) => c.id !== spotlight.id);

      return {
        events,
        spotlight,
        facets: { cities, categories },
        total: cards.length,
      };
    } catch (err) {
      console.error("[getEventsDirectory]", err);
      return { events: [], spotlight: null, facets: { cities: [], categories: [] }, total: 0 };
    }
  },
);

/** @deprecated Prefer getEventsDirectory — kept for simple title search callers. */
export const getBrowsableEvents = cache(async (query?: string): Promise<EventModel[]> => {
  const dir = await getEventsDirectory({ q: query, when: "all" });
  const ids = new Set([
    ...(dir.spotlight ? [dir.spotlight.id] : []),
    ...dir.events.map((e) => e.id),
  ]);
  try {
    const listed = await loadListedEvents();
    return listed.filter(({ event }) => ids.has(event.id)).map(({ event }) => event);
  } catch {
    return [];
  }
});

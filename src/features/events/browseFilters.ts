import type { BrowseFilters, BrowsePrice, BrowseWhen } from "./browse.service";

export function parseBrowseFilters(
  sp: Record<string, string | string[] | undefined> | undefined,
): BrowseFilters {
  const one = (key: string) => {
    const v = sp?.[key];
    return Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "");
  };
  const whenRaw = one("when");
  const priceRaw = one("price");
  const when: BrowseWhen =
    whenRaw === "weekend" || whenRaw === "month" || whenRaw === "all" || whenRaw === "upcoming"
      ? whenRaw
      : "upcoming";
  const price: BrowsePrice =
    priceRaw === "free" || priceRaw === "paid" || priceRaw === "all" ? priceRaw : "all";
  return {
    q: one("q").trim() || undefined,
    city: one("city").trim() || undefined,
    category: one("category").trim() || undefined,
    when,
    price,
  };
}

export function eventsBrowseHref(
  filters: BrowseFilters,
  patch: Partial<BrowseFilters> = {},
): string {
  const next: BrowseFilters = { ...filters, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.city && next.city !== "all") params.set("city", next.city);
  if (next.category && next.category !== "all") params.set("category", next.category);
  if (next.when && next.when !== "upcoming") params.set("when", next.when);
  if (next.price && next.price !== "all") params.set("price", next.price);
  const qs = params.toString();
  return qs ? `/events?${qs}` : "/events";
}

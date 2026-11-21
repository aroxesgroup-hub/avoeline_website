import type { PublicStats } from "./publicStats";

export type StatSettingRow = {
  key: string;
  label: string;
  visible: boolean;
  min_threshold: number;
  format?: string | null;
};

export type FilteredStatItem = {
  key: string;
  label: string;
  value: string;
  raw: number;
};

export type SortablePublicPlan = {
  sort_order: number;
  is_recommended?: boolean | null;
};

/** Format a raw aggregate for display (`number` | `compact`). */
export function formatStatValue(raw: number, format?: string | null): string {
  const n = Number.isFinite(raw) ? raw : 0;
  if ((format ?? "number").toLowerCase() === "compact") {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  }
  return new Intl.NumberFormat("en").format(n);
}

/**
 * Keep only visible stats whose live value meets `min_threshold`.
 * Never invents values — missing keys read as 0 and are filtered out when threshold > 0.
 */
export function filterStatsByThreshold(
  stats: PublicStats | null | undefined,
  settings: StatSettingRow[] | null | undefined,
): FilteredStatItem[] {
  if (!stats || !settings?.length) return [];
  const out: FilteredStatItem[] = [];
  for (const setting of settings) {
    if (!setting.visible) continue;
    const raw = Number((stats as Record<string, number>)[setting.key] ?? 0);
    const threshold = Number(setting.min_threshold ?? 0);
    if (!Number.isFinite(raw) || raw < threshold) continue;
    out.push({
      key: setting.key,
      label: setting.label,
      raw,
      value: formatStatValue(raw, setting.format),
    });
  }
  return out;
}

/** Public plans: `sort_order` ascending; recommended breaks ties. */
export function sortPublicPlans<T extends SortablePublicPlan>(plans: T[]): T[] {
  return [...plans].sort((a, b) => {
    const order = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (order !== 0) return order;
    return Number(Boolean(b.is_recommended)) - Number(Boolean(a.is_recommended));
  });
}

/** Sections with no real items should not render. */
export function shouldHideEmptySection(items: unknown[] | null | undefined): boolean {
  return !Array.isArray(items) || items.length === 0;
}

export type PlanBillingPeriod = "month" | "year";

export type PlanPriceFields = {
  currency?: string | null;
  price_monthly?: number | string | null;
  price_yearly?: number | string | null;
};

function formatMoneyAmount(currency: string, amount: number): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatPlanPrice(
  plan: PlanPriceFields,
  period: PlanBillingPeriod = "month",
): string {
  const currency = (plan.currency || "PKR").toUpperCase();
  const amount = period === "year" ? plan.price_yearly : plan.price_monthly;
  if (amount == null) return "Custom Quote";
  if (Number(amount) === 0) return period === "year" ? "PKR 0 /year" : "PKR 0 /month";
  const formatted = formatMoneyAmount(currency, Number(amount));
  return `${formatted} /${period === "year" ? "year" : "month"}`;
}

/** Effective monthly when paying yearly — muted subline under the annual total. */
export function formatAnnualEffectiveMonthly(plan: PlanPriceFields): string | null {
  const currency = (plan.currency || "PKR").toUpperCase();
  const yearly = Number(plan.price_yearly);
  if (!Number.isFinite(yearly) || yearly <= 0) return null;
  const monthly = Math.round(yearly / 12);
  return `≈ ${formatMoneyAmount(currency, monthly)} /month billed annually`;
}

/** True when yearly price is at least 15% below 12× monthly (for “Save” badge). */
export function planHasAnnualSavings(plan: PlanPriceFields): boolean {
  const monthly = Number(plan.price_monthly);
  const yearly = Number(plan.price_yearly);
  if (!Number.isFinite(monthly) || !Number.isFinite(yearly) || monthly <= 0 || yearly <= 0) {
    return false;
  }
  return yearly <= monthly * 12 * 0.85;
}

/** Append or replace `billing=month|year` on signup/plan CTAs; default role=Organizer for /plans. */
export function withBillingPeriod(href: string, period: PlanBillingPeriod): string {
  const raw = String(href || "").trim();
  if (!raw || raw.startsWith("/contact")) return raw;
  try {
    const url = new URL(raw, "https://avoeline.local");
    url.searchParams.set("billing", period === "year" ? "year" : "month");
    if (url.pathname.startsWith("/auth/signup") && !url.searchParams.get("role")) {
      url.searchParams.set("role", "Organizer");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return raw;
  }
}

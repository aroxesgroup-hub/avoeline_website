import "server-only";

import { getPublishedBlocks, getPublishedPage } from "../siteContent.service";
import { BlockRenderer } from "./BlockRenderer";
import {
  formatPlanPrice,
  getStatsStrip,
  listGrantedPartners,
  listMarketingEvents,
  listPublicPlans,
  listVisibleTestimonials,
  type MarketingEvent,
  type MarketingPartner,
  type MarketingTestimonial,
  type PublicPlan,
} from "../marketingData.service";
import type { FilteredStatItem } from "../marketingData.logic";
import { shouldHideEmptySection } from "../marketingData.logic";
import type { BlockDataMap } from "../blocks/schemas";
import { parseBlockDraft } from "../blocks/schemas";

export type LiveMarketingData = {
  stats: FilteredStatItem[];
  partners: MarketingPartner[];
  events: MarketingEvent[];
  plans: PublicPlan[];
  testimonials: MarketingTestimonial[];
};

export async function loadLiveMarketingData(): Promise<LiveMarketingData> {
  const [stats, partners, events, plans, testimonials] = await Promise.all([
    getStatsStrip(),
    listGrantedPartners(),
    listMarketingEvents(3),
    listPublicPlans(),
    listVisibleTestimonials(),
  ]);
  return { stats, partners, events, plans, testimonials };
}

function statsToBlock(
  cms: BlockDataMap["stats_strip"],
  live: FilteredStatItem[],
): BlockDataMap["stats_strip"] | null {
  const liveByKey = new Map(live.map((s) => [s.key, s]));
  const cmsItems = cms.items ?? [];

  // Prefer CMS order: filled values stay (owner-editable); empty values fill from live keys.
  const merged = cmsItems
    .map((item) => {
      const key = (item.key ?? "").trim();
      const cmsValue = (item.value ?? "").trim();
      if (cmsValue) {
        return {
          key,
          label: (item.label ?? "").trim() || liveByKey.get(key)?.label || key,
          value: cmsValue,
        };
      }
      const liveItem = key ? liveByKey.get(key) : undefined;
      if (!liveItem) return null;
      return {
        key,
        label: (item.label ?? "").trim() || liveItem.label,
        value: liveItem.value,
      };
    })
    .filter((row): row is { key: string; label: string; value: string } => Boolean(row));

  // Append live stats not listed in CMS — skip when CMS only has owner-filled demo values
  // (e.g. About mock) so we do not tack on every public_stats key.
  const cmsAllFilled =
    cmsItems.length > 0 && cmsItems.every((item) => Boolean((item.value ?? "").trim()));
  if (!cmsAllFilled) {
    for (const s of live) {
      if (!merged.some((m) => m.key === s.key)) {
        merged.push({ key: s.key, label: s.label, value: s.value });
      }
    }
  }

  if (shouldHideEmptySection(merged)) return null;
  return { title: cms.title, items: merged };
}

function partnersToBlock(
  cms: BlockDataMap["logo_wall"],
  live: MarketingPartner[],
): BlockDataMap["logo_wall"] | null {
  const cat = String(cms.category || "")
    .trim()
    .toLowerCase();
  const filtered = cat
    ? live.filter(
        (p) =>
          String(p.category || "")
            .trim()
            .toLowerCase() === cat,
      )
    : live;
  if (shouldHideEmptySection(filtered)) return null;
  return {
    title: cms.title,
    body: cms.body,
    category: cms.category,
    items: filtered.map((p) => ({
      name: p.name,
      logoUrl: p.logoUrl,
      href: p.url,
      alt: p.logoAlt || p.name,
      description: p.description || "",
    })),
  };
}

function eventsToBlock(
  cms: BlockDataMap["event_showcase"],
  live: MarketingEvent[],
): BlockDataMap["event_showcase"] | null {
  if (shouldHideEmptySection(live)) return null;
  return {
    title: cms.title,
    body: cms.body,
    viewAllLabel: cms.viewAllLabel || "View all upcoming events",
    viewAllHref: cms.viewAllHref || "/events",
    items: live.map((e) => ({
      eventId: e.id,
      title: e.title,
      href: e.href,
      imageUrl: e.imageUrl,
      imageAlt: e.imageAlt,
      meta: e.meta,
      location: e.location,
      dateLabel: e.dateLabel,
      priceLabel: "",
      ctaLabel: "Register",
    })),
  };
}

function plansToBlock(
  cms: BlockDataMap["pricing_teaser"],
  live: PublicPlan[],
): BlockDataMap["pricing_teaser"] | null {
  if (shouldHideEmptySection(live)) return null;
  return {
    title: cms.title,
    body: cms.body,
    ctaLabel: cms.ctaLabel || "Compare all features",
    ctaHref: cms.ctaHref || "/plans",
    showRecommended: cms.showRecommended,
    items: live.map((p) => ({
      name: p.name,
      tagline: p.tagline ?? "",
      price: formatPlanPrice(p),
      href: p.cta_href || `/auth/signup?plan=${encodeURIComponent(p.key)}`,
      ctaLabel: p.cta_label || (p.is_recommended ? "Upgrade Now" : "Start Free"),
      recommended: Boolean(p.is_recommended),
      features: p.highlight_features ?? [],
    })),
  };
}

function testimonialsToBlock(
  cms: BlockDataMap["testimonials"],
  live: MarketingTestimonial[],
): BlockDataMap["testimonials"] | null {
  if (shouldHideEmptySection(live)) return null;
  return {
    title: cms.title,
    items: live.map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      organization: t.organization,
      avatarUrl: t.avatarUrl,
    })),
  };
}

/**
 * Renders published CMS blocks for a page slug, wiring live DB sections:
 * stats / partners / events / plans / testimonials. Empty live sections hide.
 */
export async function MarketingPageBlocks({
  slug,
  live: liveProp,
  excludeTypes,
}: {
  slug: string;
  live?: LiveMarketingData;
  /** Skip block types handled by the page layout (e.g. contact_hub sidebar). */
  excludeTypes?: readonly string[];
}) {
  const page = await getPublishedPage(slug);
  if (!page) return null;

  const [blocks, live] = await Promise.all([
    getPublishedBlocks(page.id),
    liveProp ? Promise.resolve(liveProp) : loadLiveMarketingData(),
  ]);

  const skip = new Set(excludeTypes ?? []);
  const visibleBlocks = blocks.filter((b) => !skip.has(b.type));
  if (!visibleBlocks.length) return null;

  return (
    <>
      {visibleBlocks.map((block) => {
        const parsed = parseBlockDraft(block.type, block.published);
        if (!parsed.ok) return null;

        let data: unknown = parsed.data;

        switch (parsed.type) {
          case "stats_strip": {
            const next = statsToBlock(parsed.data, live.stats);
            if (!next) return null;
            data = next;
            break;
          }
          case "logo_wall": {
            const next = partnersToBlock(parsed.data, live.partners);
            if (!next) return null;
            data = next;
            break;
          }
          case "event_showcase": {
            const next = eventsToBlock(parsed.data, live.events);
            if (!next) return null;
            data = next;
            break;
          }
          case "pricing_teaser": {
            const next = plansToBlock(parsed.data, live.plans);
            if (!next) return null;
            data = next;
            break;
          }
          case "testimonials": {
            const next = testimonialsToBlock(parsed.data, live.testimonials);
            if (!next) return null;
            data = next;
            break;
          }
          default:
            break;
        }

        return (
          <BlockRenderer key={block.id} type={block.type} data={data} visible={block.visible} />
        );
      })}
    </>
  );
}

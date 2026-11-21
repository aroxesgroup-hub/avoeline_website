import type { Metadata } from "next";
import { getPublishedPage } from "@/src/features/website/siteContent.service";
import { buildPageMetadata } from "@/src/features/website/pageMetadata";
import { MarketingPageBlocks } from "@/src/features/website/components/MarketingPageBlocks";
import { PartnerApplicationForm } from "@/src/features/website/components/PartnerApplicationForm";

/** Ensure CMS/partner seed updates are visible without waiting on forever Data Cache. */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage("partners");
  return buildPageMetadata(page?.seo, {
    title: "Partners — Avoeline",
    description:
      "Partner with Avoeline for campus societies, vendors, and event networks across Pakistan.",
    path: "/partners",
  });
}

/**
 * Partners — CMS blocks (hero, stats, logo walls, gateways, perks, trust) + application form.
 * Logos hydrate from granted site_partners; empty walls/CTAs hide.
 */
export default async function PartnersPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;

  return (
    <main className="flex-1">
      <MarketingPageBlocks slug="partners" />
      <section
        id="partner-apply"
        className="border-t border-[var(--mkt-line)] bg-[var(--mkt-surface-low)] px-6 py-16 lg:px-10"
      >
        <div className="mx-auto max-w-[var(--mkt-max,80rem)]">
          <PartnerApplicationForm turnstileSiteKey={turnstileSiteKey} />
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPage } from "@/src/features/website/siteContent.service";
import {
  MarketingPageBlocks,
  loadLiveMarketingData,
} from "@/src/features/website/components/MarketingPageBlocks";
import { buildPageMetadata, getSiteOrigin } from "@/src/features/website/pageMetadata";
import { shouldHideEmptySection } from "@/src/features/website/marketingData.logic";
import { listVisibleFaqs } from "@/src/features/website/marketingData.service";
import { buildFaqPageJsonLd } from "@/src/features/website/seo.logic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage("home");
  return buildPageMetadata(page?.seo, {
    title: "Avoeline — Run every event from one place",
    description:
      "Registrations, tickets, hackathons, clubs, sponsors and certificates — built for the people who actually organize.",
    path: "/",
  });
}

function HomeJsonLd({
  statsLine,
  faqLd,
}: {
  statsLine?: string;
  faqLd: Record<string, unknown> | null;
}) {
  const origin = getSiteOrigin();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Avoeline",
        url: origin,
        email: "info@aroxes.com",
        parentOrganization: {
          "@type": "Organization",
          name: "Aroxes",
          url: "https://aroxes.com",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Avoeline",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: origin,
        description:
          "Event operations platform for organizers and vendors — registrations, vendors, hackathons, and certificates.",
        ...(statsLine ? { disambiguatingDescription: statsLine } : {}),
      },
      ...(faqLd ? [faqLd] : []),
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

function MinimalHomeFallback() {
  return (
    <section className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_90%_0%,color-mix(in_srgb,var(--mkt-accent)_28%,transparent),transparent_60%)]" />
      <div className="relative mx-auto max-w-[var(--mkt-max,80rem)]">
        <p className="mb-6 text-sm font-semibold text-[var(--mkt-accent)]">Avoeline</p>
        <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-[var(--mkt-ink)] sm:text-6xl">
          Run every event from one place.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mkt-muted)]">
          Registrations, tickets, hackathons, clubs, sponsors and certificates, built for the people
          who actually organize.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/auth/signup"
            className="inline-flex h-11 items-center rounded-xl bg-[var(--mkt-accent-deep)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--mkt-accent)]"
          >
            Get started free
          </Link>
          <Link
            href="/plans"
            className="inline-flex h-11 items-center rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-5 text-sm font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)]"
          >
            See plans
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [page, live, faqs] = await Promise.all([
    getPublishedPage("home"),
    loadLiveMarketingData(),
    listVisibleFaqs(),
  ]);
  const hasCms = Boolean(page);
  const statsLine = !shouldHideEmptySection(live.stats)
    ? live.stats.map((s) => `${s.value} ${s.label}`).join(" · ")
    : undefined;
  const faqLd = buildFaqPageJsonLd(
    getSiteOrigin(),
    faqs.map((f) => ({ question: f.question, answer: f.answer })),
  );

  return (
    <main className="flex-1">
      <HomeJsonLd statsLine={statsLine} faqLd={faqLd} />
      {hasCms ? <MarketingPageBlocks slug="home" live={live} /> : <MinimalHomeFallback />}
    </main>
  );
}

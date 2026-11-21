import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPage } from "@/src/features/website/siteContent.service";
import { buildPageMetadata } from "@/src/features/website/pageMetadata";
import { MarketingPageBlocks } from "@/src/features/website/components/MarketingPageBlocks";

/** Ensure CMS seed updates are visible without waiting on forever Data Cache. */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage("about");
  return buildPageMetadata(page?.seo, {
    title: "About — Avoeline",
    description:
      "Avoeline is built by Aroxes for organizers, clubs, and vendors who run real events.",
    path: "/about",
  });
}

function AboutFallback() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 py-16 lg:px-10 lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_90%_0%,color-mix(in_srgb,var(--mkt-accent)_22%,transparent),transparent_60%)]" />
        <div className="relative mx-auto max-w-[var(--mkt-max,80rem)]">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--mkt-ink)] sm:text-5xl">
            About Avoeline
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--mkt-muted)]">
            Avoeline is built by Aroxes, a group of companies making practical software for local
            businesses and people.
          </p>
        </div>
      </section>
      <section className="px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-[var(--mkt-max,80rem)]">
          <h2 className="font-display text-2xl font-semibold text-[var(--mkt-ink)]">From Aroxes</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            <li className="rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] p-6">
              <p className="font-display text-lg font-semibold text-[var(--mkt-ink)]">Avoeline</p>
              <p className="mt-2 text-sm text-[var(--mkt-muted)]">
                Event operations for organizers and vendors.
              </p>
            </li>
            <li className="rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] p-6">
              <p className="font-display text-lg font-semibold text-[var(--mkt-ink)]">Distroline</p>
              <p className="mt-2 text-sm text-[var(--mkt-muted)]">
                Practical software from the Aroxes family.
              </p>
            </li>
          </ul>
          <Link
            href="/contact"
            className="mt-10 inline-flex h-11 items-center rounded-xl bg-[var(--mkt-accent-deep)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--mkt-accent)]"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function AboutPage() {
  const page = await getPublishedPage("about");
  if (!page) return <AboutFallback />;
  return (
    <main className="flex-1">
      <MarketingPageBlocks slug="about" />
    </main>
  );
}

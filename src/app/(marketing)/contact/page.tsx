import type { Metadata } from "next";
import { getPublishedBlocks, getPublishedPage } from "@/src/features/website/siteContent.service";
import { buildPageMetadata } from "@/src/features/website/pageMetadata";
import { MarketingPageBlocks } from "@/src/features/website/components/MarketingPageBlocks";
import { ContactForm } from "@/src/features/website/components/ContactForm";
import { ContactHubRenderer } from "@/src/features/website/blocks/renderers/ContactHub";
import { parseBlockDraft } from "@/src/features/website/blocks/schemas";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage("contact");
  return buildPageMetadata(page?.seo, {
    title: "Contact — Avoeline",
    description:
      "Get in touch with the Avoeline team for campus partnerships, enterprise billing, or general support.",
    path: "/contact",
  });
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ topic?: string }>;
}) {
  const page = await getPublishedPage("contact");
  const params = searchParams ? await searchParams : {};
  const topic = typeof params.topic === "string" ? params.topic : "";
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;

  let hubData: ReturnType<typeof parseBlockDraft> | null = null;
  if (page) {
    const blocks = await getPublishedBlocks(page.id);
    const hub = blocks.find((b) => b.type === "contact_hub" && b.visible);
    if (hub) hubData = parseBlockDraft("contact_hub", hub.published);
  }

  return (
    <main className="flex-1">
      {page ? <MarketingPageBlocks slug="contact" excludeTypes={["contact_hub"]} /> : null}

      <section
        id="contact-desk"
        className="border-t border-[var(--mkt-line)] bg-[var(--mkt-surface-low)] px-6 py-14 lg:px-10"
      >
        <div className="mx-auto grid max-w-[var(--mkt-max,80rem)] gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="mkt-card rounded-2xl p-6 sm:p-8">
            <ContactForm turnstileSiteKey={turnstileSiteKey} initialTopic={topic || null} />
          </div>
          <aside>
            {hubData && hubData.ok && hubData.type === "contact_hub" ? (
              <ContactHubRenderer data={hubData.data} />
            ) : (
              <div className="mkt-card rounded-2xl p-6 text-sm text-[var(--mkt-muted)]">
                Email{" "}
                <a
                  href="mailto:info@aroxes.com"
                  className="font-semibold text-[var(--mkt-accent-deep)] underline underline-offset-2"
                >
                  info@aroxes.com
                </a>
                . We usually reply within one business day.
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

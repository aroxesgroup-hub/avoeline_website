import type { Metadata } from "next";
import { getLegalDocument } from "@/src/features/website/marketingData.service";
import { buildPageMetadata } from "@/src/features/website/pageMetadata";
import { LegalSuitePage } from "@/src/features/website/components/LegalSuitePage";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegalDocument("content-rights");
  return buildPageMetadata(
    { title: doc ? `${doc.title} — Avoeline` : "Content Rights — Avoeline" },
    {
      title: "Content Rights — Avoeline",
      description: "Content, media, and certificate rights on Avoeline.",
      path: "/content-rights",
    },
  );
}

export default async function ContentRightsPage() {
  return <LegalSuitePage activeSlug="content-rights" />;
}

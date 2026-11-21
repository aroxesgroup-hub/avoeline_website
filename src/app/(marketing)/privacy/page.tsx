import type { Metadata } from "next";
import { getLegalDocument } from "@/src/features/website/marketingData.service";
import { buildPageMetadata } from "@/src/features/website/pageMetadata";
import { LegalSuitePage } from "@/src/features/website/components/LegalSuitePage";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegalDocument("privacy");
  return buildPageMetadata(
    { title: doc ? `${doc.title} — Avoeline` : "Privacy Policy — Avoeline" },
    {
      title: "Privacy Policy — Avoeline",
      description: "How Avoeline collects and uses data.",
      path: "/privacy",
    },
  );
}

export default async function PrivacyPage() {
  return <LegalSuitePage activeSlug="privacy" />;
}

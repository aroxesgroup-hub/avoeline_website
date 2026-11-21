import type { Metadata } from "next";
import { getLegalDocument } from "@/src/features/website/marketingData.service";
import { buildPageMetadata } from "@/src/features/website/pageMetadata";
import { LegalSuitePage } from "@/src/features/website/components/LegalSuitePage";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegalDocument("terms");
  return buildPageMetadata(
    { title: doc ? `${doc.title} — Avoeline` : "Terms — Avoeline" },
    {
      title: "Terms and Conditions — Avoeline",
      description: "Terms for using Avoeline.",
      path: "/terms",
    },
  );
}

export default async function TermsPage() {
  return <LegalSuitePage activeSlug="terms" />;
}

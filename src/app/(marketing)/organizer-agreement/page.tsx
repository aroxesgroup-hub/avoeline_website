import type { Metadata } from "next";
import { getLegalDocument } from "@/src/features/website/marketingData.service";
import { buildPageMetadata } from "@/src/features/website/pageMetadata";
import { LegalSuitePage } from "@/src/features/website/components/LegalSuitePage";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegalDocument("organizer-agreement");
  return buildPageMetadata(
    { title: doc ? `${doc.title} — Avoeline` : "Organizer Agreement — Avoeline" },
    {
      title: "Event Organizer Agreement — Avoeline",
      description: "Agreement for organizers publishing events on Avoeline.",
      path: "/organizer-agreement",
    },
  );
}

export default async function OrganizerAgreementPage() {
  return <LegalSuitePage activeSlug="organizer-agreement" />;
}

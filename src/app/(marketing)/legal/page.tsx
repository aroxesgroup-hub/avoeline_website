import type { Metadata } from "next";
import { buildPageMetadata } from "@/src/features/website/pageMetadata";
import { LegalSuitePage } from "@/src/features/website/components/LegalSuitePage";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    {
      title: "Compliance & Governance Suite — Avoeline",
      description: "Privacy, Terms, Organizer Agreement, and Content Rights for Avoeline.",
    },
    {
      title: "Compliance & Governance Suite — Avoeline",
      description: "Privacy, Terms, Organizer Agreement, and Content Rights for Avoeline.",
      path: "/legal",
    },
  );
}

export default async function LegalHubPage() {
  return <LegalSuitePage />;
}

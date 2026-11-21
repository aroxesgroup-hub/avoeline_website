import { LEGAL_SUITE_SLUGS, type LegalSuiteSlug } from "../legalSuite.logic";
import { getLegalSuiteDocuments } from "../marketingData.service";
import { getLegalSuiteSettings } from "../siteContent.service";
import { LegalSuiteView } from "./LegalSuiteView";

export async function LegalSuitePage({ activeSlug }: { activeSlug?: LegalSuiteSlug | null }) {
  const [settings, documents] = await Promise.all([
    getLegalSuiteSettings(),
    getLegalSuiteDocuments([...LEGAL_SUITE_SLUGS]),
  ]);
  return <LegalSuiteView settings={settings} documents={documents} activeSlug={activeSlug} />;
}

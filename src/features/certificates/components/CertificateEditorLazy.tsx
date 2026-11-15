"use client";

import dynamic from "next/dynamic";
import type { CertificateTemplateRow } from "@/src/features/certificates/types";

const CertificateEditor = dynamic(
  () => import("@/src/features/certificates/components/CertificateEditor"),
  { ssr: false, loading: () => <p className="text-sm text-ink-soft">Loading editor…</p> },
);

export function CertificateEditorLazy({
  eventId,
  initial,
  formFieldKeys = [],
}: {
  eventId: string;
  initial: CertificateTemplateRow;
  formFieldKeys?: string[];
}) {
  return <CertificateEditor eventId={eventId} initial={initial} formFieldKeys={formFieldKeys} />;
}

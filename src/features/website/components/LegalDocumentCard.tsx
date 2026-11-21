import type { ReactNode } from "react";
import type { LegalDocumentView } from "../marketingData.service";
import type { LegalSuiteSettings } from "../legalSuite.logic";
import { isLegalSuiteSlug } from "../legalSuite.logic";
import { LegalMarkdownBody } from "./LegalMarkdownBody";
import { DataRequestForm } from "./DataRequestForm";

export function LegalDocumentCard({
  doc,
  settings,
  footer,
}: {
  doc: LegalDocumentView;
  settings: LegalSuiteSettings;
  footer?: ReactNode;
}) {
  const meta = isLegalSuiteSlug(doc.slug) ? settings.docs[doc.slug] : null;
  const index = meta?.index ?? 0;
  const label = meta?.label ?? doc.slug.replace(/-/g, " ");
  const updated = doc.effectiveDate || doc.publishedAt.slice(0, 10);

  return (
    <article
      id={doc.slug}
      className="mkt-card scroll-mt-28 rounded-3xl p-6 sm:p-8 print:break-inside-avoid print:shadow-none"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-muted)]">
          Document {String(index).padStart(2, "0")} / {label}
        </p>
        <p className="rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-surface-low)] px-3 py-1 text-[11px] font-medium text-[var(--mkt-muted)]">
          Path: /{doc.slug}
        </p>
      </div>

      <header className="mb-5 border-b border-[var(--mkt-line)] pb-5">
        <h2 className="font-display text-2xl tracking-tight text-[var(--mkt-ink)] sm:text-3xl">
          {doc.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--mkt-muted)]">
          Version {doc.version}
          {updated ? ` · Effective ${updated}` : null}
        </p>
      </header>

      <LegalMarkdownBody bodyMd={doc.bodyMd} />

      {doc.slug === "privacy" ? (
        <div className="mt-8 max-w-lg border-t border-[var(--mkt-line)] pt-8 print:hidden">
          <DataRequestForm />
        </div>
      ) : null}

      {footer}
    </article>
  );
}

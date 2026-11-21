import type { LegalDocumentView as LegalDoc } from "../marketingData.service";
import { prepareLegalMarkdown } from "../legalMarkdown";
import { LegalMarkdownBody } from "./LegalMarkdownBody";

/** Legacy single-doc layout (admin preview / fallback). Public pages use LegalSuiteView. */
export function LegalDocumentView({ doc }: { doc: LegalDoc }) {
  const { toc } = prepareLegalMarkdown(doc.bodyMd);
  const updated = doc.effectiveDate || doc.publishedAt.slice(0, 10);

  return (
    <div className="mx-auto flex w-full max-w-[var(--mkt-max,80rem)] flex-1 gap-10 px-6 py-12 lg:px-10">
      {toc.length > 0 ? (
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav aria-label="Table of contents" className="sticky top-24">
            <p className="mb-3 text-2xs font-medium uppercase tracking-wide text-[var(--mkt-muted)]">
              On this page
            </p>
            <ul className="space-y-2 border-l border-[var(--mkt-line)] pl-3">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      ) : null}

      <article className="min-w-0 flex-1 print:max-w-none">
        <header className="mb-8 border-b border-[var(--mkt-line)] pb-6">
          <h1 className="font-display text-3xl tracking-tight text-[var(--mkt-ink)] sm:text-4xl">
            {doc.title}
          </h1>
          <p className="mt-3 text-sm text-[var(--mkt-muted)]">
            Version {doc.version}
            {updated ? ` · Last updated ${updated}` : null}
          </p>
        </header>

        <LegalMarkdownBody bodyMd={doc.bodyMd} />
      </article>
    </div>
  );
}

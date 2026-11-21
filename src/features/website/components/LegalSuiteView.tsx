import type { LegalDocumentView } from "../marketingData.service";
import {
  LEGAL_SUITE_SLUGS,
  formatLegalReleaseLine,
  type LegalSuiteSettings,
  type LegalSuiteSlug,
} from "../legalSuite.logic";
import { LegalDocumentCard } from "./LegalDocumentCard";
import { LegalSuitePrintButton, LegalSuiteScrollToActive } from "./LegalSuiteActions";

export function LegalSuiteView({
  settings,
  documents,
  activeSlug,
}: {
  settings: LegalSuiteSettings;
  documents: LegalDocumentView[];
  activeSlug?: LegalSuiteSlug | null;
}) {
  const bySlug = new Map(documents.map((d) => [d.slug, d]));
  const ordered = LEGAL_SUITE_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (d): d is LegalDocumentView => !!d,
  );
  const releaseLine = formatLegalReleaseLine(ordered);
  const mailLegal = `mailto:${settings.contactEmail}?subject=${encodeURIComponent("Avoeline legal desk")}`;
  const mailDpa = `mailto:${settings.contactEmail}?subject=${encodeURIComponent(settings.dpa.mailtoSubject)}`;

  return (
    <main className="relative flex-1 bg-[var(--mkt-surface-low)] print:bg-white">
      <LegalSuiteScrollToActive activeSlug={activeSlug} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_var(--mkt-accent-tint),_transparent_70%)] print:hidden" />

      <div className="relative mx-auto grid w-full max-w-[var(--mkt-max,80rem)] gap-8 px-6 py-12 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:py-16">
        <aside className="print:hidden lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mkt-muted)]">
            {settings.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-[var(--mkt-ink)] sm:text-4xl">
            {settings.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-muted)]">{settings.intro}</p>

          <div className="mkt-card mt-6 rounded-2xl p-4">
            <p className="text-xs font-medium text-[var(--mkt-muted)]">{releaseLine}</p>
            <nav aria-label="Legal documents" className="mt-4 space-y-1">
              {LEGAL_SUITE_SLUGS.map((slug) => {
                const meta = settings.docs[slug];
                const published = bySlug.has(slug);
                const active = activeSlug === slug;
                return (
                  <a
                    key={slug}
                    href={`#${slug}`}
                    aria-current={active ? "true" : undefined}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-[var(--mkt-accent-tint)] font-semibold text-[var(--mkt-ink)]"
                        : published
                          ? "text-[var(--mkt-text)] hover:bg-[var(--mkt-surface)]"
                          : "pointer-events-none text-[var(--mkt-muted)] opacity-50"
                    }`}
                  >
                    <span>{meta.navLabel}</span>
                    <span aria-hidden className="text-[var(--mkt-muted)]">
                      ›
                    </span>
                  </a>
                );
              })}
            </nav>

            <div className="mt-4 space-y-2">
              <LegalSuitePrintButton label={settings.downloadLabel} />
              <a
                href={mailLegal}
                className="mkt-btn flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition"
              >
                {settings.contactLabel}
              </a>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[var(--mkt-accent-deep)] p-5 text-white shadow-[var(--mkt-card-shadow)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
              {settings.zeroSell.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50/95">
              {settings.zeroSell.body}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-emerald-200/80">
                  {settings.zeroSell.stat1Label}
                </dt>
                <dd className="mt-1 text-sm font-semibold">{settings.zeroSell.stat1Value}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-emerald-200/80">
                  {settings.zeroSell.stat2Label}
                </dt>
                <dd className="mt-1 text-sm font-semibold">{settings.zeroSell.stat2Value}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <div id="legal-suite-print" className="min-w-0 space-y-6">
          {ordered.length === 0 ? (
            <div className="mkt-card rounded-3xl p-8">
              <h2 className="font-display text-2xl text-[var(--mkt-ink)]">Legal documents</h2>
              <p className="mt-3 text-sm text-[var(--mkt-muted)]">
                Policies will appear here once published. Contact{" "}
                <a href={mailLegal} className="underline">
                  {settings.contactEmail}
                </a>
                .
              </p>
            </div>
          ) : (
            ordered.map((doc) => <LegalDocumentCard key={doc.slug} doc={doc} settings={settings} />)
          )}

          <section className="rounded-3xl border border-[var(--mkt-line)] bg-[var(--mkt-accent-tint)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8 print:hidden">
            <div className="max-w-xl">
              <h2 className="font-display text-xl tracking-tight text-[var(--mkt-ink)] sm:text-2xl">
                {settings.dpa.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--mkt-muted)]">{settings.dpa.body}</p>
            </div>
            <a
              href={mailDpa}
              className="mkt-btn mt-4 inline-flex shrink-0 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold sm:mt-0"
            >
              {settings.dpa.buttonLabel}
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}

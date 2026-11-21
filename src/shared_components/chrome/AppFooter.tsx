import Link from "next/link";
import { BrandMark } from "@/src/shared_components/ui/BrandMark";

/**
 * One footer for marketing, dashboards, and public inner pages.
 * Full marketing footer follows Stitch multi-column Product / Company / Legal.
 */
export function AppFooter({ compact = false }: { compact?: boolean }) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="mt-auto flex w-full flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-5">
        <p className="text-sm text-ink-soft">
          © {year} Avoeline Event Systems. All rights reserved.
        </p>
        <Link href="/support" className="text-sm text-ink-soft transition hover:text-ink">
          Support
        </Link>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-[var(--mkt-line)] bg-[var(--mkt-surface-low)]">
      <div className="mx-auto flex max-w-[var(--mkt-max,80rem)] flex-col gap-10 px-6 py-12 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandMark className="h-9 w-auto" />
              <span className="font-display text-lg font-semibold tracking-tight text-[var(--mkt-ink)]">
                Avoeline
              </span>
            </Link>
            <p className="max-w-sm text-[15px] leading-relaxed text-[var(--mkt-muted)]">
              Event operations for organizers, clubs, departments, and vendors — registrations,
              tickets, hackathons, and certificates in one place.
            </p>
          </div>

          <FooterGroup
            title="Product"
            links={[
              { label: "Features", href: "/#product" },
              { label: "Plans", href: "/plans" },
              { label: "Events", href: "/events" },
              { label: "Partners", href: "/partners" },
            ]}
          />
          <FooterGroup
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Support", href: "/support" },
            ]}
          />
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--mkt-ink)]">
              Legal
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
                >
                  Legal Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer-agreement"
                  className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
                >
                  Organizer Agreement
                </Link>
              </li>
              <li>
                <Link
                  href="/content-rights"
                  className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
                >
                  Content Rights
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@aroxes.com"
                  className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
                >
                  info@aroxes.com
                </a>
              </li>
              <li>
                <a
                  href="https://aroxes.com"
                  className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  An Aroxes company
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--mkt-line)] pt-6">
          <p className="text-sm text-[var(--mkt-muted)]">
            © {year} Avoeline Event Systems. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--mkt-ink)]">
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

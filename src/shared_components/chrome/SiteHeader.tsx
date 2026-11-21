"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/src/shared_components/ui/BrandMark";
import { ThemeToggle } from "@/src/shared_components/ui/ThemeToggle";

const MARKETING_LINKS = [
  { label: "Features", href: "/#product" },
  { label: "Plans", href: "/plans" },
  { label: "Events", href: "/events" },
  { label: "Partners", href: "/partners" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * Sticky chrome for unauthenticated surfaces — Stitch dual-theme header.
 * `public` aliases marketing so /events and marketing pages share the same 6 links.
 */
export function SiteHeader(_props?: { variant?: "marketing" | "public" }) {
  const [open, setOpen] = useState(false);
  const links = MARKETING_LINKS;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--mkt-line)] bg-[color-mix(in_srgb,var(--mkt-canvas)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[var(--mkt-max,80rem)] items-center justify-between gap-4 px-6 lg:h-20 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <BrandMark className="h-9 w-auto" />
          <span className="font-display text-lg font-semibold tracking-tight text-[var(--mkt-ink)]">
            Avoeline
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--mkt-muted)] transition hover:bg-[var(--mkt-accent-tint)] hover:text-[var(--mkt-ink)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Link
            href="/auth/signin"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="mkt-btn inline-flex h-9 items-center rounded-xl px-3.5 text-sm font-semibold shadow-xs transition sm:h-10 sm:px-4"
          >
            Get started free
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--mkt-muted)] hover:bg-[var(--mkt-accent-tint)] hover:text-[var(--mkt-ink)] lg:hidden"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="site-mobile-nav"
          aria-label="Primary"
          className="border-t border-[var(--mkt-line)] px-4 pb-4 pt-2 lg:hidden"
        >
          <ul className="flex flex-col">
            {links.map((n) => (
              <li key={n.label}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-sm font-semibold text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/auth/signin"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-3 text-sm font-semibold text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)] sm:hidden"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

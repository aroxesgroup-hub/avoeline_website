import type { ReactNode } from "react";
import Link from "next/link";

export function SectionShell({
  children,
  dark,
  className = "",
  id,
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={
        dark
          ? `relative overflow-hidden bg-[var(--mkt-accent-deep)] px-6 py-16 text-white sm:py-20 lg:px-10 ${className}`
          : `px-6 py-14 sm:py-16 lg:px-10 ${className}`
      }
    >
      <div className="relative mx-auto max-w-[var(--mkt-max,80rem)]">{children}</div>
    </section>
  );
}

export function SectionTitle({
  title,
  body,
  dark,
}: {
  title?: string;
  body?: string;
  dark?: boolean;
}) {
  if (!title?.trim() && !body?.trim()) return null;
  return (
    <div className="mb-10 max-w-2xl">
      {title?.trim() ? (
        <h2
          className={`font-display text-3xl font-semibold tracking-tight sm:text-4xl ${
            dark ? "text-white" : "text-[var(--mkt-ink)]"
          }`}
        >
          {title.trim()}
        </h2>
      ) : null}
      {body?.trim() ? (
        <p
          className={`mt-3 text-[15px] leading-relaxed sm:text-base ${
            dark ? "text-white/70" : "text-[var(--mkt-muted)]"
          }`}
        >
          {body.trim()}
        </p>
      ) : null}
    </div>
  );
}

export function CtaButtons({
  primary,
  secondary,
  dark,
}: {
  primary?: { label?: string; href?: string } | null;
  secondary?: { label?: string; href?: string } | null;
  dark?: boolean;
}) {
  const pLabel = primary?.label?.trim();
  const pHref = primary?.href?.trim();
  const sLabel = secondary?.label?.trim();
  const sHref = secondary?.href?.trim();
  if (!pLabel && !sLabel) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {pLabel && pHref ? (
        <Link
          href={pHref}
          className={
            dark
              ? "inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:bg-white/90"
              : "mkt-btn inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold transition"
          }
        >
          {pLabel}
        </Link>
      ) : null}
      {sLabel && sHref ? (
        <Link
          href={sHref}
          className={
            dark
              ? "inline-flex h-11 items-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              : "inline-flex h-11 items-center rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-5 text-sm font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)]"
          }
        >
          {sLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

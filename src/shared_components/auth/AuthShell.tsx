import type { ReactNode } from "react";
import Image from "next/image";
import { SiteHeader } from "@/src/shared_components/chrome/SiteHeader";
import { AppFooter } from "@/src/shared_components/chrome/AppFooter";

export type AuthStatChip = { label: string; value: string };

export type AuthTestimonial = {
  quote: string;
  name: string;
  role?: string;
};

export function AuthShell({
  eyebrow,
  headline,
  copy,
  stats,
  testimonial,
  heroImageUrl,
  heroBadge,
  showChrome = true,
  children,
}: {
  eyebrow?: string;
  headline: string;
  copy: string;
  stats?: AuthStatChip[];
  testimonial?: AuthTestimonial;
  heroImageUrl?: string;
  heroBadge?: string;
  /** When false, renders split card only (e.g. embedded flows). */
  showChrome?: boolean;
  children: ReactNode;
}) {
  const leftPane = (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--mkt-accent-deep)] p-10 text-white lg:flex xl:p-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,rgba(142,211,205,0.28),transparent_55%)]" />

      <div className="relative">
        {eyebrow ? (
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-4xl font-bold leading-[1.1] text-white">{headline}</h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">{copy}</p>

        {stats?.length ? (
          <ul className="mt-8 flex flex-wrap gap-2">
            {stats.map((chip) => (
              <li
                key={chip.label}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs backdrop-blur-sm"
              >
                <span className="font-semibold text-white">{chip.value}</span>
                <span className="ml-1.5 text-white/60">{chip.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="relative mt-10 space-y-6">
        {heroImageUrl ? (
          <div className="relative max-w-sm overflow-hidden rounded-2xl border border-white/15 shadow-lg">
            <Image
              src={heroImageUrl}
              alt=""
              width={480}
              height={280}
              className="h-auto w-full object-cover"
            />
            {heroBadge ? (
              <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--mkt-accent-deep)]">
                {heroBadge}
              </span>
            ) : null}
          </div>
        ) : null}

        {testimonial ? (
          <figure className="max-w-md rounded-2xl border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
            <blockquote className="text-sm leading-relaxed text-white/85">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-xs text-white/55">
              <span className="font-semibold text-white/80">{testimonial.name}</span>
              {testimonial.role ? (
                <span className="text-white/50"> · {testimonial.role}</span>
              ) : null}
            </figcaption>
          </figure>
        ) : null}

        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">
          Aroxes Infrastructure Group · SOC2 &amp; ISO ready
        </p>
      </div>
    </aside>
  );

  const rightPane = (
    <div className="flex flex-col justify-center bg-[var(--mkt-canvas)] px-4 py-12 sm:px-8 lg:py-16">
      <div className="mkt-card mx-auto w-full max-w-[440px] rounded-2xl p-6 sm:p-8">{children}</div>
    </div>
  );

  const split = (
    <div className="grid min-h-[min(100vh,56rem)] flex-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      {leftPane}
      {rightPane}
    </div>
  );

  if (!showChrome) {
    return <div className="public-shell min-h-screen bg-[var(--mkt-canvas)]">{split}</div>;
  }

  return (
    <div className="marketing-shell flex min-h-screen flex-col bg-[var(--mkt-canvas)]">
      <SiteHeader variant="marketing" />
      <main className="flex flex-1 flex-col">{split}</main>
      <AppFooter />
    </div>
  );
}

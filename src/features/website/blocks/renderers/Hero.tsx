import Image from "next/image";
import Link from "next/link";
import { Building2, CreditCard, Nfc, Radio, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { BlockDataMap } from "../schemas";
import { HeroCommandPanel } from "./HeroCommandPanel";
import { SectionShell, hasText } from "./shared";

const TRUST_ICONS: Record<string, typeof Zap> = {
  zap: Zap,
  fast: Zap,
  registration: Zap,
  nfc: Nfc,
  ticket: CreditCard,
  ticketing: CreditCard,
  rfid: Radio,
  tracking: Radio,
  partner: ShieldCheck,
  verified: ShieldCheck,
  building: Building2,
};

function TrustIcon({ name }: { name?: string }) {
  const key = (name ?? "").trim().toLowerCase();
  const Icon = TRUST_ICONS[key] ?? Sparkles;
  return <Icon className="h-4 w-4 shrink-0 text-[var(--mkt-accent-deep)]" aria-hidden="true" />;
}

export function HeroRenderer({ data }: { data: BlockDataMap["hero"] }) {
  if (!hasText(data.headline)) return null;

  const primary = data.primaryCta;
  const secondary = data.secondaryCta;
  const trustLogos = (data.trustLogos ?? []).filter((l) => hasText(l.name));
  const showCommand = Boolean(
    data.command && hasText(data.command.title || data.command.eventName),
  );
  const showImage = !showCommand && hasText(data.imageUrl);

  const pLabel = primary?.label?.trim();
  const pHref = primary?.href?.trim();
  const sLabel = secondary?.label?.trim();
  const sHref = secondary?.href?.trim();

  return (
    <SectionShell className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14 lg:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_80%_0%,color-mix(in_srgb,var(--mkt-surface)_100%,transparent),transparent_70%)]" />
      <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <div>
          {(hasText(data.eyebrow) || hasText(data.statusLine)) && (
            <div className="mb-5 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-muted)]">
              {hasText(data.eyebrow) ? (
                <span className="inline-flex items-center gap-1.5 text-[var(--mkt-accent-deep)]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {data.eyebrow.trim()}
                </span>
              ) : null}
              {hasText(data.statusLine) ? (
                <span className="text-[var(--mkt-muted)]">{data.statusLine.trim()}</span>
              ) : null}
            </div>
          )}

          <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-[var(--mkt-ink)] sm:text-5xl lg:text-[3.5rem]">
            {data.headline.trim()}
          </h1>

          {hasText(data.subheadline) ? (
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--mkt-muted)] sm:text-base">
              {data.subheadline.trim()}
            </p>
          ) : null}

          {(pLabel && pHref) || (sLabel && sHref) ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {pLabel && pHref ? (
                <Link
                  href={pHref}
                  className="mkt-btn inline-flex h-11 items-center gap-1.5 rounded-xl px-5 text-sm font-semibold transition"
                >
                  {pLabel}
                </Link>
              ) : null}
              {sLabel && sHref ? (
                <Link
                  href={sHref}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-5 text-sm font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)]"
                >
                  {sLabel}
                </Link>
              ) : null}
            </div>
          ) : null}

          {hasText(data.trustLine) && trustLogos.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--mkt-muted)]">{data.trustLine.trim()}</p>
          ) : null}

          {trustLogos.length > 0 ? (
            <div className="mt-10 rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)]/80 px-4 py-4 sm:px-5">
              {hasText(data.trustTitle) ? (
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mkt-muted)]">
                  {data.trustTitle.trim()}
                </p>
              ) : null}
              <ul className="grid gap-3 sm:grid-cols-2">
                {trustLogos.map((logo) => {
                  const name = logo.name.trim();
                  const inner = (
                    <span className="inline-flex items-center gap-2.5 text-sm font-medium text-[var(--mkt-ink)]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mkt-accent-tint)]">
                        <TrustIcon name={logo.icon} />
                      </span>
                      {name}
                    </span>
                  );
                  return (
                    <li key={name}>
                      {hasText(logo.href) ? (
                        <Link href={logo.href.trim()} className="transition hover:opacity-80">
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        {showCommand && data.command ? <HeroCommandPanel command={data.command} /> : null}

        {showImage ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] shadow-[0_20px_50px_-24px_rgba(8,31,31,0.35)]">
            <Image
              src={data.imageUrl.trim()}
              alt={hasText(data.imageAlt) ? data.imageAlt.trim() : ""}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 560px"
              priority
            />
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

import Link from "next/link";
import type { BlockDataMap } from "../schemas";
import { CtaButtons, SectionShell, hasText } from "./shared";

export function CtaRenderer({ data }: { data: BlockDataMap["cta"] }) {
  if (!hasText(data.headline)) return null;

  const variant = data.variant === "buttons" ? "buttons" : "email";
  const kicker = hasText(data.kicker)
    ? data.kicker.trim()
    : variant === "email"
      ? "Zero setup fee · Instant activation"
      : "";
  const pLabel = data.primaryCta?.label?.trim();
  const pHref = data.primaryCta?.href?.trim();
  const sLabel = data.secondaryCta?.label?.trim();
  const sHref = data.secondaryCta?.href?.trim();

  if (variant === "buttons") {
    if (!pLabel && !sLabel) return null;
    return (
      <SectionShell dark>
        <div className="mx-auto max-w-3xl text-center">
          {kicker ? (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              {kicker}
            </p>
          ) : null}
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {data.headline.trim()}
          </h2>
          {hasText(data.body) ? (
            <p className="mt-4 text-base leading-relaxed text-white/70">{data.body.trim()}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {pLabel && pHref ? (
              <Link
                href={pHref}
                className="inline-flex h-11 items-center rounded-xl bg-[var(--mkt-accent-soft)] px-5 text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:bg-white"
              >
                {pLabel}
              </Link>
            ) : null}
            {sLabel && sHref ? (
              <Link
                href={sHref}
                className="inline-flex h-11 items-center rounded-xl border border-white/35 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                {sLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </SectionShell>
    );
  }

  const signupHref = pHref || "/auth/signup";
  const placeholder = hasText(data.emailPlaceholder)
    ? data.emailPlaceholder.trim()
    : "Enter your work email";

  return (
    <SectionShell dark>
      <div className="mx-auto max-w-2xl text-center">
        {kicker ? (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
            {kicker}
          </p>
        ) : null}
        <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {data.headline.trim()}
        </h2>
        {hasText(data.body) ? (
          <p className="mt-4 text-base leading-relaxed text-white/70">{data.body.trim()}</p>
        ) : null}

        <form
          action={signupHref}
          method="get"
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="mkt-cta-email">
            Email
          </label>
          <input
            id="mkt-cta-email"
            name="email"
            type="email"
            placeholder={placeholder}
            className="h-11 flex-1 rounded-xl border border-white/25 bg-white/10 px-4 text-sm text-white placeholder:text-white/55 focus:border-white/50 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:bg-[var(--mkt-accent-tint)]"
          >
            {pLabel || "Get started"}
          </button>
        </form>

        {sLabel && sHref ? (
          <div className="mt-4 flex justify-center">
            <CtaButtons secondary={data.secondaryCta} dark />
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/55">
            Or{" "}
            <Link href="/plans" className="underline underline-offset-2 hover:text-white">
              see plans
            </Link>
          </p>
        )}
      </div>
    </SectionShell>
  );
}

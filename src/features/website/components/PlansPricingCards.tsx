"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  formatAnnualEffectiveMonthly,
  formatPlanPrice,
  planHasAnnualSavings,
  withBillingPeriod,
  type PlanBillingPeriod,
} from "../marketingData.logic";

export type PlansCardPlan = {
  id: string;
  key: string;
  name: string;
  tagline: string;
  badgeText: string;
  billingNote: string;
  ctaLabel: string;
  ctaHref: string;
  currency: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  isRecommended: boolean;
  features: string[];
};

function tierLabel(plan: PlansCardPlan): string {
  if (plan.badgeText && !plan.isRecommended) return plan.badgeText;
  if (plan.key === "free") return "Starter tier";
  if (plan.key === "enterprise" || plan.key === "campus") return "Institutional scale";
  if (plan.isRecommended) return "Most popular";
  return plan.tagline || "Plan";
}

export function PlansPricingCards({ plans }: { plans: PlansCardPlan[] }) {
  const [period, setPeriod] = useState<PlanBillingPeriod>("month");
  const showAnnual = useMemo(
    () => plans.some((p) => p.priceYearly != null && Number(p.priceYearly) > 0),
    [plans],
  );
  const annualSavings = useMemo(
    () =>
      plans.some((p) =>
        planHasAnnualSavings({
          price_monthly: p.priceMonthly,
          price_yearly: p.priceYearly,
        }),
      ),
    [plans],
  );
  const hasEnterprise = plans.some(
    (p) => p.key === "enterprise" || p.key === "campus" || /enterprise|campus/i.test(p.name),
  );

  return (
    <>
      {showAnnual ? (
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-panel)] p-1 shadow-[var(--mkt-card-shadow)]">
            <button
              type="button"
              onClick={() => setPeriod("month")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                period === "month"
                  ? "bg-[var(--mkt-btn)] text-[var(--mkt-btn-fg)]"
                  : "text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]"
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setPeriod("year")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                period === "year"
                  ? "bg-[var(--mkt-btn)] text-[var(--mkt-btn-fg)]"
                  : "text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]"
              }`}
            >
              Annual billing
              {annualSavings ? (
                <span className="rounded-full bg-[var(--mkt-accent-tint)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--mkt-accent-deep)]">
                  Save 20%
                </span>
              ) : null}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[var(--mkt-max,80rem)] gap-6 lg:grid-cols-3 lg:items-stretch">
        {plans.map((plan) => {
          const recommended = plan.isRecommended;
          const isEnterprise = plan.key === "enterprise" || plan.key === "campus";
          const priceFields = {
            currency: plan.currency,
            price_monthly: plan.priceMonthly,
            price_yearly: plan.priceYearly,
          };
          const priceLabel = isEnterprise ? "Custom Quote" : formatPlanPrice(priceFields, period);
          const annualSubline =
            !isEnterprise && period === "year" ? formatAnnualEffectiveMonthly(priceFields) : null;
          const baseHref =
            plan.ctaHref ||
            (isEnterprise
              ? "/contact?topic=enterprise"
              : `/auth/signup?plan=${encodeURIComponent(plan.key)}`);
          const href = isEnterprise ? baseHref : withBillingPeriod(baseHref, period);
          const cta = plan.ctaLabel || (recommended ? "Upgrade to Pro" : "Get started free");

          return (
            <article
              key={plan.id}
              className={`mkt-card relative flex flex-col rounded-2xl p-6 sm:p-7 ${
                recommended
                  ? "border-[var(--mkt-accent)] lg:-translate-y-1 lg:shadow-[0_20px_50px_-24px_rgba(6,78,59,0.45)]"
                  : ""
              }`}
            >
              {recommended ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--mkt-btn)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-btn-fg)]">
                  {plan.badgeText || "Recommended"} · Most popular
                </span>
              ) : (
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-muted)]">
                  {tierLabel(plan)}
                </p>
              )}

              <h2
                className={`font-display text-2xl font-semibold text-[var(--mkt-ink)] ${
                  recommended ? "mt-3" : "mt-2"
                }`}
              >
                {plan.name}
              </h2>
              {plan.tagline ? (
                <p className="mt-2 text-sm text-[var(--mkt-muted)]">{plan.tagline}</p>
              ) : null}

              <p className="mt-5 font-display text-3xl font-bold tracking-tight text-[var(--mkt-ink)]">
                {priceLabel}
              </p>
              {annualSubline ? (
                <p className="mt-1 text-xs text-[var(--mkt-muted)]">{annualSubline}</p>
              ) : null}
              {plan.billingNote ? (
                <p className="mt-2 text-xs text-[var(--mkt-muted)]">{plan.billingNote}</p>
              ) : null}

              {plan.features.length > 0 ? (
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[var(--mkt-muted)]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mkt-accent)]"
                        aria-hidden="true"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1" />
              )}

              <Link
                href={href}
                className={`mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
                  recommended
                    ? "mkt-btn"
                    : "border border-[var(--mkt-line)] bg-[var(--mkt-panel)] text-[var(--mkt-ink)] hover:border-[var(--mkt-accent)] hover:bg-[var(--mkt-accent-tint)]"
                }`}
              >
                {cta}
              </Link>
            </article>
          );
        })}

        {!hasEnterprise ? (
          <article className="mkt-card flex flex-col rounded-2xl p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-muted)]">
              Institutional scale
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--mkt-ink)]">
              Enterprise &amp; Campus
            </h2>
            <p className="mt-2 text-sm text-[var(--mkt-muted)]">
              Multi-department tenancy, custom modules, and volume procurement.
            </p>
            <p className="mt-5 font-display text-3xl font-bold tracking-tight text-[var(--mkt-ink)]">
              Custom Quote
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[var(--mkt-muted)]">
              {[
                "Department and club hierarchy",
                "Custom module bundles",
                "Priority onboarding",
                "Volume email & storage",
                "SSO / campus SSO options",
                "Dedicated success contact",
              ].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mkt-accent)]"
                    aria-hidden="true"
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/contact?topic=enterprise"
              className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] px-4 text-sm font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)] hover:bg-[var(--mkt-accent-tint)]"
            >
              Contact Enterprise Sales
            </Link>
          </article>
        ) : null}
      </div>
    </>
  );
}

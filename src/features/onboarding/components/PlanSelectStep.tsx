"use client";

import { useEffect, useState, useTransition } from "react";
import type { PlanRow } from "@/src/features/saas/saas.service";
import type { PlatformBillingSettings } from "@/src/features/billing/billing.service";
import { planIsFree } from "@/src/features/onboarding/planHelpers";
import {
  formatAnnualEffectiveMonthly,
  formatPlanPrice,
  type PlanBillingPeriod,
} from "@/src/features/website/marketingData.logic";

export function PlanSelectStep({
  plans,
  billing,
  billingPeriod = "month",
  initialPlanKey,
  onSelectFree,
  onSubmitPaid,
}: {
  plans: PlanRow[];
  billing: PlatformBillingSettings;
  billingPeriod?: PlanBillingPeriod;
  initialPlanKey?: string;
  onSelectFree: (planKey: string) => Promise<{ success: boolean; error?: string } | void>;
  onSubmitPaid: (input: {
    planKey: string;
    file: File;
  }) => Promise<{ success: boolean; error?: string } | void>;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paidKey, setPaidKey] = useState<string | null>(null);
  const paidPlan = plans.find((p) => p.key === paidKey) || null;
  const period: PlanBillingPeriod = billingPeriod === "year" ? "year" : "month";

  useEffect(() => {
    if (!initialPlanKey) return;
    const match = plans.find((p) => p.key === initialPlanKey);
    if (!match) return;
    if (planIsFree(match)) return;
    setPaidKey(initialPlanKey);
  }, [initialPlanKey, plans]);

  return (
    <div className="mkt-card w-full max-w-2xl space-y-6 rounded-2xl p-6 sm:p-8">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--mkt-ink)]">Choose a plan</h2>
        <p className="mt-1 text-sm text-[var(--mkt-muted)]">
          Free plans open your dashboard after profile review. Paid plans need a bank transfer and
          platform approval.
        </p>
        {period === "year" ? (
          <p className="mt-2 text-xs font-medium text-[var(--mkt-accent-deep)]">
            Showing annual billing from your signup link.
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {!paidPlan ? (
        <ul className="grid gap-4 sm:grid-cols-1">
          {plans.map((plan) => {
            const free = planIsFree(plan);
            const recommended = plan.key === "pro" || plan.key === "organizer_pro";
            const priceLabel = free ? "Free" : formatPlanPrice(plan, period);
            const annualSub =
              !free && period === "year" ? formatAnnualEffectiveMonthly(plan) : null;
            const highlighted = initialPlanKey === plan.key;

            return (
              <li
                key={plan.key}
                className={`rounded-2xl border p-5 transition ${
                  highlighted || recommended
                    ? "border-[var(--mkt-accent)] bg-[var(--mkt-accent-tint)] shadow-[var(--mkt-card-shadow)]"
                    : "border-[var(--mkt-line)] bg-[var(--mkt-panel)]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <PlanTitleRow recommended={recommended} plan={plan} />
                    {plan.description ? (
                      <p className="mt-1 text-sm text-[var(--mkt-muted)]">{plan.description}</p>
                    ) : null}
                    <p className="mt-3 font-display text-lg font-semibold tabular-nums text-[var(--mkt-ink)]">
                      {priceLabel}
                    </p>
                    {annualSub ? (
                      <p className="text-xs text-[var(--mkt-muted)]">{annualSub}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    className="mkt-btn shrink-0 rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-50"
                    onClick={() =>
                      start(async () => {
                        setError(null);
                        if (free) {
                          const r = await onSelectFree(plan.key);
                          if (r && !r.success) setError(r.error || "Could not select plan.");
                        } else {
                          setPaidKey(plan.key);
                        }
                      })
                    }
                  >
                    {free ? "Continue free" : "Select & pay"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            className="text-xs font-semibold text-[var(--mkt-muted)] underline"
            onClick={() => setPaidKey(null)}
          >
            ← Back to plans
          </button>
          <h3 className="font-display font-semibold text-[var(--mkt-ink)]">
            Pay for {paidPlan.name}
          </h3>
          <p className="text-sm text-[var(--mkt-muted)]">
            Amount:{" "}
            <strong className="text-[var(--mkt-ink)]">{formatPlanPrice(paidPlan, period)}</strong>
          </p>
          <div className="rounded-xl border border-[var(--mkt-line)] bg-[var(--mkt-canvas)] px-4 py-3 text-sm text-[var(--mkt-ink)]">
            <p className="font-medium">Transfer to</p>
            <ul className="mt-2 space-y-1 text-[var(--mkt-muted)]">
              {billing.bankName ? <li>Bank: {billing.bankName}</li> : null}
              {billing.accountTitle ? <li>Title: {billing.accountTitle}</li> : null}
              {billing.accountNumber ? <li>Account: {billing.accountNumber}</li> : null}
              {billing.iban ? <li>IBAN: {billing.iban}</li> : null}
              {billing.branch ? <li>Branch: {billing.branch}</li> : null}
              {billing.jazzcash ? <li>JazzCash: {billing.jazzcash}</li> : null}
              {billing.easypaisa ? <li>EasyPaisa: {billing.easypaisa}</li> : null}
            </ul>
            {billing.instructions ? (
              <p className="mt-3 text-[var(--mkt-muted)]">{billing.instructions}</p>
            ) : null}
            {!billing.bankName && !billing.accountNumber && !billing.iban ? (
              <p className="mt-2 text-amber-800">
                Platform bank details are not configured yet. Ask the SaaS owner to set them under
                Admin → Billing.
              </p>
            ) : null}
          </div>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const file = fd.get("screenshot");
              if (!(file instanceof File) || file.size <= 0) {
                setError("Upload a payment screenshot.");
                return;
              }
              start(async () => {
                setError(null);
                const r = await onSubmitPaid({ planKey: paidPlan.key, file });
                if (r && !r.success) setError(r.error || "Upload failed.");
              });
            }}
          >
            <label className="block text-sm text-[var(--mkt-ink)]">
              Payment screenshot
              <input
                name="screenshot"
                type="file"
                accept="image/*,application/pdf"
                required
                className="mt-1 block w-full text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="mkt-btn rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {pending ? "Uploading…" : "Submit for approval"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function PlanTitleRow({ recommended, plan }: { recommended: boolean; plan: PlanRow }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="font-semibold text-[var(--mkt-ink)]">{plan.name}</p>
      {recommended ? (
        <span className="rounded-full bg-[var(--mkt-accent-deep)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Popular
        </span>
      ) : null}
    </div>
  );
}

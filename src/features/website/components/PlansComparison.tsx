import { Fragment } from "react";
import Link from "next/link";
import { Building2, Check, ChevronDown, Receipt, ShieldCheck } from "lucide-react";
import type { ModuleComparison, MarketingFaq, PublicPlan } from "../marketingData.service";
import { shouldHideEmptySection } from "../marketingData.logic";
import { PlansPricingCards, type PlansCardPlan } from "./PlansPricingCards";

function groupModules(modules: ModuleComparison["modules"]) {
  const map = new Map<string, ModuleComparison["modules"]>();
  for (const m of modules) {
    const key = m.category || "Other";
    const list = map.get(key) ?? [];
    list.push(m);
    map.set(key, list);
  }
  return [...map.entries()];
}

function featureListForPlan(plan: PublicPlan, comparison: ModuleComparison): string[] {
  const highlights = (plan.highlight_features ?? []).map((f) => f.trim()).filter(Boolean);
  if (highlights.length > 0) return highlights;
  return comparison.modules
    .filter((m) => m.includedByPlanKey[plan.key])
    .slice(0, 7)
    .map((m) => m.label);
}

function toCardPlans(plans: PublicPlan[], comparison: ModuleComparison): PlansCardPlan[] {
  return plans.map((plan) => ({
    id: plan.id,
    key: plan.key,
    name: plan.name,
    tagline: plan.tagline ?? "",
    badgeText: plan.badge_text ?? "",
    billingNote: plan.billing_note ?? "",
    ctaLabel: plan.cta_label ?? "",
    ctaHref: plan.cta_href ?? "",
    currency: plan.currency || "PKR",
    priceMonthly: plan.price_monthly == null ? null : Number(plan.price_monthly),
    priceYearly: plan.price_yearly == null ? null : Number(plan.price_yearly),
    isRecommended: Boolean(plan.is_recommended),
    features: featureListForPlan(plan, comparison),
  }));
}

export function PlansPageContent({
  plans,
  comparison,
  faqs,
}: {
  plans: PublicPlan[];
  comparison: ModuleComparison;
  faqs: MarketingFaq[];
}) {
  const hidePlans = shouldHideEmptySection(plans);
  const cardPlans = toCardPlans(plans, comparison);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pb-6 pt-16 lg:px-10 lg:pb-8 lg:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_0%,color-mix(in_srgb,var(--mkt-surface)_100%,transparent),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--mkt-ink)] sm:text-5xl">
            Simple plans for every event size.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--mkt-muted)]">
            Transparent pricing from the live catalog. Start free, upgrade when you need more
            modules, or talk to us for campus and enterprise networks.
          </p>
        </div>
      </section>

      {hidePlans ? null : (
        <section className="px-6 pb-16 lg:px-10">
          <PlansPricingCards plans={cardPlans} />
        </section>
      )}

      {!shouldHideEmptySection(comparison.modules) && !shouldHideEmptySection(comparison.plans) ? (
        <section className="border-t border-[var(--mkt-line)] bg-[var(--mkt-surface-low)] px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-[var(--mkt-max,80rem)]">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--mkt-ink)]">
              Capabilities &amp; modules
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-[var(--mkt-muted)]">
              Live module catalog compared across public plans. Updates when owners change plan
              modules in the dashboard.
            </p>
            <div className="mkt-card mt-8 overflow-x-auto rounded-2xl">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--mkt-line)] bg-[var(--mkt-accent-tint)]">
                    <th className="px-4 py-3.5 font-semibold text-[var(--mkt-ink)]">
                      Capabilities &amp; modules
                    </th>
                    {comparison.plans.map((p) => (
                      <th
                        key={p.key}
                        className="px-4 py-3.5 text-center font-semibold text-[var(--mkt-ink)]"
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupModules(comparison.modules).map(([category, mods]) => (
                    <Fragment key={`cat-${category}`}>
                      <tr className="border-t border-[var(--mkt-line)] bg-[var(--mkt-surface)]">
                        <td
                          colSpan={comparison.plans.length + 1}
                          className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--mkt-accent-deep)]"
                        >
                          {category}
                        </td>
                      </tr>
                      {mods.map((mod, idx) => (
                        <tr
                          key={mod.key}
                          className={`border-t border-[var(--mkt-line)] ${
                            idx % 2 === 0 ? "bg-[var(--mkt-panel)]" : "bg-[var(--mkt-surface)]/60"
                          }`}
                        >
                          <td className="px-4 py-3 align-top">
                            <p className="font-medium text-[var(--mkt-ink)]">{mod.label}</p>
                            {mod.description ? (
                              <p className="mt-0.5 text-xs text-[var(--mkt-muted)]">
                                {mod.description}
                              </p>
                            ) : null}
                          </td>
                          {comparison.plans.map((p) => (
                            <td key={p.key} className="px-4 py-3 text-center">
                              {mod.includedByPlanKey[p.key] ? (
                                <Check
                                  className="mx-auto h-4 w-4 text-[var(--mkt-accent)]"
                                  aria-label="Included"
                                />
                              ) : (
                                <span className="text-[var(--mkt-muted)]" aria-label="Not included">
                                  —
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                  {comparison.emailCaps.hasCaps ? (
                    <Fragment key="email-caps">
                      <tr className="border-t border-[var(--mkt-line)] bg-[var(--mkt-surface)]">
                        <td
                          colSpan={comparison.plans.length + 1}
                          className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--mkt-accent-deep)]"
                        >
                          Email limits
                        </td>
                      </tr>
                      <tr className="border-t border-[var(--mkt-line)] bg-[var(--mkt-panel)]">
                        <td className="px-4 py-3 font-medium text-[var(--mkt-ink)]">
                          Daily email cap
                        </td>
                        {comparison.plans.map((p) => (
                          <td key={p.key} className="px-4 py-3 text-center text-[var(--mkt-muted)]">
                            {comparison.emailCaps.dailyByPlanKey[p.key] ?? "—"}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-[var(--mkt-line)] bg-[var(--mkt-surface)]/60">
                        <td className="px-4 py-3 font-medium text-[var(--mkt-ink)]">
                          Monthly email cap
                        </td>
                        {comparison.plans.map((p) => (
                          <td key={p.key} className="px-4 py-3 text-center text-[var(--mkt-muted)]">
                            {comparison.emailCaps.monthlyByPlanKey[p.key] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    </Fragment>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {!shouldHideEmptySection(faqs) ? (
        <section className="border-t border-[var(--mkt-line)] px-6 py-16 lg:px-10">
          <div className="mx-auto grid max-w-[var(--mkt-max,80rem)] gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--mkt-ink)]">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-muted)]">
                Billing, bank transfer, and what changes when you upgrade. Managed in the owner
                Website FAQ tab.
              </p>
            </div>
            <div className="mkt-card divide-y divide-[var(--mkt-line)] rounded-2xl">
              {faqs.map((item) => (
                <details key={item.id} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-[var(--mkt-ink)] marker:content-none [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-[var(--mkt-muted)] transition group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--mkt-muted)]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-6 pb-16 pt-4 lg:px-10">
        <div className="mx-auto max-w-[var(--mkt-max,80rem)] overflow-hidden rounded-3xl bg-[var(--mkt-accent-deep)] px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Managing a university network or enterprise conference series?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              We help departments, clubs, and multi-event organizers with custom tenancy,
              procurement, and rollout support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact?topic=enterprise"
                className="inline-flex h-11 items-center rounded-xl bg-[var(--mkt-accent-soft)] px-5 text-sm font-semibold text-[var(--mkt-accent-deep)] transition hover:bg-white"
              >
                Speak with Campus Team
              </Link>
              <Link
                href="/partners"
                className="inline-flex h-11 items-center rounded-xl border border-white/35 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Explore Partner Directory
              </Link>
            </div>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/75">
            <li className="inline-flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[var(--mkt-accent-soft)]" aria-hidden="true" />
              Formal bank-transfer invoices
            </li>
            <li className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--mkt-accent-soft)]" aria-hidden="true" />
              Campus &amp; department tenancy
            </li>
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--mkt-accent-soft)]" aria-hidden="true" />
              Role-based access &amp; audit trails
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}

import { formatCurrency } from "@/src/lib/money";
import { formatDateMedium } from "@/src/lib/datetime";
import type { PublicEventDto } from "@/src/features/events/types";

/** Public pricing tiers + automatic student/group discounts (no promo material). */
export function PublicTiersAndDiscounts({ dto }: { dto: PublicEventDto }) {
  if (dto.isHackathon) return null;

  const multiTiers = dto.pricingTiers.length > 1;
  const singleTier = dto.pricingTiers.length === 1 ? dto.pricingTiers[0]! : null;
  const hasDiscounts = dto.discounts.length > 0;

  if (!multiTiers && !singleTier && !hasDiscounts) {
    return null;
  }
  if (dto.isFree && !hasDiscounts && dto.pricingTiers.every((t) => t.price <= 0)) {
    return null;
  }

  const sectionTitle =
    hasDiscounts && !singleTier && !multiTiers
      ? "Discounts"
      : multiTiers
        ? "Admission & discounts"
        : "Tickets & discounts";

  return (
    <section className="space-y-4">
      <h2 className="font-display text-lg text-ink">{sectionTitle}</h2>

      {multiTiers ? (
        <p className="text-sm text-ink-soft">
          {dto.admissionLabel}. Choose your ticket in the registration panel on the right.
        </p>
      ) : singleTier ? (
        <div className="rounded-2xl border border-line bg-paper p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-ink">{singleTier.name}</p>
            <p className="shrink-0 font-display text-base text-ink">
              {formatCurrency(singleTier.price, dto.currency, "Free")}
            </p>
          </div>
          {singleTier.description ? (
            <p className="mt-1 break-words text-xs text-ink-soft">{singleTier.description}</p>
          ) : null}
          <ul className="mt-3 space-y-1 text-2xs text-ink-soft">
            {singleTier.availableUntil ? (
              <li>Available until {formatDateMedium(singleTier.availableUntil)}</li>
            ) : (
              <li>Available now</li>
            )}
            {singleTier.seatsLeft != null ? (
              <li>
                {singleTier.seatsLeft} seat{singleTier.seatsLeft === 1 ? "" : "s"} left
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {hasDiscounts ? (
        <ul className="space-y-2">
          {dto.discounts.map((d) => (
            <li
              key={d.kind}
              className="rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm text-ink"
            >
              {d.kind === "student" ? (
                <>
                  Student discount: <strong>{d.percentage}%</strong>
                  {d.requiresVerification ? " (verification required)" : ""}
                </>
              ) : (
                <>
                  Group discount: <strong>{d.percentage}%</strong>
                  {d.minGroupSize ? ` for groups of ${d.minGroupSize}+` : ""}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateMedium } from "@/src/lib/datetime";
import { formatCurrency } from "@/src/lib/money";
import {
  RegistrationForm,
  type CompetitionChoice,
  type RegistrationFormProps,
} from "@/src/features/registration/components/RegistrationForm";
import type { PublicPricingTier } from "@/src/features/events/types";

type Props = Omit<
  RegistrationFormProps,
  "selectedTicketTier" | "currency" | "promoTicketTierId"
> & {
  pricingTiers: PublicPricingTier[];
  currency: string;
  showSkuTierPicker: boolean;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function PublicRegisterFormBlock({
  pricingTiers,
  currency,
  showSkuTierPicker,
  competitions = [],
  priceLabel: priceLabelProp,
  isPaid,
  ...formProps
}: Props) {
  const selectableTiers = useMemo(
    () =>
      showSkuTierPicker ? pricingTiers.filter((t) => t.seatsLeft == null || t.seatsLeft > 0) : [],
    [pricingTiers, showSkuTierPicker],
  );

  const [ticketTierId, setTicketTierId] = useState(() => selectableTiers[0]?.id ?? "");

  useEffect(() => {
    if (!showSkuTierPicker) return;
    if (!selectableTiers.some((t) => t.id === ticketTierId)) {
      setTicketTierId(selectableTiers[0]?.id ?? "");
    }
  }, [selectableTiers, showSkuTierPicker, ticketTierId]);

  const selectedTier =
    showSkuTierPicker && ticketTierId
      ? (pricingTiers.find((t) => t.id === ticketTierId) ?? selectableTiers[0] ?? null)
      : null;

  const priceLabel =
    !competitions.length && selectedTier
      ? formatCurrency(selectedTier.price, currency, "Free")
      : priceLabelProp;

  return (
    <div className="space-y-4">
      {showSkuTierPicker && selectableTiers.length > 0 ? (
        <TicketSkuTierPicker
          tiers={pricingTiers}
          currency={currency}
          selectedId={ticketTierId}
          onSelect={setTicketTierId}
        />
      ) : null}
      <RegistrationForm
        {...formProps}
        competitions={competitions}
        isPaid={isPaid}
        priceLabel={priceLabel}
        currency={currency}
        selectedTicketTier={selectedTier}
        promoTicketTierId={
          selectedTier?.id && UUID_RE.test(selectedTier.id) ? selectedTier.id : null
        }
      />
    </div>
  );
}

function TicketSkuTierPicker({
  tiers,
  currency,
  selectedId,
  onSelect,
}: {
  tiers: PublicPricingTier[];
  currency: string;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-2xs font-medium uppercase tracking-wide text-[var(--mkt-muted)]">
        {tiers.length > 1 ? "Choose your ticket" : "Your ticket"}
      </legend>
      <div className="flex flex-col gap-2">
        {tiers.map((t) => {
          const soldOut = t.seatsLeft === 0;
          const active = t.id === selectedId && !soldOut;
          return (
            <label
              key={t.id}
              className={`cursor-pointer rounded-xl border px-3 py-3 transition ${
                soldOut
                  ? "cursor-not-allowed border-[var(--mkt-line)] bg-[var(--mkt-canvas)] opacity-60"
                  : active
                    ? "border-[var(--mkt-accent)] bg-[var(--mkt-accent-tint)] shadow-[var(--mkt-card-shadow)]"
                    : "border-[var(--mkt-line)] bg-[var(--mkt-panel)] hover:border-[var(--mkt-accent)]"
              }`}
            >
              <input
                type="radio"
                name="ticketTierChoice"
                value={t.id}
                checked={active}
                disabled={soldOut}
                onChange={() => onSelect(t.id)}
                className="sr-only"
              />
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-[var(--mkt-ink)]">{t.name}</span>
                <span className="text-xs tabular-nums text-[var(--mkt-muted)]">
                  {soldOut ? "Sold out" : formatCurrency(t.price, currency, "Free")}
                </span>
              </span>
              {t.description ? (
                <span className="mt-1 block text-xs text-[var(--mkt-muted)]">{t.description}</span>
              ) : null}
              <span className="mt-1 block text-2xs text-[var(--mkt-muted)]">
                {t.availableUntil ? `Until ${formatDateMedium(t.availableUntil)}` : "Available now"}
                {t.seatsLeft != null ? ` · ${t.seatsLeft} left` : ""}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export type { CompetitionChoice };

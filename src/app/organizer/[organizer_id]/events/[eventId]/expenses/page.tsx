import { notFound } from "next/navigation";
import { assertEventActor } from "@/src/features/events/ownership";
import { ExpensesClient } from "@/src/features/event_expenses/components/ExpensesClient";
import {
  getEventBudgetTotal,
  getEventLedgerTotals,
  listEventExpenses,
  listEventLedgerLines,
} from "@/src/features/event_expenses/expenses.service";

export default async function EventExpensesPage({
  params,
  searchParams,
}: {
  params: Promise<{ organizer_id: string; eventId: string }>;
  searchParams: Promise<{ external_vendor_id?: string }>;
}) {
  const { organizer_id, eventId } = await params;
  const { external_vendor_id } = await searchParams;
  const event = await assertEventActor(eventId, "expenses");
  if (!event) notFound();

  const [lines, expenses, totals, budgetTotal] = await Promise.all([
    listEventLedgerLines(eventId),
    listEventExpenses(eventId),
    getEventLedgerTotals(eventId),
    getEventBudgetTotal(eventId),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-ink-soft">
          Event · Expenses
        </p>
        <h2 className="font-display text-xl text-ink">Expenses</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Event ledger — income, spend, budget, and manual entries for this event.
        </p>
      </div>
      <ExpensesClient
        eventId={eventId}
        organizerId={organizer_id}
        lines={lines}
        expenses={expenses}
        totals={totals}
        budgetTotal={budgetTotal}
        prefillVendorId={external_vendor_id || null}
        currency={event.pricing?.currency || "PKR"}
      />
    </div>
  );
}

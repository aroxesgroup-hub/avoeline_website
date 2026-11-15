"use client";

import { useRef, useState, useTransition } from "react";
import { ScanLine } from "lucide-react";
import { buttonClass } from "@/src/lib/ui";
import { lookupAndCheckInAction } from "@/src/features/event_attendee/actions/lookupCheckIn.action";
import { newClientRequestId } from "@/src/lib/clientRequestId";
import { PendingButton } from "@/src/shared_components/PendingButton";

export function CheckInLookupBar({ eventId }: { eventId: string }) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const requestIdRef = useRef(newClientRequestId());

  return (
    <form
      className="mb-6 rounded-xl border border-line bg-paper p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        const value = query.trim();
        if (!value) return;
        const clientRequestId = requestIdRef.current;
        startTransition(async () => {
          const result = await lookupAndCheckInAction({
            eventId,
            query: value,
            clientRequestId,
          });
          requestIdRef.current = newClientRequestId();
          if (!result.ok) {
            setError(result.error.message);
            return;
          }
          const d = result.data;
          setMessage(
            d.alreadyCheckedIn
              ? `${d.name || "Attendee"} (${d.shortCode}) was already checked in.`
              : `Checked in ${d.name || "attendee"} (${d.shortCode}) via ${
                  d.method === "qr_scan" ? "QR" : "short code"
                }.`,
          );
          setQuery("");
        });
      }}
    >
      <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft">
        Check in
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste QR contents or short code (AVO-…)"
          className="min-w-[16rem] flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
          autoComplete="off"
          spellCheck={false}
        />
        <PendingButton
          type="submit"
          pending={pending}
          pendingText="Checking…"
          disabled={!query.trim()}
          className={buttonClass("primary", "sm")}
        >
          <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
          Check in
        </PendingButton>
      </div>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </form>
  );
}

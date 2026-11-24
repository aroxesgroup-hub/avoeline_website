"use client";

import { useRef, useState, useTransition } from "react";
import { ScanLine } from "lucide-react";
import { buttonClass, fieldClass } from "@/src/lib/ui";
import { lookupAndCheckInAction } from "@/src/features/event_attendee/actions/lookupCheckIn.action";
import { newClientRequestId } from "@/src/lib/clientRequestId";
import { PendingButton } from "@/src/shared_components/PendingButton";
import { Card, CardBody } from "@/src/shared_components/ui/Card";

export function CheckInLookupBar({ eventId }: { eventId: string }) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const requestIdRef = useRef(newClientRequestId());

  return (
    <Card className="mb-6">
      <CardBody>
        <form
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
          <label className="block text-2xs font-medium uppercase tracking-wider text-ink-soft">
            Check in
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste QR contents or short code (AVO-…)"
              className={`${fieldClass} min-w-[16rem] flex-1`}
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
          {message ? <p className="mt-2 text-xs text-success">{message}</p> : null}
          {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
        </form>
      </CardBody>
    </Card>
  );
}

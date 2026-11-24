"use client";

import { useState, useTransition } from "react";
import type { ConnectionPublic } from "../types";
import { getCatalogEntry } from "../catalog";
import { accountPermissionChips, STATUS_LABEL } from "../lib/connectionCardHelpers";
import { formatSafeActionError } from "../lib/connectionUserErrors";
import { disconnectConnectionAction } from "../actions/connections.action";
import { ConnectDialog } from "./ConnectDialog";
import { buttonClass } from "@/src/lib/ui";

export function GoogleAccountCard({
  connection,
  ownerId,
  ownerType = "user",
  googleReady,
}: {
  connection: ConnectionPublic;
  ownerId: string;
  ownerType?: "user" | "org";
  googleReady: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reconnectOpen, setReconnectOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const chips = accountPermissionChips(connection);
  const emailEntry = getCatalogEntry("email.send")!;

  const initials = (connection.displayName || connection.providerEmail || "?")
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

  return (
    <section className="space-y-4 rounded-2xl border border-line bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {connection.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={connection.avatarUrl}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-sm font-medium text-ink"
              aria-hidden
            >
              {initials || "G"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">
              {connection.displayName || connection.providerEmail}
            </p>
            <p className="truncate text-sm text-ink-soft">{connection.providerEmail}</p>
            <p className="mt-1 text-xs text-ink-soft">
              <span
                className={
                  connection.status === "active"
                    ? "rounded-full bg-success-soft px-2 py-0.5 text-success"
                    : "rounded-full bg-warning-soft px-2 py-0.5 text-warning"
                }
              >
                {STATUS_LABEL[connection.status] || connection.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {connection.status !== "active" ? (
            <button
              type="button"
              disabled={pending || !googleReady}
              className={buttonClass("primary", "sm")}
              onClick={() => setReconnectOpen(true)}
            >
              Reconnect
            </button>
          ) : null}
          <button
            type="button"
            disabled={pending || !googleReady}
            className={buttonClass("secondary", "sm")}
            onClick={() => setAddOpen(true)}
          >
            Add another account
          </button>
          <button
            type="button"
            disabled={pending}
            className={buttonClass("destructive", "sm")}
            onClick={() =>
              start(async () => {
                const r = await disconnectConnectionAction({ connectionId: connection.id });
                if (!r.ok) setError(formatSafeActionError(r.error));
                else setError(null);
              })
            }
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Permissions">
        {chips.map((chip) => (
          <span
            key={chip.id}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              chip.enabled ? "bg-success-soft text-success" : "bg-canvas text-ink-soft"
            }`}
          >
            {chip.label}
            {chip.enabled ? "" : " · off"}
          </span>
        ))}
      </div>

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      <ConnectDialog
        open={reconnectOpen}
        onClose={() => setReconnectOpen(false)}
        entry={emailEntry}
        ownerId={ownerId}
        ownerType={ownerType}
        loginHint={connection.providerEmail}
      />
      <ConnectDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        entry={emailEntry}
        ownerId={ownerId}
        ownerType={ownerType}
      />
    </section>
  );
}

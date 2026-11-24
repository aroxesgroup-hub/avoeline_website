"use client";

import { useEffect, useState, useTransition } from "react";
import {
  commitAttendeeImportAction,
  downloadAttendeeImportTemplateAction,
  dryRunAttendeeImportAction,
  getAttendeeImportOptionsAction,
  parseAttendeeImportFileAction,
  parseAttendeeImportSheetAction,
  sendImportedAttendeeEmailsAction,
  undoAttendeeImportAction,
} from "./attendeeImport.action";
import type { ImportColumnKey, ImportFieldOption, ParsedImportTable } from "./attendeeImport.logic";
import { ATTENDEE_IMPORT_ROW_CAP } from "./attendeeImport.logic";
import { listMyDriveConnectionsAction } from "@/src/features/connections/actions/drive.action";
import { formatPickerUserError } from "@/src/features/connections/lib/pickerErrors";
import { buttonClass, fieldClass } from "@/src/lib/ui";
import { PAID_IMPORT_TOOLTIP } from "@/src/features/event_attendee/importGate";

type Preview =
  | { rowIndex: number; ok: true; email?: string }
  | { rowIndex: number; ok: false; error: string; email?: string };

type Step = "upload" | "map" | "preview" | "done";

export function AttendeeImportPanel({ eventId }: { eventId: string }) {
  const [pending, start] = useTransition();
  const [step, setStep] = useState<Step>("upload");
  const [options, setOptions] = useState<ImportFieldOption[]>([]);
  const [connections, setConnections] = useState<Array<{ id: string; email: string }>>([]);
  const [connectionId, setConnectionId] = useState("");
  const [table, setTable] = useState<ParsedImportTable | null>(null);
  const [columnMap, setColumnMap] = useState<ImportColumnKey[]>([]);
  const [previews, setPreviews] = useState<Preview[] | null>(null);
  const [willCreate, setWillCreate] = useState(0);
  const [paidBlocked, setPaidBlocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [registrationIds, setRegistrationIds] = useState<string[]>([]);
  const [createdCount, setCreatedCount] = useState(0);
  const [sendEmails, setSendEmails] = useState(false);
  const [emailsSent, setEmailsSent] = useState<string | null>(null);

  useEffect(() => {
    start(async () => {
      const [opts, conns] = await Promise.all([
        getAttendeeImportOptionsAction({ eventId }),
        listMyDriveConnectionsAction({}),
      ]);
      if (opts.ok) setOptions(opts.data.options);
      if (conns.ok) {
        setConnections(conns.data.connections);
        setConnectionId(conns.data.connections[0]?.id || "");
      }
    });
  }, [eventId]);

  const resetToUpload = () => {
    setStep("upload");
    setTable(null);
    setColumnMap([]);
    setPreviews(null);
    setWillCreate(0);
    setPaidBlocked(false);
    setBatchId(null);
    setRegistrationIds([]);
    setCreatedCount(0);
    setSendEmails(false);
    setEmailsSent(null);
    setMessage(null);
    setError(null);
  };

  const applyParsed = (data: {
    headers: string[];
    guessedMap: ImportColumnKey[];
    table: ParsedImportTable;
  }) => {
    setTable(data.table);
    setColumnMap(data.guessedMap);
    setPreviews(null);
    setWillCreate(0);
    setStep("map");
    setMessage(
      `Loaded ${data.table.rows.length} data row(s) (max ${ATTENDEE_IMPORT_ROW_CAP}). Map columns, then preview.`,
    );
    setError(null);
  };

  const downloadTemplate = () => {
    start(async () => {
      const r = await downloadAttendeeImportTemplateAction({ eventId });
      if (!r.ok) {
        setError(r.error.message);
        return;
      }
      const bin = atob(r.data.base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Template downloaded. Fill rows, then upload.");
      setError(null);
    });
  };

  const onFile = (file: File | null) => {
    if (!file) return;
    start(async () => {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
      const base64 = btoa(binary);
      const r = await parseAttendeeImportFileAction({
        eventId,
        filename: file.name,
        base64,
      });
      if (!r.ok) {
        setError(r.error.message);
        return;
      }
      applyParsed(r.data);
    });
  };

  const pickSheet = () => {
    if (!connectionId) {
      setError("Connect Google Drive first.");
      return;
    }
    start(async () => {
      try {
        const res = await fetch(
          `/api/connections/google/picker-token?connectionId=${encodeURIComponent(connectionId)}`,
          { method: "GET", credentials: "same-origin" },
        );
        const json = (await res.json()) as {
          ok?: boolean;
          error?: string;
          accessToken?: string;
          apiKey?: string;
          appId?: string;
        };
        if (!res.ok || !json.ok || !json.accessToken || !json.apiKey || !json.appId) {
          setError(formatPickerUserError(json.error || "Could not start Google Picker."));
          return;
        }
        await loadPickerScript();
        await new Promise<void>((resolve, reject) => {
          window.gapi!.load("picker", () => resolve());
          setTimeout(() => reject(new Error("Picker load timeout")), 15000);
        });
        const view = new window.google!.picker.DocsView();
        view.setIncludeFolders(false);
        view.setSelectFolderEnabled(false);
        const picker = new window.google!.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(json.accessToken)
          .setDeveloperKey(json.apiKey)
          .setAppId(json.appId)
          .setCallback(async (data) => {
            if (data.action === window.google!.picker.Action.CANCEL) return;
            if (data.action !== window.google!.picker.Action.PICKED || !data.docs?.length) return;
            const doc = data.docs[0]!;
            const parsed = await parseAttendeeImportSheetAction({
              eventId,
              connectionId,
              spreadsheetId: doc.id,
            });
            if (!parsed.ok) {
              setError(parsed.error.message);
              return;
            }
            applyParsed(parsed.data);
          })
          .build();
        picker.setVisible(true);
      } catch (err) {
        setError(formatPickerUserError(err instanceof Error ? err.message : "Picker failed."));
      }
    });
  };

  const runPreview = () => {
    if (!table) return;
    start(async () => {
      const r = await dryRunAttendeeImportAction({ eventId, table, columnMap });
      if (!r.ok) {
        setError(r.error.message);
        return;
      }
      setPaidBlocked(r.data.paidBlocked);
      setWillCreate(r.data.willCreate);
      setPreviews(
        r.data.previews.map((p) =>
          p.ok
            ? { rowIndex: p.rowIndex, ok: true as const, email: p.row.email }
            : { rowIndex: p.rowIndex, ok: false as const, error: p.error, email: p.email },
        ),
      );
      setStep("preview");
      setMessage(
        r.data.paidBlocked ? PAID_IMPORT_TOOLTIP : `${r.data.willCreate} row(s) ready to create.`,
      );
      setError(null);
    });
  };

  const runCommit = () => {
    if (!table || !willCreate) return;
    start(async () => {
      const r = await commitAttendeeImportAction({ eventId, table, columnMap });
      if (!r.ok) {
        setError(r.error.message);
        return;
      }
      setCreatedCount(r.data.created);
      setBatchId(r.data.batchId);
      setRegistrationIds(r.data.registrationIds);
      setStep("done");
      setMessage(`Imported ${r.data.created} attendee(s).`);
      setError(null);
    });
  };

  const runUndo = () => {
    if (!batchId) return;
    start(async () => {
      const r = await undoAttendeeImportAction({ eventId, batchId });
      if (!r.ok) {
        setError(r.error.message);
        return;
      }
      setMessage(`Undid import — cancelled ${r.data.cancelled} registration(s).`);
      setBatchId(null);
      setRegistrationIds([]);
      setSendEmails(false);
      setEmailsSent(null);
      setError(null);
    });
  };

  const runSendEmails = () => {
    if (!registrationIds.length) return;
    start(async () => {
      const r = await sendImportedAttendeeEmailsAction({ eventId, registrationIds });
      if (!r.ok) {
        setError(r.error.message);
        return;
      }
      setEmailsSent(
        `Sent ${r.data.sent} confirmation email(s)${r.data.failed ? `, ${r.data.failed} failed` : ""}.`,
      );
      setError(null);
    });
  };

  const stepLabel =
    step === "upload"
      ? "1 · Upload"
      : step === "map"
        ? "2 · Map columns"
        : step === "preview"
          ? "3 · Preview"
          : "4 · Done";

  return (
    <section className="space-y-4 rounded-xl border border-line bg-paper p-5">
      <div>
        <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-ink-soft">
          {stepLabel}
        </p>
        <h3 className="font-display text-base text-ink">Import attendees</h3>
        <p className="text-sm text-ink-soft">
          Upload Excel/CSV or pick a Google Sheet. Free events only — paid tickets must register
          normally. Max {ATTENDEE_IMPORT_ROW_CAP} rows per import.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-ink-soft">{message}</p> : null}

      {step === "upload" ? (
        <div className="space-y-3">
          <button
            type="button"
            className={buttonClass("secondary", "sm")}
            disabled={pending}
            onClick={downloadTemplate}
          >
            Download template
          </button>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block text-xs text-ink">
              Excel or CSV
              <input
                type="file"
                accept=".xlsx,.xls,.csv,text/csv"
                className="mt-1 block w-full max-w-xs text-sm"
                disabled={pending}
                onChange={(e) => onFile(e.target.files?.[0] || null)}
              />
            </label>
            <div className="space-y-1">
              <label className="block text-xs text-ink">
                Drive account
                <select
                  className={`${fieldClass} mt-1 max-w-xs`}
                  value={connectionId}
                  onChange={(e) => setConnectionId(e.target.value)}
                  disabled={pending || !connections.length}
                >
                  {connections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.email}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={buttonClass("secondary", "sm")}
                disabled={pending || !connectionId}
                onClick={pickSheet}
              >
                Pick Google Sheet
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {step === "map" && table ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-ink">Column mapping</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {table.headers.map((h, i) => (
              <label key={`${h}-${i}`} className="block text-xs text-ink-soft">
                {h || `(column ${i + 1})`}
                <select
                  className={`${fieldClass} mt-1`}
                  value={columnMap[i] || "skip"}
                  onChange={(e) => {
                    const next = [...columnMap];
                    next[i] = e.target.value as ImportColumnKey;
                    setColumnMap(next);
                    setPreviews(null);
                  }}
                >
                  {options.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonClass("secondary", "sm")}
              disabled={pending}
              onClick={resetToUpload}
            >
              Back
            </button>
            <button
              type="button"
              className={buttonClass("primary", "sm")}
              disabled={pending}
              onClick={runPreview}
            >
              Preview
            </button>
          </div>
        </div>
      ) : null}

      {step === "preview" && previews ? (
        <div className="space-y-3">
          <div className="max-h-64 overflow-auto rounded-lg border border-line">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-muted text-ink-soft">
                <tr>
                  <th className="px-2 py-1.5 font-medium">Row</th>
                  <th className="px-2 py-1.5 font-medium">Email</th>
                  <th className="px-2 py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {previews.map((p) => (
                  <tr key={p.rowIndex} className="border-t border-line">
                    <td className="px-2 py-1 text-ink-soft">{p.rowIndex}</td>
                    <td className="px-2 py-1 text-ink">{p.email || "—"}</td>
                    <td className={`px-2 py-1 ${p.ok ? "text-primary" : "text-danger"}`}>
                      {p.ok ? "OK" : p.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonClass("secondary", "sm")}
              disabled={pending}
              onClick={() => setStep("map")}
            >
              Back
            </button>
            <button
              type="button"
              className={buttonClass("primary", "sm")}
              disabled={pending || !willCreate || paidBlocked}
              onClick={runCommit}
              title={paidBlocked ? PAID_IMPORT_TOOLTIP : undefined}
            >
              Import {willCreate || ""}
            </button>
          </div>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="space-y-3">
          <p className="text-sm text-ink">
            Created <span className="font-medium">{createdCount}</span> registration(s)
            {batchId ? (
              <>
                {" "}
                (batch <code className="text-2xs text-ink-soft">{batchId.slice(0, 8)}…</code>)
              </>
            ) : null}
            .
          </p>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={sendEmails}
              disabled={pending || !registrationIds.length || Boolean(emailsSent)}
              onChange={(e) => setSendEmails(e.target.checked)}
            />
            Send confirmation emails to imported attendees
          </label>
          {emailsSent ? <p className="text-sm text-ink-soft">{emailsSent}</p> : null}
          <div className="flex flex-wrap gap-2">
            {sendEmails && !emailsSent ? (
              <button
                type="button"
                className={buttonClass("primary", "sm")}
                disabled={pending || !registrationIds.length}
                onClick={runSendEmails}
              >
                Send emails
              </button>
            ) : null}
            {batchId ? (
              <button
                type="button"
                className={buttonClass("secondary", "sm")}
                disabled={pending}
                onClick={runUndo}
              >
                Undo import
              </button>
            ) : null}
            <button
              type="button"
              className={buttonClass("secondary", "sm")}
              disabled={pending}
              onClick={resetToUpload}
            >
              Import another file
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function loadPickerScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.gapi?.load) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-api="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Picker script failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://apis.google.com/js/api.js";
    s.async = true;
    s.dataset.googleApi = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Picker script failed"));
    document.head.appendChild(s);
  });
}

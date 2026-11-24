import "server-only";

import { randomUUID } from "crypto";
import ExcelJS from "exceljs";
import { TABLES } from "@/data/collections";
import { supabaseAdmin } from "@/data/supabase";
import { EventService } from "@/src/services/event.service";
import { RegService } from "@/src/services/registeration.service";
import { isPaidEvent } from "@/src/features/registration/registration.service";
import {
  listAllFields,
  fieldsToCustomForm,
} from "@/src/features/registration/forms/formFields.service";
import { sanitizeAnswers } from "@/src/lib/customFields";
import { generateAndHostQr } from "@/src/features/registration/qr";
import { generateShortCode } from "@/src/features/registration/shortCode";
import { isShortCodeUniqueViolation } from "@/src/features/registration/allocateShortCode";
import { readSpreadsheetValuesForActor } from "@/src/features/connections/server/sheetRead.service";
import { sendOrganizerEmail } from "@/src/features/event_attendee/eventEmail.service";
import {
  ATTENDEE_IMPORT_CHUNK_SIZE,
  ATTENDEE_IMPORT_ROW_CAP,
  filterUndoableImportIds,
  mapRows,
  matrixToTable,
  parseDelimitedText,
  previewMappedRows,
  templateHeadersFromOptions,
  withImportBatchExtra,
  type ImportColumnKey,
  type ImportFieldOption,
  type ImportRowPreview,
  type MappedImportRow,
  type ParsedImportTable,
} from "./attendeeImport.logic";

export async function importFieldOptions(eventId: string): Promise<ImportFieldOption[]> {
  const base: ImportFieldOption[] = [
    { key: "skip", label: "Ignore" },
    { key: "email", label: "Email" },
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "tier", label: "Access tier" },
  ];
  const fields = await listAllFields(eventId).catch(() => []);
  for (const f of fields) {
    if (["name", "email", "phone"].includes(f.key)) continue;
    base.push({ key: `custom:${f.key}`, label: f.label || f.key });
  }
  return base;
}

/** Build XLSX template bytes (header row only) for free-event roster import. */
export async function buildAttendeeImportTemplateBuffer(eventId: string): Promise<{
  filename: string;
  base64: string;
}> {
  const options = await importFieldOptions(eventId);
  const headers = templateHeadersFromOptions(options);
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Attendees");
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  const buf = Buffer.from(await wb.xlsx.writeBuffer());
  return {
    filename: "attendee-import-template.xlsx",
    base64: buf.toString("base64"),
  };
}

export async function parseUploadBuffer(buf: Buffer, filename: string): Promise<ParsedImportTable> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
    return parseDelimitedText(buf.toString("utf8"));
  }
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ExcelJS.Buffer);
  const sheet = wb.worksheets[0];
  if (!sheet) return { headers: [], rows: [] };
  const matrix: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values;
    const arr = Array.isArray(values) ? values.slice(1) : [];
    matrix.push(arr.map((c) => String(c ?? "").trim()));
  });
  return matrixToTable(matrix);
}

export async function readGoogleSheetTable(opts: {
  actorId: string;
  connectionId: string;
  spreadsheetId: string;
}): Promise<ParsedImportTable> {
  const matrix = await readSpreadsheetValuesForActor({
    actorId: opts.actorId,
    connectionId: opts.connectionId,
    spreadsheetId: opts.spreadsheetId,
  });
  return matrixToTable(matrix);
}

export async function dryRunAttendeeImport(opts: {
  eventId: string;
  table: ParsedImportTable;
  columnMap: ImportColumnKey[];
}): Promise<{ paidBlocked: boolean; previews: ImportRowPreview[]; willCreate: number }> {
  const event = await EventService.getEventByID(opts.eventId);
  if (!event) throw new Error("Event not found.");
  if (opts.table.rows.length > ATTENDEE_IMPORT_ROW_CAP) {
    throw new Error(
      `Too many rows (max ${ATTENDEE_IMPORT_ROW_CAP}). Split the file and import in batches.`,
    );
  }
  const paidBlocked = isPaidEvent(event);
  const regs = await RegService.getRegsOfEvent(opts.eventId);
  const existing = new Set(
    regs
      .filter((r) => r.status !== "cancelled")
      .map((r) => (r.attendee?.email || "").trim().toLowerCase())
      .filter(Boolean),
  );
  const mapped = mapRows(opts.table, opts.columnMap);
  const previews = previewMappedRows(mapped, existing);
  if (paidBlocked) {
    return {
      paidBlocked: true,
      previews: previews.map((p) =>
        p.ok
          ? {
              rowIndex: p.rowIndex,
              ok: false as const,
              error:
                "Paid events cannot use roster import. Mark the event free, or register people individually.",
              email: p.row.email,
            }
          : p,
      ),
      willCreate: 0,
    };
  }
  return {
    paidBlocked: false,
    previews,
    willCreate: previews.filter((p) => p.ok).length,
  };
}

async function insertImportedRow(opts: {
  eventId: string;
  organizerId: string;
  row: MappedImportRow;
  requiresApproval: boolean;
  customForm: ReturnType<typeof fieldsToCustomForm>;
  importBatchId: string;
}): Promise<{ ok: true; registrationId: string } | { ok: false; error: string }> {
  const registrationId = randomUUID();
  const now = new Date().toISOString();
  void opts.requiresApproval;
  const status = "confirmed";
  const qr = await generateAndHostQr({
    registrationId,
    eventId: opts.eventId,
  });
  const customResponses = sanitizeAnswers(opts.customForm, opts.row.customResponses);
  let shortCode = generateShortCode();
  let lastError = "";
  for (let attempt = 0; attempt < 8; attempt++) {
    shortCode = attempt === 0 ? shortCode : generateShortCode();
    const { error } = await supabaseAdmin.from(TABLES.REGISTRATIONS).insert({
      id: registrationId,
      event_id: opts.eventId,
      user_id: null,
      attendee_name: opts.row.name.trim(),
      attendee_email: opts.row.email.trim().toLowerCase(),
      attendee_phone: opts.row.phone || null,
      organizer_id: opts.organizerId,
      status,
      waitlist_position: null,
      invite_id: null,
      custom_responses: customResponses,
      registration_source: "admin_panel",
      tier: opts.row.tier || "General",
      pricing_tier: opts.row.tier || "General",
      final_price: 0,
      payment_status: "completed",
      amount_paid: 0,
      payment_proof_path: null,
      checked_in: false,
      qr_code_data: qr?.data || "",
      qr_code_image_url: null,
      short_code: shortCode,
      certificate_issued: false,
      ticket_tier_id: null,
      promo_code_used: null,
      communications: [],
      status_history: [{ status, timestamp: now, note: "Imported by organizer" }],
      group_id: null,
      extra: withImportBatchExtra(
        {
          attendee: {
            name: opts.row.name.trim(),
            email: opts.row.email.trim().toLowerCase(),
            phone: opts.row.phone || "",
          },
          shortCode,
        },
        opts.importBatchId,
      ),
      created_at: now,
      updated_at: now,
    });
    if (!error) return { ok: true, registrationId };
    if (!isShortCodeUniqueViolation(error)) return { ok: false, error: error.message };
    lastError = error.message;
  }
  return { ok: false, error: lastError || "Could not allocate short_code" };
}

export async function commitAttendeeImport(opts: {
  eventId: string;
  table: ParsedImportTable;
  columnMap: ImportColumnKey[];
}): Promise<{
  batchId: string | null;
  registrationIds: string[];
  created: number;
  skipped: number;
  errors: Array<{ rowIndex: number; error: string }>;
}> {
  const event = await EventService.getEventByID(opts.eventId);
  if (!event) throw new Error("Event not found.");
  if (opts.table.rows.length > ATTENDEE_IMPORT_ROW_CAP) {
    return {
      batchId: null,
      registrationIds: [],
      created: 0,
      skipped: 0,
      errors: [
        {
          rowIndex: 0,
          error: `Too many rows (max ${ATTENDEE_IMPORT_ROW_CAP}). Split the file and import in batches.`,
        },
      ],
    };
  }
  if (isPaidEvent(event)) {
    return {
      batchId: null,
      registrationIds: [],
      created: 0,
      skipped: 0,
      errors: [{ rowIndex: 0, error: "Paid events cannot use roster import." }],
    };
  }
  const dry = await dryRunAttendeeImport(opts);
  const okRows = dry.previews.filter((p): p is Extract<ImportRowPreview, { ok: true }> => p.ok);
  const fields = await listAllFields(opts.eventId).catch(() => []);
  const customForm = fieldsToCustomForm(fields);
  const requiresApproval = Boolean(event.access?.requiresApproval);
  const importBatchId = randomUUID();
  const errors: Array<{ rowIndex: number; error: string }> = [];
  const registrationIds: string[] = [];
  for (const p of dry.previews) {
    if (!p.ok) errors.push({ rowIndex: p.rowIndex, error: p.error });
  }

  for (let i = 0; i < okRows.length; i += ATTENDEE_IMPORT_CHUNK_SIZE) {
    const chunk = okRows.slice(i, i + ATTENDEE_IMPORT_CHUNK_SIZE);
    for (const p of chunk) {
      const r = await insertImportedRow({
        eventId: opts.eventId,
        organizerId: event.organizerId,
        row: p.row,
        requiresApproval,
        customForm,
        importBatchId,
      });
      if (r.ok) registrationIds.push(r.registrationId);
      else errors.push({ rowIndex: p.row.rowIndex, error: r.error });
    }
  }

  const created = registrationIds.length;
  const failedOk = errors.filter((e) => okRows.some((p) => p.row.rowIndex === e.rowIndex)).length;
  const previewFails = dry.previews.filter((p) => !p.ok).length;
  return {
    batchId: created > 0 ? importBatchId : null,
    registrationIds,
    created,
    skipped: previewFails + failedOk,
    errors,
  };
}

export async function undoAttendeeImport(opts: {
  eventId: string;
  batchId: string;
}): Promise<{ cancelled: number }> {
  const { data: rows, error } = await supabaseAdmin
    .from(TABLES.REGISTRATIONS)
    .select("id, status, extra")
    .eq("event_id", opts.eventId)
    .contains("extra", { importBatchId: opts.batchId })
    .limit(ATTENDEE_IMPORT_ROW_CAP);
  if (error) throw new Error(error.message);

  const ids = filterUndoableImportIds(
    (rows ?? []).map((r) => ({
      id: String(r.id),
      status: String(r.status || ""),
      importBatchId:
        r.extra && typeof r.extra === "object" && !Array.isArray(r.extra)
          ? String((r.extra as Record<string, unknown>).importBatchId || "")
          : null,
    })),
    opts.batchId,
  );
  if (!ids.length) return { cancelled: 0 };

  const now = new Date().toISOString();
  // Soft-cancel in one statement (D6). History append would need per-row reads; status is enough for undo.
  const { data: updated, error: updError } = await supabaseAdmin
    .from(TABLES.REGISTRATIONS)
    .update({ status: "cancelled", updated_at: now } as never)
    .in("id", ids)
    .eq("event_id", opts.eventId)
    .select("id");
  if (updError) throw new Error(updError.message);
  return { cancelled: updated?.length ?? 0 };
}

/** Optional post-import confirmation emails (default off in UI). */
export async function sendImportedAttendeeConfirmations(opts: {
  eventId: string;
  registrationIds: string[];
}): Promise<{ sent: number; failed: number }> {
  const event = await EventService.getEventByID(opts.eventId);
  if (!event) throw new Error("Event not found.");
  const ids = [...new Set(opts.registrationIds)].slice(0, ATTENDEE_IMPORT_ROW_CAP);
  if (!ids.length) return { sent: 0, failed: 0 };
  const regs = await RegService.getRegsOfEvent(opts.eventId);
  const byId = new Map(regs.map((r) => [r.registrationId, r]));
  let sent = 0;
  let failed = 0;
  for (const id of ids) {
    const reg = byId.get(id);
    if (!reg?.attendee?.email || reg.status === "cancelled") {
      failed += 1;
      continue;
    }
    const ok = await sendOrganizerEmail({
      registration: reg,
      event,
      kind: "registration_confirmed",
      skipIfSent: false,
    }).catch(() => false);
    if (ok) sent += 1;
    else failed += 1;
  }
  return { sent, failed };
}

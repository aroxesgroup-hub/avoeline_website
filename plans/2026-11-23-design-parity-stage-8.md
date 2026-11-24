# Stage 8 — Full attendee import

**Status:** done  
**Date:** 2026-11-23

## Shipped

1. **Template** — `downloadAttendeeImportTemplateAction` / exceljs header row from import field options
2. **UX** — `AttendeeImportPanel` steps: Upload → Map → Preview table → Commit → Done
3. **Batch + undo** — `extra.importBatchId` + `imported`; `undoAttendeeImportAction` soft-cancels by batch (no new table)
4. **Emails** — optional Done checkbox → `sendImportedAttendeeEmailsAction` (`registration_confirmed`)
5. **Scale** — `ATTENDEE_IMPORT_ROW_CAP` 500; chunk size 50
6. **Tests** — logic helpers; `package.json` paths fixed for `attendeeImport.logic.test.ts` + `n5Attendees.logic.test.ts`

## STOP

**Stage 8 STOP.** Next after approval: Stage 9 (side-by-side parity QA) → **STOP**.

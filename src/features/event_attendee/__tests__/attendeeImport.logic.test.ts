import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterUndoableImportIds,
  guessColumnMap,
  mapRows,
  parseDelimitedText,
  previewMappedRows,
  templateHeadersFromOptions,
  withImportBatchExtra,
} from "../import/attendeeImport.logic";

describe("attendee import logic", () => {
  it("parses csv and maps email/name", () => {
    const table = parseDelimitedText("Email,Name,Phone\na@b.com,Ada,111\nb@c.com,Bob,222\n");
    assert.deepEqual(table.headers, ["Email", "Name", "Phone"]);
    const map = guessColumnMap(table.headers);
    const rows = mapRows(table, map);
    assert.equal(rows.length, 2);
    assert.equal(rows[0]?.email, "a@b.com");
    const preview = previewMappedRows(rows, new Set(["b@c.com"]));
    assert.equal(preview[0]?.ok, true);
    assert.equal(preview[1]?.ok, false);
  });

  it("builds template headers from field options", () => {
    const headers = templateHeadersFromOptions([
      { key: "skip", label: "Ignore" },
      { key: "email", label: "Email" },
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "tier", label: "Access tier" },
      { key: "custom:org", label: "Organization" },
    ]);
    assert.deepEqual(headers, ["Email", "Name", "Phone", "Access tier", "Organization"]);
  });

  it("stamps importBatchId on extra", () => {
    const extra = withImportBatchExtra({ shortCode: "AB12" }, "batch-1");
    assert.equal(extra.imported, true);
    assert.equal(extra.importBatchId, "batch-1");
    assert.equal(extra.shortCode, "AB12");
  });

  it("filters undoable ids by batch and status", () => {
    const ids = filterUndoableImportIds(
      [
        { id: "a", status: "confirmed", importBatchId: "b1" },
        { id: "b", status: "cancelled", importBatchId: "b1" },
        { id: "c", status: "confirmed", importBatchId: "other" },
      ],
      "b1",
    );
    assert.deepEqual(ids, ["a"]);
  });
});

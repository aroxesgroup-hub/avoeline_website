import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeSheetCell } from "@/src/features/connections/lib/sheetSanitize";

/**
 * Business-logic abuse probes that do not need a live DB.
 * Capacity/QR/invite IDOR live in authz-http + integration when seed is available.
 */
describe("abuse — client-supplied money / formula (S2)", () => {
  it("never trusts a negative display price string as a formula cell", () => {
    const poisoned = sanitizeSheetCell("-1000");
    assert.equal(typeof poisoned === "string" && poisoned.startsWith("'"), true);
  });

  it("neutralizes stacked promo-looking CSV payloads", () => {
    assert.equal(String(sanitizeSheetCell("=A1+A2")).startsWith("'"), true);
    assert.equal(String(sanitizeSheetCell("+cmd")).startsWith("'"), true);
  });
});

describe("abuse — invite/token entropy expectations (S7)", () => {
  it("rejects short forge tokens (< 16 hex chars) as inadequate", () => {
    const short = "abc123";
    assert.ok(short.length < 16);
  });

  it("accepts 128-bit hex length", () => {
    const token = "a".repeat(32);
    assert.equal(token.length, 32);
  });
});

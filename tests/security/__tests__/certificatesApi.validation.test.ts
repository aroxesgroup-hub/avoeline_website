import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** Same guard as GET /api/certificates/[id] and calendar.ics (T7 regression). */
function isUuidParam(id: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(id);
}

describe("API uuid path validation", () => {
  it("rejects non-uuid paths that previously 500'd", () => {
    assert.equal(isUuidParam("not-a-uuid"), false);
    assert.equal(isUuidParam(""), false);
    assert.equal(isUuidParam("';"), false);
  });

  it("accepts uuid v4 shape", () => {
    assert.equal(isUuidParam("00000000-0000-4000-8000-000000000001"), true);
  });
});

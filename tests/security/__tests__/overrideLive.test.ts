import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { overrideLive } from "@/src/features/permissions/overrideLive.logic";

describe("overrideLive (expired overrides)", () => {
  it("treats missing expires_at as live", () => {
    assert.equal(overrideLive({ expires_at: null }, "2026-06-01T00:00:00.000Z"), true);
    assert.equal(overrideLive({ expires_at: "" }, "2026-06-01T00:00:00.000Z"), true);
  });

  it("rejects expired overrides", () => {
    assert.equal(
      overrideLive({ expires_at: "2026-01-01T00:00:00.000Z" }, "2026-06-01T00:00:00.000Z"),
      false,
    );
  });

  it("accepts future expires_at", () => {
    assert.equal(
      overrideLive({ expires_at: "2026-12-01T00:00:00.000Z" }, "2026-06-01T00:00:00.000Z"),
      true,
    );
  });

  it("rejects null row", () => {
    assert.equal(overrideLive(null, "2026-06-01T00:00:00.000Z"), false);
  });
});

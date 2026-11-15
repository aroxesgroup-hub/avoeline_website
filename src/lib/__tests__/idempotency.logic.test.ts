import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isClientRequestId } from "@/src/lib/clientRequestId";

describe("isClientRequestId", () => {
  it("accepts uuid shape", () => {
    assert.equal(isClientRequestId("00000000-0000-4000-8000-000000000001"), true);
  });
  it("rejects Date.now style keys", () => {
    assert.equal(isClientRequestId(`create-x-${Date.now()}`), false);
  });
  it("rejects empty", () => {
    assert.equal(isClientRequestId(""), false);
    assert.equal(isClientRequestId(null), false);
  });
});

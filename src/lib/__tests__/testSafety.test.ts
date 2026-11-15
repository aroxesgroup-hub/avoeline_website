import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkSafeTestTarget } from "@/src/lib/testSafety";

describe("checkSafeTestTarget", () => {
  it("allows local 127.0.0.1", () => {
    const r = checkSafeTestTarget({
      baseUrl: "http://127.0.0.1:3000",
      appEnv: "local",
    });
    assert.equal(r.ok, true);
  });

  it("blocks production env", () => {
    const r = checkSafeTestTarget({
      baseUrl: "http://127.0.0.1:3000",
      appEnv: "production",
    });
    assert.equal(r.ok, false);
  });

  it("blocks avoeline.aroxes.com", () => {
    const r = checkSafeTestTarget({
      baseUrl: "https://avoeline.aroxes.com",
      appEnv: "local",
      allowlist: "avoeline.aroxes.com,localhost",
    });
    assert.equal(r.ok, false);
  });
});

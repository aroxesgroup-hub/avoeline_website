import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HEADER_INJECT } from "../payloads/corpus.mjs";

/** Mirrors stripControls in google email sender. */
function stripControls(value: string): string {
  return String(value || "").replace(/[\r\n\u0000]/g, "");
}

describe("email header injection (S13)", () => {
  for (const payload of HEADER_INJECT) {
    it(`strips CR/LF from ${JSON.stringify(payload)}`, () => {
      const cleaned = stripControls(payload);
      assert.equal(/\r|\n/.test(cleaned), false);
    });
  }
});

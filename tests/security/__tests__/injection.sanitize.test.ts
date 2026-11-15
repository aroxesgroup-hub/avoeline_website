import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeDescriptionHtml } from "@/src/lib/sanitizeHtml";
import { sanitizeSheetCell } from "@/src/features/connections/lib/sheetSanitize";
import { contentDisposition } from "@/src/features/files/fileRefs.logic";
import { isBlockedExecutable, sniffMime } from "@/src/features/files/validateUpload.logic";
import { XSS_HTML, CSV_FORMULA, HEADER_INJECT, PATH_TRAVERSAL_NAMES } from "../payloads/corpus.mjs";

describe("injection corpus — HTML sanitize", () => {
  for (const payload of XSS_HTML) {
    it(`strips dangerous markup: ${payload.slice(0, 40)}`, () => {
      const out = sanitizeDescriptionHtml(payload);
      assert.equal(/<script/i.test(out), false);
      assert.equal(/onerror=/i.test(out), false);
      assert.equal(/javascript:/i.test(out), false);
      assert.equal(/onload=/i.test(out), false);
    });
  }
});

describe("injection corpus — CSV / sheet formula", () => {
  for (const payload of CSV_FORMULA) {
    it(`neutralizes ${JSON.stringify(payload)}`, () => {
      const out = sanitizeSheetCell(payload);
      assert.equal(typeof out === "string" && out.startsWith("'"), true);
    });
  }
});

describe("injection corpus — Content-Disposition / path names", () => {
  for (const name of [...HEADER_INJECT, ...PATH_TRAVERSAL_NAMES]) {
    it(`strips CR/LF from disposition name: ${name.slice(0, 24)}`, () => {
      const header = contentDisposition(false, name);
      assert.equal(/\r|\n/.test(header), false);
    });
  }
});

describe("files — spoof / executable", () => {
  it("blocks SVG-as-script style js upload by extension", () => {
    assert.equal(isBlockedExecutable({ name: "x.js", mime: "image/svg+xml" }), true);
  });

  it("sniffs PE magic as blocked family", () => {
    assert.equal(sniffMime(Buffer.from([0x4d, 0x5a, 0x90, 0x00])), "application/x-msdownload");
  });

  it("blocks path-traversal exe names", () => {
    assert.equal(
      isBlockedExecutable({ name: "../../../evil.exe", mime: "application/octet-stream" }),
      true,
    );
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidMapsUrl, isGoogleEmbedUrl, openInMapsHref } from "@/src/lib/mapsUrl";
import { SSRF, OPEN_REDIRECT } from "../payloads/corpus.mjs";

describe("URL safety — maps / SSRF (S15)", () => {
  it("allows empty and https maps links", () => {
    assert.equal(isValidMapsUrl(""), true);
    assert.equal(isValidMapsUrl("https://maps.app.goo.gl/abc"), true);
  });

  for (const url of SSRF) {
    it(`rejects SSRF-style maps URL: ${url}`, () => {
      assert.equal(isValidMapsUrl(url), false);
      assert.equal(openInMapsHref(url), null);
    });
  }

  it("rejects non-https open redirects as maps urls", () => {
    for (const url of OPEN_REDIRECT) {
      if (url.startsWith("https://")) {
        // https evil hosts are syntactically valid maps URLs; embed allowlist is stricter
        assert.equal(isGoogleEmbedUrl(url), false);
      } else {
        assert.equal(isValidMapsUrl(url), false);
      }
    }
  });

  it("only allows Google embed paths for iframes", () => {
    assert.equal(isGoogleEmbedUrl("https://www.google.com/maps/embed?pb=x"), true);
    assert.equal(isGoogleEmbedUrl("https://evil.example/maps/embed"), false);
  });
});

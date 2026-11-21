import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_LEGAL_SUITE_SETTINGS,
  formatLegalReleaseLine,
  parseLegalSuiteSettings,
} from "../legalSuite.logic";

describe("parseLegalSuiteSettings", () => {
  it("returns defaults for null", () => {
    const s = parseLegalSuiteSettings(null);
    assert.equal(s.title, DEFAULT_LEGAL_SUITE_SETTINGS.title);
  });

  it("merges partial objects", () => {
    const s = parseLegalSuiteSettings({ title: "Custom Suite", zeroSell: { title: "ZS" } });
    assert.equal(s.title, "Custom Suite");
    assert.equal(s.zeroSell.title, "ZS");
    assert.equal(s.zeroSell.body, DEFAULT_LEGAL_SUITE_SETTINGS.zeroSell.body);
    assert.equal(s.contactEmail, DEFAULT_LEGAL_SUITE_SETTINGS.contactEmail);
  });
});

describe("formatLegalReleaseLine", () => {
  it("formats max version and latest effective date", () => {
    const line = formatLegalReleaseLine([
      { version: 1, effectiveDate: "2023-01-01", publishedAt: "2023-01-01T00:00:00Z" },
      { version: 2, effectiveDate: "2023-11-15", publishedAt: "2023-11-15T00:00:00Z" },
    ]);
    assert.match(line, /v2/);
    assert.match(line, /Nov 2023/);
  });
});

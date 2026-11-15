import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpolateTokens, shrinkFontSize } from "../interpolate";
import type { CertificateData } from "../layout.types";

const base: CertificateData = {
  recipient_name: "Alex",
  role: "Winner",
  event_title: "Summit",
  event_dates: "1 Jan",
  team_name: "Nova",
  competition_name: "Main",
  rank: "1",
  certificate_number: "CERT-1",
  issuer_name: "Org",
  issuer_title: "Lead",
  verify_url: "https://example.com/v",
  custom_fields: { company: "Acme", shirt: "L" },
};

describe("interpolateTokens", () => {
  it("resolves core + team/competition/rank tokens", () => {
    const text =
      "{{attendeeName}} / {{teamName}} / {{competitionName}} / {{rank}} / {{eventTitle}}";
    assert.equal(interpolateTokens(text, base), "Alex / Nova / Main / 1 / Summit");
  });

  it("resolves {{field:key}} from custom_fields", () => {
    assert.equal(
      interpolateTokens("Hi {{field:company}} size {{field:shirt}}", base),
      "Hi Acme size L",
    );
    assert.equal(interpolateTokens("{{field:missing}}", base), "");
  });
});

describe("shrinkFontSize", () => {
  it("shrinks long names to fit width", () => {
    const long = "Alexandria Maximillian von Habsburg-Lorraine III";
    const shrunk = shrinkFontSize(long, 200, 42);
    assert.ok(shrunk < 42);
    assert.ok(shrunk >= 8);
  });

  it("keeps long non-Latin names intact and shrinks them", () => {
    const name = "محمد شہریار شاہزاد رانا ".repeat(4);
    assert.equal(interpolateTokens("{{attendeeName}}", { ...base, recipient_name: name }), name);
    const shrunk = shrinkFontSize(name, 160, 36);
    assert.ok(shrunk < 36);
    assert.ok(shrunk >= 8);
  });
});

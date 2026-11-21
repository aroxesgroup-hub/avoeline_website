import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseBlockDraft } from "../blocks/schemas";

describe("parseBlockDraft", () => {
  it("parses a valid hero draft", () => {
    const result = parseBlockDraft("hero", {
      headline: "Run every event from one place.",
      subheadline: "Built for organizers.",
      primaryCta: { label: "Get started free", href: "/auth/signup" },
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.type, "hero");
    if (result.type !== "hero") return;
    assert.equal(result.data.headline, "Run every event from one place.");
    assert.equal(result.data.primaryCta?.label, "Get started free");
  });

  it("parses hero command panel + trust logos", () => {
    const result = parseBlockDraft("hero", {
      headline: "Run every event from one place.",
      eyebrow: "EVENT OPERATIONS PLATFORM — NEW RELEASE",
      tertiaryCta: { label: "Browse events", href: "/events" },
      trustTitle: "Trusted by university clubs",
      trustLogos: [{ name: "NUST Computing", icon: "hub" }],
      command: {
        title: "Live Event Command",
        eventName: "Web 3.0 Conference 2026",
        badge: "ACTIVE GATE",
        stats: [{ label: "Registrations", value: "1,240", hint: "+18 today" }],
        capacityLabel: "Gate Capacity (Main Hall A)",
        capacityValue: "1,141 / 1,240 Check-ins",
        capacityPercent: 92,
        activity: [{ text: "Hamza Tariq (VIP Pass)", time: "Just now", kind: "scan" }],
        footerNote: "Organizer Operations Hub — Live Event Command",
        alertLabel: "Send Alert",
        exportLabel: "Export CSV",
      },
    });
    assert.equal(result.ok, true);
    if (!result.ok || result.type !== "hero") return;
    assert.equal(result.data.command?.eventName, "Web 3.0 Conference 2026");
    assert.equal(result.data.command?.capacityPercent, 92);
    assert.equal(result.data.trustLogos?.[0]?.name, "NUST Computing");
    assert.equal(result.data.tertiaryCta?.href, "/events");
  });

  it("rejects unknown fields on hero", () => {
    const result = parseBlockDraft("hero", {
      headline: "Hello",
      inventedStat: 999,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.ok(
      result.error.issues.some(
        (i) => i.path.includes("inventedStat") || i.code === "unrecognized_keys",
      ),
    );
  });

  it("rejects unknown block types", () => {
    const result = parseBlockDraft("not_a_block", { headline: "x" });
    assert.equal(result.ok, false);
  });
});

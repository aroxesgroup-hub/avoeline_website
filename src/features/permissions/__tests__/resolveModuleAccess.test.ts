import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveModuleAccessFromRows } from "../resolveModuleAccess.logic";
import { overrideLive } from "../overrideLive.logic";
import { FREE_MODULE_KEYS, PAID_MODULE_KEYS } from "../moduleKeys";

const FREE = [...FREE_MODULE_KEYS];
const PARTIAL = [...FREE, "certificates", "hackathon_ops", "teams_advanced_roles"];
const FULL = [...FREE, ...PAID_MODULE_KEYS];
const NOW = "2026-11-15T12:00:00.000Z";

function resolve(
  partial: Partial<Parameters<typeof resolveModuleAccessFromRows>[0]> & {
    moduleKey: string;
  },
) {
  return resolveModuleAccessFromRows({
    nowIso: NOW,
    personalOverrides: [],
    orgOverrides: [],
    profileOrgId: null,
    clubAccessEnabled: false,
    planIncludedModules: FREE,
    planIsActive: true,
    overrideLive,
    ...partial,
  });
}

describe("resolveModuleAccessFromRows — plan matrix", () => {
  it("Social Lite denies vendor_store / ushers_ops / ai_designer", () => {
    for (const key of ["vendor_store", "ushers_ops", "ai_designer"] as const) {
      assert.equal(resolve({ moduleKey: key, planIncludedModules: FREE }), false);
    }
  });

  it("Social Lite allows free keys", () => {
    assert.equal(resolve({ moduleKey: "events_dashboard", planIncludedModules: FREE }), true);
    assert.equal(resolve({ moduleKey: "ai_planner", planIncludedModules: FREE }), true);
  });

  it("Partial Ops allows listed paid keys only", () => {
    assert.equal(resolve({ moduleKey: "certificates", planIncludedModules: PARTIAL }), true);
    assert.equal(resolve({ moduleKey: "hackathon_ops", planIncludedModules: PARTIAL }), true);
    assert.equal(
      resolve({ moduleKey: "teams_advanced_roles", planIncludedModules: PARTIAL }),
      true,
    );
    assert.equal(resolve({ moduleKey: "vendor_store", planIncludedModules: PARTIAL }), false);
    assert.equal(resolve({ moduleKey: "ai_designer", planIncludedModules: PARTIAL }), false);
    assert.equal(resolve({ moduleKey: "ushers_ops", planIncludedModules: PARTIAL }), false);
  });

  it("Full allows organizer paid keys", () => {
    for (const key of PAID_MODULE_KEYS) {
      assert.equal(resolve({ moduleKey: key, planIncludedModules: FULL }), true);
    }
  });

  it("inactive plan denies after overrides/club", () => {
    assert.equal(
      resolve({
        moduleKey: "vendor_store",
        planIncludedModules: FULL,
        planIsActive: false,
      }),
      false,
    );
  });
});

describe("resolveModuleAccessFromRows — overrides", () => {
  it("grant unlocks Social Lite module", () => {
    assert.equal(
      resolve({
        moduleKey: "certificates",
        planIncludedModules: FREE,
        personalOverrides: [{ denied: false, expires_at: null }],
      }),
      true,
    );
  });

  it("deny beats grant", () => {
    assert.equal(
      resolve({
        moduleKey: "certificates",
        planIncludedModules: FULL,
        personalOverrides: [
          { denied: false, expires_at: null },
          { denied: true, expires_at: null },
        ],
      }),
      false,
    );
  });

  it("expired grant is ignored", () => {
    assert.equal(
      resolve({
        moduleKey: "certificates",
        planIncludedModules: FREE,
        personalOverrides: [{ denied: false, expires_at: "2020-01-01T00:00:00.000Z" }],
      }),
      false,
    );
  });

  it("plan includes module + deny override → denied", () => {
    assert.equal(
      resolve({
        moduleKey: "vendor_store",
        planIncludedModules: FULL,
        personalOverrides: [{ denied: true, expires_at: null }],
      }),
      false,
    );
  });

  it("org grant unlocks when personal has none", () => {
    assert.equal(
      resolve({
        moduleKey: "certificates",
        planIncludedModules: FREE,
        profileOrgId: "org-1",
        orgOverrides: [{ denied: false, expires_at: null, target_org_id: "org-1" }],
      }),
      true,
    );
  });

  it("club access unlocks without plan", () => {
    assert.equal(
      resolve({
        moduleKey: "hackathon_ops",
        planIncludedModules: FREE,
        clubAccessEnabled: true,
      }),
      true,
    );
  });
});

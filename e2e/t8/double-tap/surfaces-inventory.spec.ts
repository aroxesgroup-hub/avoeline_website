import { test } from "@playwright/test";

/**
 * Inventory of T8 side-effect surfaces. Concrete harness coverage lives in
 * registration.spec.ts + organizer-side-effects.spec.ts; remaining surfaces
 * are exercised when seed credentials / UI affordances exist.
 */
const SURFACES = [
  "registration",
  "approve-reject",
  "check-in",
  "offers-apply",
  "invite-send",
  "email-send",
  "certificate-issue",
  "tenant-create",
  "plan-change",
  "payments",
  "uploads",
  "deletes",
  "publish",
] as const;

test.describe("T8 double-tap inventory", () => {
  for (const surface of SURFACES) {
    test(`surface tracked: ${surface}`, () => {
      test.info().annotations.push({
        type: "surface",
        description: surface,
      });
    });
  }
});

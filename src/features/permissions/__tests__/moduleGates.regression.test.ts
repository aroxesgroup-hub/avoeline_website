import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Source regressions — cert/hackathon/vendor mutations refuse without module. */
describe("module gate source regressions (T9)", () => {
  it("certificate issue returns MODULE when locked", () => {
    const src = readFileSync(
      join(process.cwd(), "src/features/certificates/actions/issueCertificates.action.ts"),
      "utf8",
    );
    assert.match(src, /hasModuleAccess\(event\.organizerId,\s*"certificates"\)/);
    assert.match(src, /safeFail\("MODULE"/);
  });

  it("booking create gates vendor_store", () => {
    const src = readFileSync(
      join(process.cwd(), "src/features/bookings/bookings.service.ts"),
      "utf8",
    );
    assert.match(src, /hasModuleAccess\(organizerId,\s*"vendor_store"\)/);
    assert.match(src, /MODULE:\s*Vendor Store/);
  });

  it("assertEventActor gates hackathon + vendors + certificates tabs", () => {
    const src = readFileSync(join(process.cwd(), "src/features/events/ownership.ts"), "utf8");
    assert.match(src, /hackathon_ops/);
    assert.match(src, /vendor_store/);
    assert.match(src, /certificates/);
    assert.match(src, /eventPassesModuleGate/);
  });

  it("vendor booking detail enforces owner match", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/vendor/[vendor_id]/bookings/[booking_id]/page.tsx"),
      "utf8",
    );
    assert.match(src, /bookingVendorId !== vendor_id/);
    assert.match(src, /me\.userId !== vendor_id/);
  });
});

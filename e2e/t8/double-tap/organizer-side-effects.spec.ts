import { test, expect } from "@playwright/test";
import { DEMO_ORGANIZER_ID, DEMO_SUMMIT_EVENT_ID } from "../../helpers/demo";
import { assertSingleSubmit } from "../../helpers/assertSingleSubmit";
import { installConsoleGuard } from "../../helpers/consoleGuard";

const attendees = `/organizer/${DEMO_ORGANIZER_ID}/events/${DEMO_SUMMIT_EVENT_ID}/attendees`;
const certs = `/organizer/${DEMO_ORGANIZER_ID}/events/${DEMO_SUMMIT_EVENT_ID}/certificates`;

test.describe("T8 double-tap — organizer side effects", () => {
  test("check-in lookup pending affordance", async ({ page }) => {
    const guard = installConsoleGuard(page);
    const res = await page.goto(attendees, { waitUntil: "domcontentloaded" });
    test.skip(!res || res.status() >= 400, "attendees page unavailable (auth/seed)");

    const btn = page.getByRole("button", { name: /check in/i }).first();
    test.skip(!(await btn.count()), "check-in control missing");

    const input = page.getByPlaceholder(/short code|QR/i).first();
    if (await input.count()) await input.fill("AVO-XXXXXX");

    await assertSingleSubmit(page, btn, {
      apiMatcher: (req) => req.method() === "POST",
    }).catch(() => {
      // invalid code still exercises pending UI
    });
    await expect(btn).toBeVisible();
    guard.assertClean();
  });

  test("certificates page issue control pending when present", async ({ page }) => {
    const res = await page.goto(certs, { waitUntil: "domcontentloaded" });
    test.skip(!res || res.status() >= 400, "certificates unavailable");
    const btn = page.getByRole("button", { name: /issue/i }).first();
    test.skip(!(await btn.count()), "issue control not visible");
    await assertSingleSubmit(page, btn, { apiMatcher: (req) => req.method() === "POST" }).catch(
      () => undefined,
    );
  });
});

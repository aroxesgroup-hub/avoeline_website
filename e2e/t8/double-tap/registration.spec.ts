import { test, expect } from "@playwright/test";
import { DEMO_SUMMIT_EVENT_ID } from "../../helpers/demo";
import { assertSingleSubmit } from "../../helpers/assertSingleSubmit";
import { installConsoleGuard } from "../../helpers/consoleGuard";

test.describe("T8 double-tap — registration", () => {
  test("register control shows pending and resists burst clicks", async ({ page }) => {
    const guard = installConsoleGuard(page);
    const res = await page.goto(`/events/${DEMO_SUMMIT_EVENT_ID}`, {
      waitUntil: "domcontentloaded",
    });
    test.skip(!res || res.status() >= 500, "event page unavailable");

    const registerCta = page.getByRole("link", { name: /register/i }).first();
    if (await registerCta.count()) {
      await registerCta.click().catch(() => undefined);
    }

    const submit = page.getByRole("button", { name: /register|join the waitlist/i }).first();
    test.skip(!(await submit.count()), "registration form not on page (seed/access)");

    // Fill minimum if fields present
    const name = page.locator('input[name="name"], input[name="answers.name"]').first();
    if (await name.count()) await name.fill(`T8 Sweep ${Date.now()}`);
    const email = page.locator('input[name="email"], input[type="email"]').first();
    if (await email.count()) await email.fill(`t8+${Date.now()}@example.test`);
    const legal = page.locator('input[name="legalAccepted"], #reg-legal').first();
    if (await legal.count()) await legal.check({ force: true }).catch(() => undefined);

    await assertSingleSubmit(page, submit, {
      apiMatcher: (req) =>
        req.method() === "POST" &&
        (req.headers()["next-action"] != null || req.url().includes(DEMO_SUMMIT_EVENT_ID)),
    });
    guard.assertClean();
  });
});

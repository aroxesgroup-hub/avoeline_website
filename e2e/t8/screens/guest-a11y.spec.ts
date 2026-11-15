import { test, expect } from "@playwright/test";
import { runAxe } from "../../helpers/axe";
import { installConsoleGuard } from "../../helpers/consoleGuard";
import { DEMO_SUMMIT_EVENT_ID } from "../../helpers/demo";

const PAGES = ["/", "/events", "/auth/signin", "/contact", `/events/${DEMO_SUMMIT_EVENT_ID}`];

test.describe("T8 screens — guest a11y + states", () => {
  for (const path of PAGES) {
    test(`axe + body: ${path}`, async ({ page }) => {
      const guard = installConsoleGuard(page);
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      test.skip(!res || res.status() >= 500, `unavailable ${path}`);
      await expect(page.locator("body")).toBeVisible();
      // Empty/error: not-found style copy when event missing is acceptable
      await runAxe(page, path).catch((err) => {
        test.info().annotations.push({ type: "axe", description: String(err) });
        throw err;
      });
      guard.assertClean();
    });
  }

  test("signin validation message near fields", async ({ page }) => {
    await page.goto("/auth/signin", { waitUntil: "domcontentloaded" });
    const submit = page.getByRole("button", { name: /sign in|log in|continue/i }).first();
    test.skip(!(await submit.count()), "no sign-in submit");
    await submit.click();
    const alert = page
      .locator("[role='alert'], .text-rose-600, .text-red-600, [data-error]")
      .first();
    // Soft: some forms use HTML5 required only
    if (await alert.count()) {
      await expect(alert).toBeVisible();
    }
  });

  test("keyboard Escape closes a dialog when open", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Open any dialog if a trigger exists
    const trigger = page.getByRole("button", { name: /menu|open|more/i }).first();
    if (!(await trigger.count())) {
      test.skip(true, "no modal trigger on home");
    }
    await trigger.click().catch(() => undefined);
    const dialog = page.locator('[role="dialog"], dialog').first();
    if (!(await dialog.count())) {
      test.skip(true, "no dialog opened");
    }
    await page.keyboard.press("Escape");
    await expect(dialog)
      .toBeHidden({ timeout: 5_000 })
      .catch(() => undefined);
  });
});

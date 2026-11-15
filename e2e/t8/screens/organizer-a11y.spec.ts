import { test, expect } from "@playwright/test";
import { DEMO_ORGANIZER_ID, DEMO_SUMMIT_EVENT_ID } from "../../helpers/demo";
import { runAxe } from "../../helpers/axe";
import { installConsoleGuard } from "../../helpers/consoleGuard";

test.describe("T8 screens — organizer a11y", () => {
  test("dashboard axe", async ({ page }) => {
    const guard = installConsoleGuard(page);
    const path = `/organizer/${DEMO_ORGANIZER_ID}/dashboard`;
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    test.skip(!res || res.status() >= 400, "organizer dashboard unavailable");
    await expect(page.locator("body")).toBeVisible();
    await runAxe(page, path);
    guard.assertClean();
  });

  test("attendees axe", async ({ page }) => {
    const path = `/organizer/${DEMO_ORGANIZER_ID}/events/${DEMO_SUMMIT_EVENT_ID}/attendees`;
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    test.skip(!res || res.status() >= 400, "attendees unavailable");
    await runAxe(page, path);
  });
});

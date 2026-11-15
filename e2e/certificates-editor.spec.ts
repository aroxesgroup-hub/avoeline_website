import fs from "node:fs";
import { test, expect } from "@playwright/test";
import { AUTH_STATE_PATH, DEMO_ORGANIZER_ID, DEMO_SUMMIT_EVENT_ID } from "./helpers/demo";

const gotoTimeout = { waitUntil: "domcontentloaded" as const, timeout: 120_000 };

function authStateLooksEmpty(): boolean {
  try {
    const raw = fs.readFileSync(AUTH_STATE_PATH, "utf8");
    const json = JSON.parse(raw) as { cookies?: unknown[] };
    return !Array.isArray(json.cookies) || json.cookies.length === 0;
  } catch {
    return true;
  }
}

test.describe("certificates editor + issue smoke", () => {
  test.beforeEach(() => {
    test.skip(
      authStateLooksEmpty(),
      "No demo organizer session — auth.setup soft-skipped (fix DEMO_SEED_PASSWORD).",
    );
  });

  test("SVG editor loads with canvas and preview", async ({ page }) => {
    const base = `/organizer/${DEMO_ORGANIZER_ID}/events/${DEMO_SUMMIT_EVENT_ID}/certificates`;
    await page.goto(`${base}/making-template`, gotoTimeout);
    await expect(page).not.toHaveURL(/\/auth\/signin/, { timeout: 15_000 });
    await expect(page.getByTestId("certificate-editor")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("certificate-canvas")).toBeVisible();
    await page.getByRole("button", { name: /^Preview$/i }).click();
    await expect(page.getByRole("heading", { name: /Certificate preview/i })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("issue page presets and viewer route", async ({ page }) => {
    const base = `/organizer/${DEMO_ORGANIZER_ID}/events/${DEMO_SUMMIT_EVENT_ID}/certificates`;
    await page.goto(base, gotoTimeout);
    await expect(page.getByRole("heading", { name: /Certificates/i }).first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByRole("button", { name: /All confirmed/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Checked-in/i })).toBeVisible();

    // Public viewer route must render (unknown code → not found, still 200).
    const res = await page.goto("/certificate/DEMO-MISSING-CODE", gotoTimeout);
    expect(res?.ok() || (res?.status() ?? 500) < 500).toBeTruthy();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});

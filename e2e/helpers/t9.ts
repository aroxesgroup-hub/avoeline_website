/**
 * T9 plan-gating fixtures from seed:test (fixed UUIDs / emails).
 */
import fs from "node:fs";
import path from "node:path";

export const T9_PASSWORD =
  process.env.SEED_TEST_PASSWORD || process.env.DEMO_SEED_PASSWORD || "AvoelineDemo1!";

export const T9_SOCIAL = {
  email: "org.social@avoeline.test",
  id: "11111111-1111-4111-8111-111111111101",
};
export const T9_PARTIAL = {
  email: "org.partial@avoeline.test",
  id: "11111111-1111-4111-8111-111111111102",
};
export const T9_FULL = {
  email: "org.full@avoeline.test",
  id: "11111111-1111-4111-8111-111111111103",
};
export const T9_ORG_A = {
  email: "org.a@avoeline.test",
  id: "11111111-1111-4111-8111-111111111104",
};
export const T9_ORG_B = {
  email: "org.b@avoeline.test",
  id: "11111111-1111-4111-8111-111111111105",
};
export const T9_VENDOR_A = {
  email: "vendor.a@avoeline.test",
  id: "11111111-1111-4111-8111-111111111106",
};
export const T9_VENDOR_B = {
  email: "vendor.b@avoeline.test",
  id: "11111111-1111-4111-8111-111111111107",
};

export function loadT9Summary(): {
  organizers?: Record<string, { id: string; email: string; eventId?: string }>;
  vendors?: Record<string, { id: string; email: string; bookingId?: string }>;
} | null {
  const p = path.join(process.cwd(), "reports", "security", "t9-seed-summary.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

export async function signInT9(
  page: import("@playwright/test").Page,
  email: string,
  password = T9_PASSWORD,
): Promise<boolean> {
  await page.goto("/auth/signin", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.locator("#signin-password").press("Enter");
  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/auth/signin"), { timeout: 45_000 });
    return true;
  } catch {
    return false;
  }
}

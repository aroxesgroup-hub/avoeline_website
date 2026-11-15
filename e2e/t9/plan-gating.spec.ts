import { expect, test } from "@playwright/test";
import {
  T9_FULL,
  T9_PARTIAL,
  T9_SOCIAL,
  T9_VENDOR_A,
  T9_VENDOR_B,
  loadT9Summary,
  signInT9,
} from "../helpers/t9";

test.describe("T9 plan gating", () => {
  test("Social Lite: nav hides Marketplace/Designer/Ushers; URLs show LockedModulePanel", async ({
    page,
  }) => {
    const summary = loadT9Summary();
    test.skip(!summary?.organizers?.social, "T9 seed missing — npm run seed:test");

    const ok = await signInT9(page, T9_SOCIAL.email);
    test.skip(!ok, "Social Lite login failed");

    const orgId = summary!.organizers!.social.id || T9_SOCIAL.id;
    await page.goto(`/organizer/${orgId}/dashboard`, { waitUntil: "domcontentloaded" });
    test.skip(
      page.url().includes("organizerSetup"),
      "Organizer still in setup — re-run seed:test with onboarding_status=complete",
    );

    const body = await page.content();
    // Layout hides locked module links from the organizer rail
    expect(body).not.toMatch(new RegExp(`/organizer/${orgId}/vendor-marketplace`));
    expect(body).not.toMatch(new RegExp(`/organizer/${orgId}/designer`));
    expect(body).not.toMatch(new RegExp(`/organizer/${orgId}/ushers`));

    for (const [slug, label] of [
      ["vendor-marketplace", /Vendor Store|Activate/i],
      ["designer", /AI Designer|Activate/i],
      ["ushers", /Ushers|Activate/i],
    ] as const) {
      await page.goto(`/organizer/${orgId}/${slug}`, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: label }).first()).toBeVisible({
        timeout: 20_000,
      });
    }

    const eventId = summary!.organizers!.social.eventId;
    if (eventId) {
      await page.goto(`/organizer/${orgId}/events/${eventId}/vendors`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.getByText(/Vendor Store|Activate/i).first()).toBeVisible({
        timeout: 20_000,
      });

      await page.goto(`/organizer/${orgId}/events/${eventId}`, { waitUntil: "domcontentloaded" });
      const tabs = await page.locator("a,button").allTextContents();
      expect(tabs.join(" ")).not.toMatch(/\bVendors\b/);
      expect(tabs.join(" ")).not.toMatch(/\bCertificates\b/);
    }

    if (eventId) {
      await page.goto(`/events/${eventId}`, { waitUntil: "domcontentloaded" });
      const pub = await page.content();
      expect(pub).not.toMatch(/Activate Vendor Store/i);
      expect(pub).not.toMatch(/Activate AI Designer/i);
    }
  });

  test("Partial Ops: certificates unlocked; vendor_store still locked", async ({ page }) => {
    const summary = loadT9Summary();
    test.skip(!summary?.organizers?.partial, "T9 seed missing");

    const ok = await signInT9(page, T9_PARTIAL.email);
    test.skip(!ok, "Partial Ops login failed");

    const orgId = summary!.organizers!.partial.id || T9_PARTIAL.id;
    const eventId = summary!.organizers!.partial.eventId;
    await page.goto(`/organizer/${orgId}/vendor-marketplace`, { waitUntil: "domcontentloaded" });
    test.skip(page.url().includes("organizerSetup"), "Partial still in setup — re-run seed:test");
    await expect(page.getByRole("heading", { name: /Activate Vendor Store/i })).toBeVisible({
      timeout: 20_000,
    });

    if (eventId) {
      await page.goto(`/organizer/${orgId}/events/${eventId}/certificates`, {
        waitUntil: "domcontentloaded",
      });
      const html = await page.content();
      expect(html).not.toMatch(/Activate Certificates/i);
    }
  });

  test("Full: Marketplace / Designer / Ushers open without lock panel", async ({ page }) => {
    const summary = loadT9Summary();
    test.skip(!summary?.organizers?.full, "T9 seed missing");

    const ok = await signInT9(page, T9_FULL.email);
    test.skip(!ok, "Full login failed");

    const orgId = summary!.organizers!.full.id || T9_FULL.id;
    await page.goto(`/organizer/${orgId}/dashboard`, { waitUntil: "domcontentloaded" });
    test.skip(page.url().includes("organizerSetup"), "Full still in setup — re-run seed:test");
    for (const slug of ["vendor-marketplace", "designer", "ushers"] as const) {
      await page.goto(`/organizer/${orgId}/${slug}`, { waitUntil: "domcontentloaded" });
      expect(page.url()).not.toMatch(/organizerSetup/);
      await expect(page.getByRole("heading", { name: /Activate/i })).toHaveCount(0);
    }
  });

  test("Vendor A cannot open Vendor B booking id (IDOR)", async ({ page }) => {
    const summary = loadT9Summary();
    test.skip(
      !summary?.vendors?.a?.bookingId || !summary?.vendors?.b?.bookingId,
      "T9 vendor seed missing",
    );

    const ok = await signInT9(page, T9_VENDOR_A.email);
    test.skip(!ok, "Vendor A login failed");

    const a = summary!.vendors!.a;
    const b = summary!.vendors!.b;
    await page.goto(`/vendor/${a.id}/bookings/${b.bookingId}`, { waitUntil: "domcontentloaded" });
    // notFound → 404 page or soft empty; must not show B's booking chrome
    const html = await page.content();
    expect(html).not.toMatch(/T9 Isolation Event B/i);
    const statusOk =
      page.url().includes("404") ||
      html.match(/not found|doesn.?t exist|page could not/i) ||
      (await page.locator("h1,h2").first().textContent())?.match(/not found/i);
    // Accept 404 UI or redirect away from booking detail
    expect(statusOk || !html.includes(String(b.bookingId))).toBeTruthy();

    await page.goto(`/vendor/${T9_VENDOR_B.id}/bookings/${b.bookingId}`, {
      waitUntil: "domcontentloaded",
    });
    const cross = await page.content();
    expect(cross).not.toMatch(/T9 Isolation Event B/i);
  });
});

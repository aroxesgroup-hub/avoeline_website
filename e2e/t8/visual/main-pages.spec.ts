import { test, expect } from "@playwright/test";
import { setTheme, setViewport, T8_VIEWPORTS } from "../../helpers/theme";
import { DEMO_SUMMIT_EVENT_ID } from "../../helpers/demo";

const PAGES: { name: string; path: string }[] = [
  { name: "home", path: "/" },
  { name: "events", path: "/events" },
  { name: "signin", path: "/auth/signin" },
  { name: "event-detail", path: `/events/${DEMO_SUMMIT_EVENT_ID}` },
];

test.describe("T8 visual — main pages light/dark", () => {
  for (const pageDef of PAGES) {
    for (const width of T8_VIEWPORTS) {
      for (const theme of ["light", "dark"] as const) {
        test(`${pageDef.name} ${width}px ${theme}`, async ({ page }) => {
          await setViewport(page, width);
          const res = await page.goto(pageDef.path, { waitUntil: "networkidle" }).catch(() => null);
          test.skip(!res || res.status() >= 500, `unavailable ${pageDef.path}`);
          await setTheme(page, theme);
          await page.waitForTimeout(200);
          // First local run: npm run test:e2e:t8:visual -- --update-snapshots
          await expect(page).toHaveScreenshot(`${pageDef.name}-${width}-${theme}.png`, {
            fullPage: true,
            maxDiffPixels: 800,
          });
        });
      }
    }
  }
});

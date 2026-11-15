import { test, expect } from "@playwright/test";
import { installConsoleGuard } from "../helpers/consoleGuard";
import { checkSafeTestTarget } from "../../src/lib/testSafety";

test.describe("T8 link crawler", () => {
  test("BFS same-origin links from / and /events — no 404/5xx", async ({ page, baseURL }) => {
    const safety = checkSafeTestTarget({ baseUrl: baseURL || "http://127.0.0.1:3000" });
    expect(safety.ok).toBe(true);

    const guard = installConsoleGuard(page);
    const origin = new URL(baseURL || "http://127.0.0.1:3000").origin;
    const queue = ["/", "/events", "/auth/signin", "/contact", "/about", "/plans"];
    const seen = new Set<string>();
    const broken: string[] = [];
    const maxPages = 40;

    while (queue.length && seen.size < maxPages) {
      const path = queue.shift()!;
      if (seen.has(path)) continue;
      seen.add(path);
      const url = new URL(path, origin).toString();
      const res = await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => null);
      if (!res) {
        broken.push(`${path} (navigation failed)`);
        continue;
      }
      const status = res.status();
      if (status === 404 || status >= 500) {
        broken.push(`${path} → ${status}`);
        continue;
      }
      const hrefs = await page.$$eval("a[href]", (as) =>
        as.map((a) => (a as HTMLAnchorElement).getAttribute("href") || ""),
      );
      for (const href of hrefs) {
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
          continue;
        let next: URL;
        try {
          next = new URL(href, origin);
        } catch {
          continue;
        }
        if (next.origin !== origin) continue;
        if (next.pathname.startsWith("/api/")) continue;
        const key = next.pathname + next.search;
        if (!seen.has(key) && queue.length + seen.size < maxPages + 20) queue.push(key);
      }
    }

    expect(broken, broken.join("\n")).toEqual([]);
    guard.assertClean();
  });
});

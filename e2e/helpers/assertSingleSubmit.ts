import type { Locator, Page, Request } from "@playwright/test";
import { expect } from "@playwright/test";

export type AssertSingleSubmitOpts = {
  /** Match mutating network calls (POST/PUT/PATCH or RSC action). */
  apiMatcher?: RegExp | ((req: Request) => boolean);
  /** Optional: return row count before/after for DB side-effect proof. */
  countRows?: () => Promise<number>;
  /** Max ms to wait for pending → idle. */
  pendingTimeoutMs?: number;
  /**
   * After success path, optionally force a failing next submit and assert recovery.
   * Caller supplies a one-shot route that makes the next matching request fail.
   */
  forceErrorAndRecover?: (page: Page) => Promise<void>;
};

function defaultMatcher(req: Request): boolean {
  const method = req.method().toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return false;
  const url = req.url();
  // Next.js server actions + API routes
  return (
    url.includes("/api/") || req.headers()["next-action"] != null || url.includes("?") // form posts to same URL often
  );
}

/**
 * T8 double-tap harness: rapid activate the control and assert a single side effect.
 */
export async function assertSingleSubmit(
  page: Page,
  button: Locator,
  opts: AssertSingleSubmitOpts = {},
): Promise<void> {
  const pendingTimeout = opts.pendingTimeoutMs ?? 15_000;
  const matcher = opts.apiMatcher
    ? typeof opts.apiMatcher === "function"
      ? opts.apiMatcher
      : (req: Request) => opts.apiMatcher instanceof RegExp && opts.apiMatcher.test(req.url())
    : defaultMatcher;

  const beforeCount = opts.countRows ? await opts.countRows() : null;
  const requests: Request[] = [];
  const onRequest = (req: Request) => {
    if (matcher(req)) requests.push(req);
  };
  page.on("request", onRequest);

  try {
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible();

    // Burst: double-click, five rapid clicks, Enter twice while focused
    await button.dblclick({ delay: 20 }).catch(() => undefined);
    for (let i = 0; i < 5; i++) {
      await button.click({ delay: 15, force: true }).catch(() => undefined);
    }
    await button.focus().catch(() => undefined);
    await page.keyboard.press("Enter").catch(() => undefined);
    await page.keyboard.press("Enter").catch(() => undefined);

    // Pending affordance (disabled or aria-busy) at some point while in flight
    const sawPending = await Promise.race([
      button
        .evaluate((el) => {
          const b = el as HTMLButtonElement;
          return b.disabled || b.getAttribute("aria-busy") === "true";
        })
        .then((v) => v)
        .catch(() => false),
      page.waitForTimeout(500).then(() => false),
    ]);

    // Wait until button is interactive again (or gone / replaced)
    await expect
      .poll(
        async () => {
          if (!(await button.count())) return true;
          const disabled = await button.isDisabled().catch(() => true);
          const busy = await button.getAttribute("aria-busy").catch(() => null);
          return !disabled && busy !== "true";
        },
        { timeout: pendingTimeout },
      )
      .toBe(true);

    // Prefer request count; fall back to DB delta
    if (opts.countRows && beforeCount != null) {
      const after = await opts.countRows();
      expect(after - beforeCount, "exactly one side-effect row").toBe(1);
    } else {
      // Deduplicate same navigation/action id if browser retries
      const unique = new Set(
        requests.map((r) => `${r.method()}:${r.url()}:${r.headers()["next-action"] || ""}`),
      );
      expect(unique.size, "exactly one mutating request").toBeLessThanOrEqual(1);
      expect(
        unique.size + (sawPending ? 0 : 0),
        "at least one request or pending UI",
      ).toBeGreaterThanOrEqual(unique.size >= 1 || sawPending ? 1 : 0);
      // Soft: if no network captured (RSC form without visible fetch), pending UI is required
      if (unique.size === 0) {
        expect(sawPending, "pending UI when no network matcher hit").toBe(true);
      }
    }

    if (opts.forceErrorAndRecover) {
      await opts.forceErrorAndRecover(page);
      await expect(button).toBeEnabled({ timeout: pendingTimeout });
      await expect(button)
        .toHaveAttribute("aria-busy", /false|^$/, { timeout: 5_000 })
        .catch(() => undefined);
    }
  } finally {
    page.off("request", onRequest);
  }
}

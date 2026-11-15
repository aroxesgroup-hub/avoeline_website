import type { ConsoleMessage, Page } from "@playwright/test";

const IGNORE = [
  /Download the React DevTools/i,
  /\[HMR\]/i,
  /favicon\.ico/i,
  /Third-party cookie/i,
  // Local next start has no Vercel Insights / Analytics endpoints
  /_vercel\/speed-insights/i,
  /_vercel\/insights/i,
  /Failed to load resource: the server responded with a status of 404/i,
];

/**
 * Collect console errors / hydration warnings. Call assertNoConsoleErrors before test end.
 */
export function installConsoleGuard(page: Page): {
  errors: string[];
  assertClean: () => void;
} {
  const errors: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();
    if (IGNORE.some((re) => re.test(text))) return;
    if (type === "error") errors.push(`[console.error] ${text}`);
    if (/hydrat|did not match|Text content does not match/i.test(text)) {
      errors.push(`[hydration] ${text}`);
    }
  });
  page.on("pageerror", (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });
  return {
    errors,
    assertClean: () => {
      if (errors.length) {
        throw new Error(`Console / hydration issues:\n${errors.join("\n")}`);
      }
    },
  };
}

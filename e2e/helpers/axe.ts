import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";

/** Fail on axe serious + critical (includes contrast). */
export async function runAxe(page: Page, label?: string): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  if (bad.length) {
    const summary = bad
      .map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help} — ${v.nodes
            .slice(0, 2)
            .map((n) => n.html)
            .join(" | ")}`,
      )
      .join("\n");
    expect(bad, `axe ${label || page.url()}\n${summary}`).toEqual([]);
  }
}

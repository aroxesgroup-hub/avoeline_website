import type { Page } from "@playwright/test";

export type ThemeMode = "light" | "dark";

export async function setTheme(page: Page, mode: ThemeMode): Promise<void> {
  await page.evaluate((m) => {
    document.documentElement.setAttribute("data-theme", m);
    try {
      localStorage.setItem("avoeline-theme", m);
    } catch {
      /* ignore */
    }
  }, mode);
}

export async function setViewport(page: Page, width: number, height = 900): Promise<void> {
  await page.setViewportSize({ width, height });
}

export const T8_VIEWPORTS = [390, 768, 1280, 1536] as const;

import { defineConfig, devices } from "@playwright/test";
import { AUTH_STATE_PATH } from "./e2e/helpers/demo";
import { checkSafeTestTarget } from "./src/lib/testSafety";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

const safety = checkSafeTestTarget({ baseUrl: baseURL });
if (!safety.ok) {
  throw new Error(safety.reason);
}

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  expect: {
    toHaveScreenshot: { maxDiffPixels: 400 },
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    // Prefer installed Chrome when Playwright's bundled browser is missing (CI/sandbox).
    channel: process.env.PW_CHANNEL || "chrome",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/, timeout: 120_000 },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore:
        /auth\.setup\.ts|google-auth\.setup\.ts|organizer-tabs\.spec\.ts|certificates-editor\.spec\.ts|t8\/|t9\/|smoke\.spec\.ts/,
    },
    {
      name: "chromium-auth",
      dependencies: ["setup"],
      testMatch: /organizer-tabs\.spec\.ts|certificates-editor\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATH,
      },
    },
    {
      name: "t8-guest",
      testMatch: /t8\/(screens\/guest|visual|crawler|double-tap\/(registration|surfaces)).*/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "t8-organizer",
      dependencies: ["setup"],
      testMatch: /t8\/(double-tap\/organizer|screens\/organizer).*/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATH,
      },
    },
    {
      name: "t9-plan",
      testMatch: /t9\/.*/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "e2e-smoke",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

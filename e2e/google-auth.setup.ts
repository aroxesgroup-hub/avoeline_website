/**
 * Headed Google session capture (docs/25 A3 / T0).
 *
 * You sign in yourself in the browser — this script never asks for or stores
 * a Google password. Saves Playwright storageState to e2e/.auth/google.json.
 *
 *   npm run auth:google
 *
 * Google Testing mode expires consent ~every 7 days; re-run this script.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { checkSafeTestTarget } from "../src/lib/testSafety";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const outDir = path.join("e2e", ".auth");
const outFile = path.join(outDir, "google.json");

async function main() {
  const safety = checkSafeTestTarget({ baseUrl: baseURL });
  if (!safety.ok) {
    console.error(safety.reason);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const startPath = process.env.GOOGLE_AUTH_START_PATH || "/auth/signin";
  const doneUrlPart = process.env.GOOGLE_AUTH_DONE_URL_PART || "/dashboard";

  console.log("");
  console.log("Google auth capture (headed)");
  console.log("----------------------------");
  console.log(`Opening ${baseURL}${startPath}`);
  console.log("1. Sign in with Google in the browser window (you type the password).");
  console.log("2. Approve consent if prompted.");
  console.log(
    `3. Wait until the URL contains "${doneUrlPart}" (or press Enter here to save early).`,
  );
  console.log("");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto(startPath, { waitUntil: "domcontentloaded", timeout: 120_000 });

  const done = new Promise<void>((resolve) => {
    const onNav = () => {
      if (page.url().includes(doneUrlPart)) resolve();
    };
    page.on("framenavigated", onNav);
    // Allow operator to finish manually
    if (process.stdin.isTTY) {
      process.stdin.setEncoding("utf8");
      process.stdin.once("data", () => resolve());
      console.log("(Press Enter in this terminal to save session whenever you are ready.)");
    }
  });

  await Promise.race([done, new Promise<void>((resolve) => setTimeout(resolve, 15 * 60_000))]);

  await context.storageState({ path: outFile });
  await browser.close();
  console.log(`Saved storageState → ${outFile}`);
  console.log("Keep this file gitignored. Re-run when Google Testing consent expires (~7 days).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

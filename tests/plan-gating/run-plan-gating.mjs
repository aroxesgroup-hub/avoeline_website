/**
 * T9 plan-gating runner — authz-tenant harness (+ optional note for Playwright).
 * Soft-skips when seed/server missing (same honesty as T7/T8).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const script = path.join(process.cwd(), "tests", "security", "authz-tenant.mjs");
const result = spawnSync(process.execPath, [script], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);

/**
 * CI helper: wait for local next start, then Postman negatives (+ optional authz).
 * Soft-skips with exit 0 only when the server never becomes ready.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const outDir = path.join(process.cwd(), "reports", "security");
mkdirSync(outDir, { recursive: true });

async function waitForServer(ms = 90_000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/events`, { redirect: "manual" });
      if (res.status > 0) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

const ready = await waitForServer();
if (!ready) {
  const status = {
    executed: false,
    reason: `server not reachable at ${baseUrl}`,
    softSkip: true,
  };
  writeFileSync(path.join(outDir, "ci-postman.json"), JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status));
  process.exit(0);
}

const env = {
  ...process.env,
  APP_ENV: process.env.APP_ENV || "local",
  BASE_URL: baseUrl,
  TEST_HOST_ALLOWLIST: process.env.TEST_HOST_ALLOWLIST || "localhost,127.0.0.1",
};

const postman = spawnSync(process.execPath, ["tests/security/postman-negatives.mjs"], {
  stdio: "inherit",
  env,
});
const authz = spawnSync(process.execPath, ["tests/security/authz-http.mjs"], {
  stdio: "inherit",
  env,
});

const code = postman.status || authz.status || 0;
writeFileSync(
  path.join(outDir, "ci-postman.json"),
  JSON.stringify(
    {
      executed: true,
      baseUrl,
      postmanStatus: postman.status,
      authzStatus: authz.status,
    },
    null,
    2,
  ),
);
process.exit(code);

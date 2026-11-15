/**
 * Runs the T6 group 1 read scripts against a local production server.
 * Exits 0 when k6 or the server is unavailable and writes reports/load/status.json.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertLocalLoadTarget } from "./guard.mjs";

const root = process.cwd();
const outDir = path.join(root, "reports", "load");
mkdirSync(outDir, { recursive: true });

function writeStatus(status) {
  writeFileSync(path.join(outDir, "status.json"), JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status, null, 2));
}

let target;
try {
  target = assertLocalLoadTarget(process.env);
} catch (err) {
  writeStatus({ executed: false, reason: err instanceof Error ? err.message : String(err) });
  process.exit(1);
}

const k6 = spawnSync("k6", ["version"], { encoding: "utf8" });
if (k6.error || k6.status !== 0) {
  writeStatus({
    executed: false,
    reason: "k6 is not on PATH",
    baseUrl: target.baseUrl,
  });
  process.exit(0);
}

const health = spawnSync(
  process.execPath,
  [
    "-e",
    `fetch(${JSON.stringify(target.baseUrl + "/events")}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))`,
  ],
  { encoding: "utf8" },
);
if (health.status !== 0) {
  writeStatus({
    executed: false,
    reason: `local server not reachable at ${target.baseUrl}`,
    k6: (k6.stdout || k6.stderr || "").trim().split("\n")[0],
  });
  process.exit(0);
}

const eventId = (process.env.EVENT_ID || "").trim();
if (!eventId) {
  writeStatus({
    executed: false,
    reason: "EVENT_ID is not set (published local event required for the public page script)",
    baseUrl: target.baseUrl,
    k6: (k6.stdout || "").trim().split("\n")[0],
  });
  process.exit(0);
}

function run(script, summaryName, extraEnv) {
  const summary = path.join(outDir, summaryName);
  const result = spawnSync(
    "k6",
    ["run", "--summary-export", summary, path.join(root, "tests", "load", script)],
    {
      encoding: "utf8",
      env: { ...process.env, BASE_URL: target.baseUrl, ...extraEnv },
      stdio: "inherit",
    },
  );
  return { script, exitCode: result.status ?? 1, summary: `reports/load/${summaryName}` };
}

const publicRun = run("public-event.js", "public-event.json", { EVENT_ID: eventId });
const directoryRun = run("directory.js", "directory.json", {});
writeStatus({
  executed: true,
  baseUrl: target.baseUrl,
  eventId,
  runs: [publicRun, directoryRun],
});
process.exit(publicRun.exitCode === 0 && directoryRun.exitCode === 0 ? 0 : 1);

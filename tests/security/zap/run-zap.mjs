/**
 * OWASP ZAP baseline (+ optional active) against local next start only.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { assertSecurityTarget } from "../guard.mjs";

const outDir = path.join(process.cwd(), "reports", "security", "zap");
mkdirSync(outDir, { recursive: true });

let target;
try {
  target = assertSecurityTarget(process.env);
  if (target.appEnv !== "local") {
    throw new Error("ZAP runs against local only");
  }
} catch (err) {
  writeFileSync(
    path.join(outDir, "status.json"),
    JSON.stringify(
      { executed: false, reason: err instanceof Error ? err.message : String(err) },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ executed: false, reason: String(err.message || err) }));
  process.exit(0);
}

const health = await fetch(`${target.baseUrl}/events`)
  .then((r) => r.ok)
  .catch(() => false);
if (!health) {
  const status = { executed: false, reason: `server not reachable at ${target.baseUrl}` };
  writeFileSync(path.join(outDir, "status.json"), JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status, null, 2));
  process.exit(0);
}

const docker = spawnSync("docker", ["--version"], { encoding: "utf8", shell: true });
if (docker.error || docker.status !== 0) {
  const status = { executed: false, reason: "docker not on PATH (needed for zaproxy container)" };
  writeFileSync(path.join(outDir, "status.json"), JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status, null, 2));
  process.exit(0);
}

const reportHtml = path.join(outDir, "baseline.html").replace(/\\/g, "/");
const reportMd = path.join(outDir, "baseline.md").replace(/\\/g, "/");
// Use host.docker.internal for Windows Docker Desktop to reach host Next.
const targetUrl = target.baseUrl
  .replace("127.0.0.1", "host.docker.internal")
  .replace("localhost", "host.docker.internal");

const baseline = spawnSync(
  "docker",
  [
    "run",
    "--rm",
    "-t",
    "-v",
    `${path.join(process.cwd(), "reports", "security", "zap").replace(/\\/g, "/")}:/zap/wrk:rw`,
    "ghcr.io/zaproxy/zaproxy:stable",
    "zap-baseline.py",
    "-t",
    targetUrl,
    "-r",
    "baseline.html",
    "-w",
    "baseline.md",
    "-I",
  ],
  { encoding: "utf8", shell: true, timeout: 600_000 },
);

const status = {
  executed: true,
  targetUrl,
  baselineStatus: baseline.status,
  error: baseline.error ? baseline.error.message : null,
  stdoutTail: (baseline.stdout || "").slice(-4000),
  stderrTail: (baseline.stderr || "").slice(-2000),
  reports: {
    html: existsSync(path.join(outDir, "baseline.html")),
    md: existsSync(path.join(outDir, "baseline.md")),
  },
};
writeFileSync(path.join(outDir, "status.json"), JSON.stringify(status, null, 2));
console.log(JSON.stringify(status, null, 2));
process.exit(0);

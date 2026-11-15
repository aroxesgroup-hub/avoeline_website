/**
 * npm audit, osv-scanner, gitleaks — records results; exits 0 when tools missing.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertSecurityTarget } from "./guard.mjs";

const outDir = path.join(process.cwd(), "reports", "security");
mkdirSync(outDir, { recursive: true });

try {
  assertSecurityTarget({
    ...process.env,
    BASE_URL: process.env.BASE_URL || "http://127.0.0.1:3000",
  });
} catch (err) {
  writeFileSync(
    path.join(outDir, "deps.json"),
    JSON.stringify(
      { executed: false, reason: err instanceof Error ? err.message : String(err) },
      null,
      2,
    ),
  );
  process.exit(0);
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: opts.timeout ?? 90_000,
    ...opts,
  });
  return {
    cmd: [cmd, ...args].join(" "),
    status: result.status,
    error: result.error ? result.error.message : null,
    timedOut: result.signal === "SIGTERM" || result.error?.code === "ETIMEDOUT",
    stdout: (result.stdout || "").slice(0, 50_000),
    stderr: (result.stderr || "").slice(0, 20_000),
  };
}

const audit = run("npm", ["audit", "--json", "--audit-level=high"], { timeout: 120_000 });
let auditSummary = { available: !audit.error, status: audit.status };
try {
  const parsed = JSON.parse(audit.stdout || "{}");
  auditSummary = {
    available: true,
    status: audit.status,
    vulnerabilities: parsed.metadata?.vulnerabilities || parsed.vulnerabilities || null,
    high: parsed.metadata?.vulnerabilities?.high ?? null,
    critical: parsed.metadata?.vulnerabilities?.critical ?? null,
  };
} catch {
  auditSummary.rawTail = (audit.stdout || audit.stderr || "").slice(-2000);
}

const osv = run("osv-scanner", ["-r", ".", "--format", "json"], {
  cwd: process.cwd(),
});
const gitleaks = run(
  "gitleaks",
  [
    "detect",
    "--source",
    ".",
    "--report-format",
    "json",
    "--report-path",
    path.join(outDir, "gitleaks.json"),
    "-v",
  ],
  {
    cwd: process.cwd(),
  },
);

const status = {
  executed: true,
  npmAudit: auditSummary,
  osvScanner: {
    available: toolPresent(osv),
    status: osv.status,
    error: osv.error,
    stdoutTail: (osv.stdout || osv.stderr || "").slice(-3000),
  },
  gitleaks: {
    available: toolPresent(gitleaks),
    status: gitleaks.status,
    error: gitleaks.error,
    stdoutTail: (gitleaks.stdout || gitleaks.stderr || "").slice(-3000),
  },
};

function toolPresent(result) {
  if (result.error) return false;
  const text = `${result.stdout || ""}${result.stderr || ""}`;
  if (/not recognized|not found|ENOENT/i.test(text)) return false;
  return true;
}

writeFileSync(path.join(outDir, "deps.json"), JSON.stringify(status, null, 2));
console.log(JSON.stringify(status, null, 2));

const criticalHigh = (auditSummary.critical || 0) > 0 || (auditSummary.high || 0) > 0;
process.exit(criticalHigh ? 1 : 0);

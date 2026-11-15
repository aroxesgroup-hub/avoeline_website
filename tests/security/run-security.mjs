/**
 * T7 orchestrator — runs available layers and writes reports/security/status.json.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { assertSecurityTarget } from "./guard.mjs";

const root = process.cwd();
const outDir = path.join(root, "reports", "security");
mkdirSync(outDir, { recursive: true });

function runNode(script, env = {}) {
  return spawnSync(process.execPath, [path.join(root, script)], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    cwd: root,
  });
}

function runNpm(args) {
  return spawnSync("npm", args, { encoding: "utf8", shell: true, cwd: root });
}

let target;
try {
  target = assertSecurityTarget(process.env);
} catch (err) {
  const status = { executed: false, reason: err instanceof Error ? err.message : String(err) };
  writeFileSync(path.join(outDir, "status.json"), JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status, null, 2));
  process.exit(1);
}

const layers = [];

const unit = runNpm([
  "exec",
  "--",
  "node",
  "--import",
  "tsx",
  "--test",
  "tests/security/__tests__/overrideLive.test.ts",
  "tests/security/__tests__/injection.sanitize.test.ts",
  "tests/security/__tests__/abuse.rateLimit.test.ts",
  "tests/security/__tests__/abuse.businessLogic.test.ts",
  "tests/security/__tests__/urlSafety.test.ts",
  "tests/security/__tests__/emailHeader.test.ts",
  "tests/security/__tests__/certificatesApi.validation.test.ts",
]);
layers.push({ id: "unit", status: unit.status, ok: unit.status === 0 });

for (const [id, script] of [
  ["deps", "tests/security/deps.mjs"],
  ["transport", "tests/security/transport.mjs"],
  ["authz-http", "tests/security/authz-http.mjs"],
  ["postman-neg", "tests/security/postman-negatives.mjs"],
  ["zap", "tests/security/zap/run-zap.mjs"],
]) {
  const r = runNode(script, { BASE_URL: target.baseUrl, APP_ENV: target.appEnv });
  layers.push({
    id,
    status: r.status,
    ok: r.status === 0 || (id === "deps" && r.status === 1) || (id === "zap" && r.status === 0),
    note: id === "deps" && r.status === 1 ? "audit may report vulns — see deps.json" : undefined,
  });
}

const status = {
  executed: true,
  baseUrl: target.baseUrl,
  appEnv: target.appEnv,
  layers,
  artifacts: [
    "reports/security/deps.json",
    "reports/security/transport.json",
    "reports/security/authz-http.json",
    "reports/security/postman-neg.json",
    "reports/security/zap/status.json",
  ].filter((p) => existsSync(path.join(root, p))),
};
writeFileSync(path.join(outDir, "status.json"), JSON.stringify(status, null, 2));
console.log(JSON.stringify(status, null, 2));

const hardFail = layers.some((l) => l.id === "unit" && !l.ok);
process.exit(hardFail ? 1 : 0);

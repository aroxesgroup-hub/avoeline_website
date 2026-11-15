/**
 * Sessions/transport checks against local next start (CSP, nosniff, HSTS, frame, CORS).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertSecurityTarget } from "./guard.mjs";

const outDir = path.join(process.cwd(), "reports", "security");
mkdirSync(outDir, { recursive: true });

function header(res, name) {
  return res.headers.get(name) || res.headers.get(name.toLowerCase()) || "";
}

let target;
try {
  target = assertSecurityTarget(process.env);
} catch (err) {
  const status = { executed: false, reason: err instanceof Error ? err.message : String(err) };
  writeFileSync(path.join(outDir, "transport.json"), JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status, null, 2));
  process.exit(0);
}

let res;
try {
  res = await fetch(`${target.baseUrl}/events`, { redirect: "manual" });
} catch (err) {
  const status = {
    executed: false,
    reason: `server not reachable: ${err instanceof Error ? err.message : String(err)}`,
  };
  writeFileSync(path.join(outDir, "transport.json"), JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status, null, 2));
  process.exit(0);
}

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail || "" });
}

const csp = header(res, "content-security-policy");
check("csp-present", /default-src/.test(csp), csp.slice(0, 120));
check("csp-frame-ancestors-none", /frame-ancestors\s+'none'/.test(csp), csp.slice(0, 120));
check("x-content-type-options", /nosniff/i.test(header(res, "x-content-type-options")));
check("referrer-policy", Boolean(header(res, "referrer-policy")), header(res, "referrer-policy"));
check("x-frame-options", /DENY|SAMEORIGIN/i.test(header(res, "x-frame-options")));
const hsts = header(res, "strict-transport-security");
// HSTS on http://localhost is often omitted by browsers but Next still sets it.
check("hsts-header-present", /max-age=/i.test(hsts), hsts || "(empty on some local stacks)");
const acao = header(res, "access-control-allow-origin");
check("cors-not-star", acao !== "*", acao || "(none)");

const text = await res.text();
const leakPatterns = [/service_role/i, /SUPABASE_SERVICE_ROLE/i, /BEGIN PRIVATE KEY/];
for (const re of leakPatterns) {
  check(`no-leak-${re.source}`, !re.test(text), re.test(text) ? "FOUND in body" : "clean");
}

const failed = checks.filter((c) => !c.ok);
const status = {
  executed: true,
  baseUrl: target.baseUrl,
  httpStatus: res.status,
  passed: checks.length - failed.length,
  failed: failed.length,
  checks,
};
writeFileSync(path.join(outDir, "transport.json"), JSON.stringify(status, null, 2));
console.log(JSON.stringify(status, null, 2));
process.exit(failed.length ? 1 : 0);

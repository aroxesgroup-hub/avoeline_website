/**
 * Unauthenticated / wrong-auth probes against Route Handlers (T7 authz matrix seed).
 * Expects local next start. Does not invent pass if server down.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertSecurityTarget } from "./guard.mjs";

const outDir = path.join(process.cwd(), "reports", "security");
mkdirSync(outDir, { recursive: true });

const PROBES = [
  {
    name: "files-no-auth",
    method: "GET",
    path: "/api/files/00000000-0000-4000-8000-000000000001",
    expect: [401, 403, 404],
  },
  {
    name: "uploads-session-no-auth",
    method: "POST",
    path: "/api/uploads/session",
    body: "{}",
    expect: [401, 403, 400, 405],
  },
  {
    name: "uploads-proof-no-auth",
    method: "POST",
    path: "/api/uploads/proof",
    body: "{}",
    expect: [401, 403, 400, 405],
  },
  {
    name: "picker-token-no-auth",
    method: "GET",
    path: "/api/connections/google/picker-token",
    expect: [401, 403, 302, 307],
  },
  {
    name: "admin-picker-no-auth",
    method: "GET",
    path: "/api/admin/picker-diagnostics",
    expect: [401, 403, 302, 307, 404],
  },
  {
    name: "cron-email-no-secret",
    method: "POST",
    path: "/api/cron/email-outbox",
    body: "{}",
    expect: [401, 403, 404],
  },
  {
    name: "cron-plan-no-secret",
    method: "POST",
    path: "/api/cron/plan-expiry",
    body: "{}",
    expect: [401, 403, 404],
  },
  {
    name: "certificates-bad-id",
    method: "GET",
    path: "/api/certificates/not-a-uuid",
    expect: [400, 401, 403, 404],
  },
  {
    name: "calendar-ics-bad-id",
    method: "GET",
    path: "/api/events/not-a-uuid/calendar.ics",
    expect: [400, 401, 403, 404],
  },
  {
    name: "qr-bad-token",
    method: "GET",
    path: "/api/qr/invalid-token",
    expect: [400, 401, 403, 404],
  },
  {
    name: "connections-start-no-auth",
    method: "GET",
    path: "/api/connections/google/start",
    expect: [401, 403, 302, 307],
  },
  {
    name: "cron-feature-override-get-no-secret",
    method: "GET",
    path: "/api/cron/feature-override-expiry",
    expect: [401, 403, 404],
  },
];

let target;
try {
  target = assertSecurityTarget(process.env);
} catch (err) {
  writeFileSync(
    path.join(outDir, "authz-http.json"),
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
  const status = {
    executed: false,
    reason: `server not reachable at ${target.baseUrl}`,
    baseUrl: target.baseUrl,
  };
  writeFileSync(path.join(outDir, "authz-http.json"), JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status, null, 2));
  process.exit(0);
}

const results = [];
for (const probe of PROBES) {
  try {
    const res = await fetch(`${target.baseUrl}${probe.path}`, {
      method: probe.method,
      headers: probe.body ? { "content-type": "application/json" } : undefined,
      body: probe.body,
      redirect: "manual",
    });
    const ok = probe.expect.includes(res.status);
    results.push({
      name: probe.name,
      status: res.status,
      ok,
      expect: probe.expect,
    });
  } catch (err) {
    results.push({
      name: probe.name,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

const failed = results.filter((r) => !r.ok);
const status = {
  executed: true,
  baseUrl: target.baseUrl,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
};
writeFileSync(path.join(outDir, "authz-http.json"), JSON.stringify(status, null, 2));
console.log(JSON.stringify(status, null, 2));
process.exit(failed.length ? 1 : 0);

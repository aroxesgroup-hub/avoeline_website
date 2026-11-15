/**
 * Ensures a Negative folder exists on the API collection and runs Newman if available.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { assertSecurityTarget } from "./guard.mjs";

const root = process.cwd();
const collectionPath = path.join(root, "tests", "postman", "Avoeline_API.postman_collection.json");
const outDir = path.join(root, "reports", "security");
mkdirSync(outDir, { recursive: true });

const collection = JSON.parse(readFileSync(collectionPath, "utf8"));

function negRequest(name, method, rawUrl, tests) {
  const [pathname, query = ""] = rawUrl.split("?");
  const pathParts = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const queryParams = query
    ? query
        .split("&")
        .filter(Boolean)
        .map((pair) => {
          const [key, ...rest] = pair.split("=");
          return { key, value: rest.join("=") };
        })
    : undefined;
  return {
    name,
    request: {
      method,
      header: [],
      url: rawUrl.startsWith("{{")
        ? rawUrl
        : {
            raw: `{{baseUrl}}${rawUrl}`,
            host: ["{{baseUrl}}"],
            path: pathParts,
            ...(queryParams ? { query: queryParams } : {}),
          },
    },
    event: [
      {
        listen: "test",
        script: {
          type: "text/javascript",
          exec: tests,
        },
      },
    ],
  };
}

const negativeFolder = {
  name: "Negative",
  description: "T7 negatives: missing auth, malformed, oversized, replay-ish. Local/Staging only.",
  item: [
    negRequest("GET files missing auth", "GET", "/api/files/{{fileId}}", [
      "pm.test('not 200 with secrets', () => {",
      "  pm.expect(pm.response.code).to.be.oneOf([401,403,404]);",
      "  pm.expect(pm.response.text()).to.not.match(/service_role/i);",
      "});",
    ]),
    negRequest("POST uploads/session missing auth", "POST", "/api/uploads/session", [
      "pm.test('rejects unauth', () => pm.expect(pm.response.code).to.be.oneOf([400,401,403,405]));",
    ]),
    negRequest("POST uploads/proof missing auth", "POST", "/api/uploads/proof", [
      "pm.test('rejects unauth', () => pm.expect(pm.response.code).to.be.oneOf([400,401,403,405]));",
    ]),
    negRequest("GET picker-token missing auth", "GET", "/api/connections/google/picker-token", [
      "pm.test('rejects unauth', () => pm.expect(pm.response.code).to.be.oneOf([401,403,302,307,404]));",
    ]),
    ...[
      "email-outbox",
      "plan-expiry",
      "certificate-jobs",
      "connections-health",
      "file-promote",
      "linked-files",
      "sheet-syncs",
    ].map((cron) =>
      negRequest(`POST cron ${cron} no secret`, "POST", `/api/cron/${cron}`, [
        "pm.test('rejects', () => pm.expect(pm.response.code).to.be.oneOf([401,403,404,405]));",
      ]),
    ),
    negRequest(
      "GET cron feature-override-expiry no secret",
      "GET",
      "/api/cron/feature-override-expiry",
      ["pm.test('rejects', () => pm.expect(pm.response.code).to.be.oneOf([401,403,404]));"],
    ),
    negRequest("GET connections start missing auth", "GET", "/api/connections/google/start", [
      // Newman follows 307→signin; final page must not leak secrets
      "pm.test('auth gate', () => {",
      "  pm.expect(pm.response.code).to.be.oneOf([200,401,403,302,307,400,404]);",
      "  pm.expect(pm.response.text()).to.not.match(/service_role|refresh_token/i);",
      "  if (pm.response.code === 200) pm.expect(pm.response.text()).to.match(/sign\\s*in|Sign in|password/i);",
      "});",
    ]),
    negRequest(
      "GET connections callback malformed",
      "GET",
      "/api/connections/google/callback?code=bad&state=bad",
      [
        "pm.test('auth gate', () => {",
        "  pm.expect(pm.response.code).to.be.oneOf([200,400,401,403,302,307,404]);",
        "  pm.expect(pm.response.text()).to.not.match(/service_role|refresh_token/i);",
        "});",
      ],
    ),
    negRequest(
      "GET legacy email callback malformed",
      "GET",
      "/api/email/google/callback?code=bad",
      [
        "pm.test('auth gate', () => {",
        "  pm.expect(pm.response.code).to.be.oneOf([200,400,401,403,302,307,404]);",
        "  pm.expect(pm.response.text()).to.not.match(/service_role|refresh_token/i);",
        "});",
      ],
    ),
    negRequest("GET calendar.ics bad event", "GET", "/api/events/not-a-uuid/calendar.ics", [
      "pm.test('rejects', () => pm.expect(pm.response.code).to.be.oneOf([400,401,403,404]));",
    ]),
    negRequest("GET certificate malformed id", "GET", "/api/certificates/not-a-uuid", [
      "pm.test('rejects malformed', () => pm.expect(pm.response.code).to.be.oneOf([400,401,403,404]));",
    ]),
    negRequest("GET qr malformed token", "GET", "/api/qr/invalid-token", [
      "pm.test('rejects', () => pm.expect(pm.response.code).to.be.oneOf([400,401,403,404]));",
    ]),
    negRequest(
      "GET admin picker diagnostics missing auth",
      "GET",
      "/api/admin/picker-diagnostics",
      ["pm.test('rejects', () => pm.expect(pm.response.code).to.be.oneOf([401,403,302,307,404]));"],
    ),
    {
      name: "POST uploads/complete oversized JSON",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: `{"pad":"${"x".repeat(200_000)}"}`,
        },
        url: {
          raw: "{{baseUrl}}/api/uploads/complete",
          host: ["{{baseUrl}}"],
          path: ["api", "uploads", "complete"],
        },
      },
      event: [
        {
          listen: "test",
          script: {
            type: "text/javascript",
            exec: [
              "pm.test('rejects oversized/unauth', () => pm.expect(pm.response.code).to.be.oneOf([400,401,403,413,422,500]));",
            ],
          },
        },
      ],
    },
  ],
};

const items = Array.isArray(collection.item) ? collection.item : [];
const idx = items.findIndex((f) => f.name === "Negative");
if (idx >= 0) items[idx] = negativeFolder;
else items.push(negativeFolder);
collection.item = items;
writeFileSync(collectionPath, JSON.stringify(collection, null, 2) + "\n");

let target;
try {
  target = assertSecurityTarget(process.env);
} catch (err) {
  writeFileSync(
    path.join(outDir, "postman-neg.json"),
    JSON.stringify({ executed: false, reason: err.message, collectionUpdated: true }, null, 2),
  );
  console.log(JSON.stringify({ executed: false, reason: err.message, collectionUpdated: true }));
  process.exit(0);
}

const newman = spawnSync(
  "npx",
  [
    "--yes",
    "newman",
    "run",
    collectionPath,
    "--folder",
    "Negative",
    "--env-var",
    `baseUrl=${target.baseUrl}`,
    "--reporters",
    "cli,json",
    "--reporter-json-export",
    path.join(outDir, "newman-neg.json"),
  ],
  { encoding: "utf8", shell: true, timeout: 180_000 },
);

const status = {
  executed: newman.error ? false : true,
  collectionUpdated: true,
  baseUrl: target.baseUrl,
  newmanStatus: newman.status,
  error: newman.error ? newman.error.message : null,
  stdoutTail: (newman.stdout || "").slice(-3000),
};
writeFileSync(path.join(outDir, "postman-neg.json"), JSON.stringify(status, null, 2));
console.log(JSON.stringify(status, null, 2));
process.exit(newman.status && newman.status !== 0 ? 1 : 0);

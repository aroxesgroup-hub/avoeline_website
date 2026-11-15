/**
 * Refuse production / blocked hosts for Playwright, seeds, and destructive scripts (docs/25 A1).
 */
const BLOCKED_HOSTS = new Set(["avoeline.aroxes.com"]);

export type TestSafetyResult =
  { ok: true; baseUrl: string; host: string; appEnv: string } | { ok: false; reason: string };

export function checkSafeTestTarget(opts: {
  baseUrl?: string;
  appEnv?: string;
  allowlist?: string;
}): TestSafetyResult {
  const appEnv = (opts.appEnv || process.env.APP_ENV || "local").trim().toLowerCase();
  if (appEnv === "production") {
    return { ok: false, reason: "Refusing test target: APP_ENV=production" };
  }

  const raw =
    opts.baseUrl ||
    process.env.PLAYWRIGHT_BASE_URL ||
    process.env.BASE_URL ||
    "http://127.0.0.1:3000";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: `Refusing test target: invalid URL (${raw})` };
  }
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host)) {
    return { ok: false, reason: `Refusing test target: host ${host} is blocked` };
  }

  const allow = (opts.allowlist || process.env.TEST_HOST_ALLOWLIST || "localhost,127.0.0.1")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const allowed = allow.some((entry) => host === entry || host.endsWith(`.${entry}`));
  if (!allowed) {
    return {
      ok: false,
      reason: `Refusing test target: host ${host} is not on TEST_HOST_ALLOWLIST`,
    };
  }

  return { ok: true, baseUrl: url.origin, host, appEnv };
}

export function assertSafeTestTarget(opts: Parameters<typeof checkSafeTestTarget>[0] = {}): void {
  const result = checkSafeTestTarget(opts);
  if (!result.ok) throw new Error(result.reason);
}

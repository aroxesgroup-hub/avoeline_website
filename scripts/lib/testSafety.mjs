/**
 * Node scripts guard — refuse production / avoeline.aroxes.com.
 */
const BLOCKED = new Set(["avoeline.aroxes.com"]);

export function checkSafeTestTarget(env = process.env) {
  const appEnv = (env.APP_ENV || "local").trim().toLowerCase();
  if (appEnv === "production") {
    return { ok: false, reason: "Refusing: APP_ENV=production" };
  }
  const raw = env.BASE_URL || env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: `Refusing: invalid BASE_URL (${raw})` };
  }
  const host = url.hostname.toLowerCase();
  if (BLOCKED.has(host)) {
    return { ok: false, reason: `Refusing: host ${host} is blocked` };
  }
  const allow = (env.TEST_HOST_ALLOWLIST || "localhost,127.0.0.1")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const ok = allow.some((entry) => host === entry || host.endsWith(`.${entry}`));
  if (!ok) {
    return { ok: false, reason: `Refusing: host ${host} not on TEST_HOST_ALLOWLIST` };
  }
  return { ok: true, baseUrl: url.origin, host, appEnv };
}

export function assertSafeTestTargetOrExit(env = process.env) {
  const result = checkSafeTestTarget(env);
  if (!result.ok) {
    console.error(result.reason);
    process.exit(1);
  }
  return result;
}

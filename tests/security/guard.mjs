/**
 * Local + staging only (docs/25 T7). Refuses production and avoeline.aroxes.com.
 */
const BLOCKED = new Set(["avoeline.aroxes.com"]);

export function assertSecurityTarget(env = process.env, opts = {}) {
  const allowStaging = opts.allowStaging !== false;
  const appEnv = (env.APP_ENV || "local").trim().toLowerCase();
  if (appEnv === "production") {
    throw new Error("Refusing security run: APP_ENV=production");
  }
  if (appEnv !== "local" && !(allowStaging && appEnv === "staging")) {
    throw new Error(`Refusing security run: APP_ENV must be local or staging (got ${appEnv})`);
  }

  const raw = env.BASE_URL || "http://127.0.0.1:3000";
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Refusing security run: BASE_URL is not a URL (${raw})`);
  }
  const host = url.hostname.toLowerCase();
  if (BLOCKED.has(host)) {
    throw new Error(`Refusing security run: host ${host} is blocked`);
  }
  const defaultAllow = appEnv === "staging" ? "localhost,127.0.0.1" : "localhost,127.0.0.1";
  const allow = (env.TEST_HOST_ALLOWLIST || defaultAllow)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (appEnv === "local") {
    const ok = allow.some((entry) => host === entry || host.endsWith(`.${entry}`));
    if (!ok) {
      throw new Error(`Refusing security run: host ${host} is not on TEST_HOST_ALLOWLIST`);
    }
  } else if (appEnv === "staging") {
    const ok = allow.some((entry) => host === entry || host.endsWith(`.${entry}`));
    if (!ok) {
      throw new Error(`Refusing security run: staging host ${host} must be on TEST_HOST_ALLOWLIST`);
    }
  }
  return { baseUrl: url.origin, appEnv };
}

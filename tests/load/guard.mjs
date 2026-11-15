/**
 * Local-only gate for k6. Refuses production and any host other than
 * localhost / 127.0.0.1, including avoeline.aroxes.com.
 */
const BLOCKED = new Set(["avoeline.aroxes.com"]);

export function assertLocalLoadTarget(env = process.env) {
  const appEnv = (env.APP_ENV || "local").trim().toLowerCase();
  if (appEnv === "production") {
    throw new Error("Refusing load: APP_ENV=production");
  }
  if (appEnv !== "local") {
    throw new Error(`Refusing load: APP_ENV must be local (got ${appEnv})`);
  }

  const raw = env.BASE_URL || "http://127.0.0.1:3000";
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Refusing load: BASE_URL is not a URL (${raw})`);
  }
  const host = url.hostname.toLowerCase();
  if (BLOCKED.has(host)) {
    throw new Error(`Refusing load: host ${host} is blocked`);
  }
  const allow = (env.TEST_HOST_ALLOWLIST || "localhost,127.0.0.1")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const ok = allow.some((entry) => host === entry || host.endsWith(`.${entry}`));
  if (!ok) {
    throw new Error(`Refusing load: host ${host} is not on TEST_HOST_ALLOWLIST`);
  }
  return { baseUrl: url.origin, appEnv };
}

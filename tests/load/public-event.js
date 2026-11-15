import http from "k6/http";
import { check, sleep } from "k6";

const base = __ENV.BASE_URL || "http://127.0.0.1:3000";
const eventId = __ENV.EVENT_ID;

export const options = {
  scenarios: {
    public_event: {
      executor: "constant-vus",
      vus: 300,
      duration: "5m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

export function setup() {
  if (!eventId) {
    throw new Error("Set EVENT_ID to a published local event");
  }
  const warm = http.get(`${base}/events/${eventId}`);
  if (warm.status !== 200) {
    throw new Error(`Warmup GET /events/${eventId} returned ${warm.status}`);
  }
}

export default function () {
  const res = http.get(`${base}/events/${eventId}`, { tags: { name: "public-event" } });
  const cache = String(res.headers["X-Nextjs-Cache"] || res.headers["x-nextjs-cache"] || "");
  const cc = String(res.headers["Cache-Control"] || res.headers["cache-control"] || "");
  const age = res.headers["Age"] || res.headers["age"];
  check(res, {
    "status 200": (r) => r.status === 200,
    "cache signal": () => /HIT|STALE/i.test(cache) || /s-maxage|max-age/i.test(cc) || Boolean(age),
  });
  sleep(1);
}

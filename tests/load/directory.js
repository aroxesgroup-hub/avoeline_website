import http from "k6/http";
import { check, sleep } from "k6";

const base = __ENV.BASE_URL || "http://127.0.0.1:3000";

export const options = {
  scenarios: {
    directory: {
      executor: "constant-vus",
      vus: 50,
      duration: "2m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

export default function () {
  const path = __ITER % 2 === 0 ? "/events" : "/events?q=concert";
  const res = http.get(`${base}${path}`, { tags: { name: "directory" } });
  check(res, {
    "status 200": (r) => r.status === 200,
  });
  sleep(1);
}

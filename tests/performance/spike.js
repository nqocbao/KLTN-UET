// LP-006 — Spike test
// k6 run tests/performance/spike.js

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export const options = {
  stages: [
    { duration: "10s", target: 100 },
    { duration: "30s", target: 100 },
    { duration: "1m", target: 5 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.10"],
    http_req_duration: ["p(95)<5000"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/client/hotels`);
  check(res, { "no 5xx": (r) => r.status < 500 });
  sleep(0.2);
}

// LP-002 — Load test cho /api/client/hotels
// Chạy: k6 run tests/performance/load_hotels.js
// Tuỳ biến BASE_URL: k6 run -e BASE_URL=http://localhost:5000 ...

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

const reqDuration = new Trend("hotels_req_duration", true);
const reqFailed = new Rate("hotels_req_failed");

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
    hotels_req_duration: ["p(95)<800"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/client/hotels?page=1&limit=10`);
  reqDuration.add(res.timings.duration);
  reqFailed.add(res.status !== 200);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "duration < 1500ms": (r) => r.timings.duration < 1500,
    "body is array-like": (r) => {
      try {
        const body = r.json();
        return Array.isArray(body?.data ?? body?.items ?? body);
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}

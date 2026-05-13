// LP-003 — Load test cho /api/client/search
// k6 run tests/performance/load_search.js

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";
const QUERIES = ["Đà Nẵng", "Hà Nội", "Nha Trang", "Phú Quốc", "Đà Lạt"];

export const options = {
  vus: 30,
  duration: "2m",
  thresholds: {
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.02"],
  },
};

export default function () {
  const q = QUERIES[Math.floor(Math.random() * QUERIES.length)];
  const res = http.get(
    `${BASE_URL}/api/client/search?q=${encodeURIComponent(q)}`
  );
  check(res, {
    "status 200": (r) => r.status === 200,
    "p < 2500ms": (r) => r.timings.duration < 2500,
  });
  sleep(0.5);
}

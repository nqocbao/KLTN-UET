// LP-005 — Load test cho POST /api/chatbot/message (qua RASA)
// k6 run tests/performance/load_chatbot.js

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

const MESSAGES = [
  "Xin chào",
  "Tìm khách sạn ở Đà Nẵng",
  "Tour 3 ngày 2 đêm",
  "Quán phở ngon ở Hà Nội",
  "Có vé máy bay Hà Nội Sài Gòn không",
  "Giá phòng deluxe bao nhiêu",
];

export const options = {
  vus: 10,
  duration: "2m",
  thresholds: {
    http_req_duration: ["p(95)<3500"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const payload = JSON.stringify({
    sender: `vu_${__VU}`,
    message: msg,
  });
  const params = { headers: { "Content-Type": "application/json" } };
  const res = http.post(`${BASE_URL}/api/chatbot/message`, payload, params);

  check(res, {
    "status 200": (r) => r.status === 200,
    "has reply": (r) => {
      try {
        return JSON.stringify(r.json()).length > 0;
      } catch {
        return false;
      }
    },
  });
  sleep(1);
}

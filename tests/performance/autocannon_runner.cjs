/**
 * Autocannon-based load runner — thay thế cho k6 khi chưa cài k6.
 * Chạy: node autocannon_runner.cjs
 *
 * Đo các endpoint chính trong khoảng thời gian ngắn (2 phút khi đầy đủ;
 * smoke profile 30 giây để có số liệu cho báo cáo).
 */
const autocannon = require(require("path").join(__dirname, "..", "api", "node_modules", "autocannon"));
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const PROFILE = process.env.PROFILE || "smoke"; // smoke | full
const SCENARIOS = [
  {
    id: "LP-002-hotels",
    title: "GET /api/client/hotels",
    url: `${BASE_URL}/api/client/hotels?page=1&limit=10`,
    method: "GET",
    connections: PROFILE === "full" ? 50 : 20,
    duration: PROFILE === "full" ? 120 : 30,
  },
  {
    id: "LP-003-search",
    title: "GET /api/client/search?q=Đà Nẵng",
    url: `${BASE_URL}/api/client/search?q=${encodeURIComponent("Đà Nẵng")}`,
    method: "GET",
    connections: PROFILE === "full" ? 30 : 15,
    duration: PROFILE === "full" ? 120 : 30,
  },
  {
    id: "LP-004-login",
    title: "POST /api/client/auth/login",
    url: `${BASE_URL}/api/client/auth/login`,
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "qa@vivu.test", password: "wrong" }),
    connections: PROFILE === "full" ? 20 : 10,
    duration: PROFILE === "full" ? 60 : 30,
  },
  {
    id: "LP-005-chatbot",
    title: "POST /api/chatbot/message",
    url: `${BASE_URL}/api/chatbot/message`,
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sender: "qa-perf", message: "Tìm khách sạn ở Đà Nẵng" }),
    connections: PROFILE === "full" ? 10 : 5,
    duration: PROFILE === "full" ? 120 : 30,
  },
];

function pickFields(r) {
  return {
    requests: r.requests.total,
    rps_avg: r.requests.average,
    duration_s: r.duration,
    latency_avg_ms: r.latency.average,
    latency_p50_ms: r.latency.p50,
    latency_p95_ms: r.latency.p97_5 ?? r.latency.p99,
    latency_p99_ms: r.latency.p99,
    latency_max_ms: r.latency.max,
    errors: r.errors,
    timeouts: r.timeouts,
    non2xx: r.non2xx,
    throughput_kb_avg: Math.round((r.throughput.average ?? 0) / 1024),
  };
}

(async () => {
  const out = {};
  for (const s of SCENARIOS) {
    console.log(`\n=== [${PROFILE}] ${s.id}  ${s.title}  (${s.connections} conn, ${s.duration}s) ===`);
    const result = await autocannon({
      url: s.url,
      method: s.method,
      headers: s.headers,
      body: s.body,
      connections: s.connections,
      duration: s.duration,
      timeout: 30,
    });
    out[s.id] = { meta: { title: s.title, conn: s.connections, dur: s.duration }, ...pickFields(result) };
    console.log(out[s.id]);
  }
  const outPath = path.join(__dirname, `autocannon_${PROFILE}_${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\n[done] Wrote ${outPath}`);
})();

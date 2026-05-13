# Test Cases — Hiệu năng

Công cụ chính: **k6** ([grafana/k6](https://k6.io)). Lý do chọn: HTTP load thuần, JS DSL, output JSON dễ đưa vào báo cáo.

## Thông số hệ thống đo

| Metric | Mô tả | Mục tiêu |
|--------|-------|----------|
| `http_req_duration` p50 | Median latency | ≤ 300ms (read) / ≤ 800ms (write) |
| `http_req_duration` p95 | 95th percentile | ≤ 800ms (read) / ≤ 1500ms (write) |
| `http_req_failed` | Tỷ lệ lỗi | ≤ 1% |
| `iterations/sec` | Throughput | tuỳ scenario |

## Kịch bản

### LP-001 — Smoke (sanity)
- VU = 1, duration = 30s
- Endpoints: `/`, `/api/client/hotels`, `/api/client/tours`
- Mục tiêu: confirm hệ thống còn sống.

### LP-002 — Load `/api/client/hotels`
- Ramp 0 → 50 VU trong 30s, hold 2 phút, ramp xuống 0 trong 30s.
- Mục tiêu: p95 ≤ 800ms, error rate ≤ 1%.
- Script: `tests/performance/load_hotels.js`.

### LP-003 — Search load
- 30 VU constant, 2 phút.
- Endpoint: `/api/client/search?q=Đà Nẵng`.
- Mục tiêu: p95 ≤ 1500ms.
- Script: `tests/performance/load_search.js`.

### LP-004 — Auth login throughput
- 20 VU constant, 1 phút.
- Endpoint: `POST /api/client/auth/login`.
- Mục tiêu: p95 ≤ 600ms, error rate = 0% với cred đúng.

### LP-005 — Chatbot proxy
- 10 VU constant, 2 phút.
- Endpoint: `POST /api/chatbot/message`.
- Mục tiêu: p95 ≤ 3500ms (do qua RASA), error rate ≤ 5%.
- Script: `tests/performance/load_chatbot.js`.

### LP-006 — Spike test
- 0 → 100 VU trong 10s, hold 30s, drop về 5 VU 1 phút.
- Mục tiêu: hệ thống không crash, recovery sau spike.

### LP-007 — Stress (tìm điểm bão hoà)
- Ramp 0 → 200 VU trong 5 phút, hold 5 phút.
- Mục tiêu: tìm RPS tối đa trước khi p95 > 3s.

### LP-008 — Endurance / soak (optional)
- 30 VU trong 30 phút (hoặc 2h nếu khả thi).
- Mục tiêu: phát hiện memory leak, throughput drift.

## Database / RAG

| ID | Case | Tool | Mục tiêu |
|----|------|------|---------|
| LP-DB-001 | Query MongoDB hotels có text index trên name | mongosh `db.hotels.find().explain()` | scan ≤ list size |
| LP-DB-002 | Index trên `province_id`, `price` | – | `IXSCAN`, không `COLLSCAN` |
| LP-RAG-001 | Latency `food_reviews_rag` k=5 | python timer | ≤ 500ms |
| LP-RAG-002 | Throughput retrieval (sequential) | python | ≥ 5 req/s |

## Báo cáo

Sau mỗi run, k6 xuất:
- Console summary (avg, p50, p95, max).
- JSON summary nếu chạy `k6 run --summary-export=summary.json …`.

Đưa vào báo cáo: bảng so sánh **trước / sau** tối ưu (nếu có), chart latency vs VU.

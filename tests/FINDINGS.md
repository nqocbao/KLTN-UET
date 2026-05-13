# Findings từ lần chạy test (2026-05-10)

Tổng hợp các phát hiện thực tế khi chạy bộ test trên môi trường: backend đang chạy local, MongoDB Atlas, RASA chưa khởi động, Node 20.19.5, Jest 29.7.

## ✅ Pass

- 16/16 Jest API tests pass.
- Auth endpoints xử lý đúng các trường hợp lỗi (400/401).
- Admin guard chặn đúng request không có token.
- Helmet + CORS đang hoạt động (phản hồi có header bảo mật cơ bản).

## ⚠️ Findings cần xử lý

### F-001 — Endpoint `/api/client/search` chưa mount route
- **Mức**: High (chức năng).
- **Mô tả**: File `server/routes/client/search.routes.ts` định nghĩa `GET /smart`, nhưng `server/routes/client/index.ts` không `app.use("/search", searchRoutes)`. Khi gọi `/api/client/search?q=...` hay `/api/client/search/smart?q=...` đều trả 404.
- **Ảnh hưởng**: nếu frontend gọi smart search, sẽ luôn 404. Test perf LP-003 ghi nhận 113.277 request đều `non-2xx`.
- **Đề xuất fix**: thêm 2 dòng trong `server/routes/client/index.ts`:
  ```ts
  import searchRoutes from "./search.routes.js";
  router.use("/search", searchRoutes);
  ```

### F-002 — `POST /auth/login` trả 500 khi nhận object trong field
- **Mức**: Medium (stability + security hardening).
- **Mô tả**: TC-SEC-008 gửi payload `{"email": {"$ne": null}, "password": {"$ne": null}}`. Mongoose từ chối nhưng controller không catch sớm → trả HTTP 500 thay vì 400/401. Auth không bị bypass nhưng có thể leak stack trace.
- **Đề xuất fix**: thêm input validation (Joi/Zod) trước khi gọi `User.findOne({ email })`. Kiểm tra `typeof email !== "string"` và `typeof password !== "string"`.

### F-003 — Hiệu năng `/api/client/hotels` thấp hơn mục tiêu
- **Mức**: Medium (hiệu năng).
- **Mô tả**: Với 20 connection, 30s:
  - avg = **1255 ms**, p50 = 1061 ms, p95 = **2787 ms**, p99 = 2877 ms, max = 3204 ms.
  - 0 error, 0 non-2xx.
  - Throughput chỉ **15.57 RPS**.
- Mục tiêu đặt ra ở `tests/cases/performance.md`: p95 ≤ 800ms.
- **Khả năng nguyên nhân**: query không có index, populate Mongoose nhiều cấp, không paginate đúng, hoặc latency mạng tới MongoDB Atlas.
- **Đề xuất**:
  1. Profile query với `.explain("executionStats")` xem có `IXSCAN` hay `COLLSCAN`.
  2. Đảm bảo index `{ province_id: 1 }`, `{ price: 1 }`, `{ is_active: 1 }`.
  3. Thêm `.lean()` cho query đọc.
  4. Cache layer (Redis) cho top hit list.
  5. Dùng MongoDB local thay vì Atlas khi đo perf để loại trừ network overhead.

### F-004 — RASA chưa khởi động khi test
- **Mức**: Info (môi trường).
- **Mô tả**: `curl http://localhost:5005/` trả lỗi connection. Test chatbot proxy vẫn pass do nhánh assert chấp nhận 5xx, nhưng số liệu LP-005 (38 RPS, p95 155ms) chỉ là proxy fail-fast — không phản ánh hiệu năng RASA thật.
- **Đề xuất**: chạy `START_ALL.bat` hoặc `cd chatbot && rasa run --enable-api --cors "*"` rồi chạy lại LP-005 để có số RPS/latency có ý nghĩa.

### F-005 — Coverage chưa instrument được vì test integration ngoài tiến trình
- **Mức**: Info (tooling).
- **Mô tả**: `jest --coverage` báo 0/0 vì các test gọi qua HTTP tới backend đang chạy ở tiến trình khác. Jest chỉ có thể đo coverage ở mã import trực tiếp.
- **Đề xuất** (chọn 1):
  1. Tách `server/index.ts` thành `app.ts` (export `app`) và `index.ts` (chỉ `app.listen`). Sau đó test có thể `import app` và Supertest gọi in-process — khi đó Jest đo coverage được.
  2. Chạy server với `c8` (`npx c8 --reporter=lcov tsx watch index.ts`) khi chạy test → c8 ghi coverage Node.js V8.

## Kết quả perf (smoke 30s mỗi kịch bản, 2026-05-10)

| Kịch bản | Conn | RPS | avg (ms) | p50 (ms) | p95 (ms) | p99 (ms) | max (ms) | non-2xx |
|---------|-----:|----:|---------:|---------:|---------:|---------:|---------:|--------:|
| LP-002 GET /hotels | 20 | 15.57 | 1255 | 1061 | 2787 | 2877 | 3204 | 0 |
| LP-003 GET /search?q=… | 15 | 3776 | 3.5 | 3 | 7 | 8 | 31 | 113277 (404) |
| LP-004 POST /auth/login (sai pwd) | 10 | 105 | 94 | 57 | 468 | 482 | 526 | 3148 (401) |
| LP-005 POST /chatbot/message (RASA down) | 5 | 38 | 130 | 129 | 155 | 165 | 224 | 1149 (proxy fail) |

> File JSON gốc: `tests/performance/autocannon_smoke_*.json`.

## Tổng quan Jest

```
Test Suites: 3 passed, 3 total
Tests:       16 passed, 16 total
Time:        2.866 s
```

Chi tiết: `tests/api/test-results.json`.

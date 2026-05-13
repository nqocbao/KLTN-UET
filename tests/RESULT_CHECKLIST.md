# Checklist số liệu cần điền sau khi chạy test

Dùng cho Chương 5. Mỗi mục có **nguồn lệnh** đi kèm để biết lấy số ở đâu.

## A. Tổng số test cases

- [ ] Tổng số testcase chức năng client (TC-U-*): **___ cases**
  - Nguồn: đếm trong `tests/cases/user.md` (≈ 30).
- [ ] Tổng số testcase admin (TC-ADM-*): **___ cases**
  - Nguồn: `tests/cases/admin.md` (≈ 34).
- [ ] Tổng số testcase API (TC-API-*): **___ cases**
  - Nguồn: `tests/cases/api_backend.md`.
- [ ] Tổng số testcase frontend (TC-FE-*): **___ cases**
  - Nguồn: `tests/cases/frontend.md`.
- [ ] Tổng số testcase chatbot/RAG: **___ cases**
  - Nguồn: `tests/cases/chatbot_rag.md`.
- [ ] Tổng số testcase bảo mật: **___ cases**
  - Nguồn: `tests/cases/security.md`.
- [ ] Tổng số testcase hiệu năng: **___ kịch bản**
  - Nguồn: `tests/cases/performance.md`.

## B. Pass / Fail (đã chạy 2026-05-10)

| Nhóm | # tests run | # pass | # fail | # skipped | Nguồn |
|------|-------------|--------|--------|-----------|-------|
| Jest API | **16** | **16** | **0** | 0 | `tests/api/test-results.json` |
| Playwright FE | ___ | ___ | ___ | ___ | (chưa chạy) |
| RASA NLU cross-val | ___ | ___ | ___ | ___ | (chưa chạy) |
| pytest RAG smoke (5 testcase) | 1 (3 config) | 3 | 0 | 0 | `chatbot/rag/outputs/rag_eval_summary_smoke_chuong5.json` |
| Manual chức năng | ___ | ___ | ___ | ___ | – |
| Bảo mật | 1 (TC-SEC-008) | 1 | 0 | 0 | có finding F-002 |

Nguồn: console output Jest, file `chatbot/results/nlu/intent_report.json`, …

## C. Coverage (server)

- [ ] Statements: ___ %
- [ ] Branches: ___ %
- [ ] Functions: ___ %
- [ ] Lines: ___ %

Nguồn: `tests/api/coverage/lcov-report/index.html` (sau `npm run test:coverage`).

## D. Hiệu năng (đã chạy autocannon smoke 30s/kịch bản, 2026-05-10)

| Endpoint | Conn | Duration | RPS | avg (ms) | p50 (ms) | p95 (ms) | p99 (ms) | Max (ms) | non-2xx | Ghi chú |
|---------|-----:|---------|----:|---------:|---------:|---------:|---------:|---------:|--------:|--------|
| `GET /api/client/hotels` (LP-002) | 20 | 30s | 15.57 | **1255** | 1061 | **2787** | 2877 | 3204 | 0 | F-003: chậm hơn mục tiêu p95 ≤ 800ms |
| `GET /api/client/search?q=…` (LP-003) | 15 | 30s | 3776 | 3.5 | 3 | 7 | 8 | 31 | **113277** | F-001: route chưa mount → 404 |
| `POST /api/client/auth/login` (sai pwd) (LP-004) | 10 | 30s | 105 | 94 | 57 | 468 | 482 | 526 | 3148 | non-2xx = 401 (kỳ vọng) |
| `POST /api/chatbot/message` (LP-005) | 5 | 30s | 38 | 130 | 129 | 155 | 165 | 224 | 1149 | F-004: RASA không chạy nên proxy fail-fast |

Nguồn: `tests/performance/autocannon_smoke_*.json`. Cần chạy lại với profile `full` (2 phút) sau khi fix F-001 và bật RASA để có số liệu đại diện.

## E. RAG retrieval (smoke 5 testcase, run_id=smoke_chuong5)

| Config | Recall@1 | Recall@3 | Recall@5 | MRR | Latency cold (ms) | Latency warm (ms) |
|--------|---------|---------|---------|-----|-------------------|-------------------|
| `minilm_sent_800` | 0.00 | 0.20 | **0.40** | **0.14** | 35216.6 | 191.4* |
| `e5_small_sent_800` | 0.00 | 0.20 | 0.40 | 0.14 | 94143.5 | 7552.4* |
| `vn_emb_sent_800` | 0.00 | 0.00 | 0.00 | 0.00 | 207410.4 | 15354.8* |

\* Warm latency lấy từ `rag_eval_summary_smoke_remapped.json` (lần chạy trước).

Cần chạy full (toàn 500 testcase, bỏ `--limit 5`) để có số liệu chính thức. Mẫu 5 quá nhỏ.

## F. RAG generation (DeepEval)

| Config | Answer Relevancy | Faithfulness | Contextual Relevancy | Hallucination |
|--------|------------------|--------------|----------------------|---------------|
| `minilm_sent_800` | ___ | ___ | ___ | ___ |
| `e5_small_sent_800` | ___ | ___ | ___ | ___ |
| `vn_emb_sent_800` | ___ | ___ | ___ | ___ |

Nguồn: cùng file summary, các trường `average_answer_relevancy`, `average_faithfulness`, `average_contextual_recall`, …

## G. RASA NLU

- [ ] Intent macro F1: ___
- [ ] Intent accuracy: ___
- [ ] Entity F1: ___
- [ ] Số intent có F1 < 0.6 (cần cải thiện): ___

Nguồn: `chatbot/results/nlu/intent_report.json`, `entity_report.json`.

## H. Bảo mật

- [ ] Tất cả endpoint admin từ chối user không có token: PASS / FAIL
- [ ] Mật khẩu lưu ở DB là bcrypt hash: PASS / FAIL
- [ ] JWT_SECRET không phải default: PASS / FAIL
- [ ] Helmet headers có mặt: PASS / FAIL
- [ ] CORS đã siết whitelist origin (không `*`): PASS / FAIL — ghi rõ nếu chưa
- [ ] NoSQL injection trên login bị chặn: PASS / FAIL
- [ ] OWASP ZAP baseline scan — số High/Med/Low: ___ / ___ / ___
- [ ] `npm audit` server — High/Critical: ___
- [ ] `npm audit` client — High/Critical: ___

## I. Khác

- [ ] Số intent + entity hỗ trợ: 21 intent / 14 entity (đã chốt từ `domain.yml`).
- [ ] Số trang frontend đã smoke test: ___ / 13
- [ ] Browser đã test: Chrome / Firefox / Edge / Safari (đánh dấu)

---

**Sau khi điền xong**, copy số liệu sang các bảng tương ứng trong `docs/Chuong5.tex`.

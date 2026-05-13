# RUN GUIDE — VivuTravel Tests

Hướng dẫn chạy từng nhóm test và xuất coverage / báo cáo. Tất cả command chạy từ root project `d:/KLTN UET`.

---

## 0. Tiền điều kiện

- Node.js ≥ 18, Python 3.10, MongoDB chạy local hoặc Atlas, k6 (cho performance), gh / curl tuỳ chọn.
- Backend đã chạy: `cd server && npm run dev` (port 5000).
- RASA + Actions: `START_ALL.bat` hoặc `cd chatbot && rasa run --enable-api --cors "*"` + `rasa run actions`.
- Frontend (cho Playwright): `cd client && npm run dev` (port 3000).

---

## 1. Backend API tests (Jest + Supertest)

### Cài đặt lần đầu
```powershell
cd tests/api
npm install
```

### Chạy tất cả + coverage
```powershell
cd tests/api
npm run test:coverage
```
Kết quả coverage: `tests/api/coverage/lcov-report/index.html`.

### Chạy một file
```powershell
cd tests/api
npm run test:auth
npm run test:hotels
npm run test:chatbot
```

### Lưu kết quả JUnit XML (cho CI / báo cáo)
```powershell
cd tests/api
npx jest --reporters=default --reporters=jest-junit
```

### Biến môi trường
- `TEST_API_URL` (mặc định `http://localhost:5000`)
- `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`

> Lưu ý: test sẽ tự skip nếu backend không lên — không fail false positive khi môi trường thiếu.

---

## 2. Frontend tests (Playwright — đề xuất, chưa cấu hình sẵn)

```powershell
cd client
npm i -D @playwright/test
npx playwright install
npx playwright codegen http://localhost:3000   # ghi kịch bản
npx playwright test --reporter=html,junit
```
Kết quả: `client/playwright-report/index.html`.

Map test cases ở `tests/cases/frontend.md` sang file `client/e2e/*.spec.ts`.

---

## 3. Chatbot RASA tests

### NLU cross-validation (intent F1, accuracy, entity F1)
```powershell
cd chatbot
venv\Scripts\activate
rasa test nlu --cross-validation --runs 1 --folds 5 --out results/nlu/
```
Output: `chatbot/results/nlu/intent_report.json`, `entity_report.json`, confusion matrices.

### Core / story test
```powershell
cd chatbot
rasa test core --stories data/stories.yml --out results/core/
```

### Custom intent test bằng REST (TC-NLU-*)
```powershell
cd tests/chatbot
pip install -r requirements.txt
pytest test_rasa_intents.py -v --html=report.html --self-contained-html
```

---

## 4. RAG retrieval + DeepEval

### Smoke (5 testcase, retrieval-only, không tốn LLM)
```powershell
cd chatbot
venv_rag_eval\Scripts\activate
python rag/eval_rag_deepeval.py ^
  --testcases rag/testcases_vivutravel_500_remapped.json ^
  --configs rag/rag_configs.json ^
  --limit 5 --skip-deepeval --llm-provider none ^
  --run-id smoke_demo
```
Output: `chatbot/rag/outputs/rag_eval_summary_smoke_demo.{json,csv}` + details file.

### Full retrieval (toàn 500 testcase, không LLM)
```powershell
python rag/eval_rag_deepeval.py ^
  --testcases rag/testcases_vivutravel_500_remapped.json ^
  --configs rag/rag_configs.json ^
  --skip-deepeval --llm-provider none ^
  --run-id retrieval_full
```

### Full + DeepEval (cần OPENAI_API_KEY hoặc GEMINI_API_KEY trong chatbot/.env)
```powershell
python rag/eval_rag_deepeval.py ^
  --testcases rag/testcases_vivutravel_500_remapped.json ^
  --configs rag/rag_configs.json ^
  --llm-provider openai --llm-model gpt-4o-mini ^
  --enable-hallucination ^
  --run-id deepeval_full
```

### Pytest wrapper
```powershell
cd tests/chatbot
pytest test_rag_retrieval.py -v
```

---

## 5. Performance (k6)

### Cài k6
- Windows: `winget install k6` hoặc `choco install k6`.

### Chạy từng kịch bản
```powershell
k6 run tests/performance/load_hotels.js
k6 run tests/performance/load_search.js
k6 run tests/performance/load_chatbot.js
k6 run tests/performance/spike.js
```

### Xuất JSON summary
```powershell
k6 run --summary-export=tests/performance/out_hotels.json tests/performance/load_hotels.js
```

### Đổi BASE_URL
```powershell
k6 run -e BASE_URL=https://staging.vivutravel.local tests/performance/load_hotels.js
```

---

## 6. Bảo mật (manual / scanner)

```powershell
# OWASP ZAP baseline (cần Docker)
docker run -t owasp/zap2docker-stable zap-baseline.py ^
  -t http://host.docker.internal:5000 -r tests/zap_report.html

# Dependency audit
cd server && npm audit --omit=dev
cd ../client && npm audit --omit=dev
cd ../chatbot && pip-audit
```

Test cases bảo mật automate: nằm trong `tests/api/__tests__/auth.test.ts` (NoSQL injection, JWT scenario).

---

## 7. Tổng hợp coverage

Sau khi chạy `npm run test:coverage` ở `tests/api/`, mở `tests/api/coverage/lcov-report/index.html`. Lấy số `Statements/Branches/Functions/Lines` ở header bảng để điền vào `tests/RESULT_CHECKLIST.md` và báo cáo Chương 5.

---

## 8. Quy trình đề xuất cho thesis

1. Khởi động backend, RASA, Actions, MongoDB.
2. Chạy lần lượt: Jest → Playwright (nếu có) → RASA NLU → RAG smoke → RAG full retrieval → k6 (LP-002, LP-003, LP-005).
3. Điền số liệu vào `tests/RESULT_CHECKLIST.md`.
4. Copy bảng từ `tests/cases/*.md` + LaTeX trong `docs/Chuong5.tex` vào báo cáo.

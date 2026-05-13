# VivuTravel — Test Suite

Bộ test artifacts cho hệ thống VivuTravel (KLTN UET).

## Cấu trúc

```
tests/
├── README.md                  ← file này
├── coverage_map.md            ← bản đồ phủ test theo module
├── RUN_GUIDE.md               ← hướng dẫn chạy test + xuất coverage
├── RESULT_CHECKLIST.md        ← checklist số liệu cần điền sau khi chạy
├── cases/                     ← test cases (markdown + bảng)
│   ├── user.md
│   ├── admin.md
│   ├── api_backend.md
│   ├── frontend.md
│   ├── chatbot_rag.md
│   ├── security.md
│   └── performance.md
├── api/                       ← Jest + Supertest scaffolding cho backend
│   ├── package.json
│   ├── jest.config.ts
│   ├── tsconfig.json
│   ├── helpers/
│   │   └── app.ts
│   └── __tests__/
│       ├── auth.test.ts
│       ├── hotels.test.ts
│       └── chatbot.test.ts
├── chatbot/                   ← Pytest scaffolding cho RASA + RAG
│   ├── requirements.txt
│   ├── conftest.py
│   ├── test_rasa_intents.py
│   └── test_rag_retrieval.py
└── performance/               ← k6 load testing
    ├── load_hotels.js
    ├── load_search.js
    └── load_chatbot.js
```

## Tổng quan

| Lớp | Framework đề xuất | Hiện trạng |
|-----|-------------------|-----------|
| Backend API (Express) | Jest + Supertest | Chưa có — scaffolding ở `tests/api/` |
| Frontend (Next.js) | Playwright (E2E) | Chưa có — đề xuất ở `cases/frontend.md` |
| Chatbot intent/entity | RASA NLU test | Lệnh đã có, dữ liệu ở `chatbot/data/` |
| RAG retrieval/answer | DeepEval (đã có) | Đang chạy được — `chatbot/rag/eval_rag_deepeval.py` |
| Hiệu năng | k6 (HTTP load) | Chưa có — scaffolding ở `tests/performance/` |
| Bảo mật | Manual + ZAP/nikto | Checklist ở `cases/security.md` |

Xem [RUN_GUIDE.md](RUN_GUIDE.md) để biết command chạy + xuất coverage.

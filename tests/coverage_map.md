# Test Coverage Map — VivuTravel

Bảng phủ test theo module. Cột phủ test (✓ = có scaffolding, ✗ = chưa, • = thủ công).

## Backend (server/)

| Module | File chính | Unit | API (integration) | Security | Perf | Test cases ID |
|--------|------------|:----:|:----:|:----:|:----:|---------------|
| Auth (register/login/me) | `controllers/client/auth.controller.ts` | ✓ | ✓ | ✓ | ✓ | TC-AUTH-* |
| JWT middleware | `middlewares/JWT.middlewares.ts` | ✓ | • | ✓ | ✗ | TC-SEC-001..004 |
| Admin auth | `middlewares/admin/auth.middlewares.ts` | ✓ | ✓ | ✓ | ✗ | TC-ADM-001..003 |
| Hotels (admin CRUD) | `controllers/admin/hotels.controller.ts` | ✗ | ✓ | • | ✓ | TC-ADM-HOTEL-* |
| Hotels (client read) | route `/api/client/hotels` | ✗ | ✓ | ✗ | ✓ | TC-API-HOTEL-* |
| Tours | `controllers/admin/tours.controller.ts` | ✗ | ✓ | • | ✓ | TC-API-TOUR-* |
| Restaurants | `controllers/admin/restaurants.controller.ts` | ✗ | ✓ | • | ✓ | TC-API-RES-* |
| Destinations | `controllers/admin/destinations.controller.ts` | ✗ | ✓ | • | ✓ | TC-API-DEST-* |
| Flights | route `/api/client/flights` | ✗ | ✓ | ✗ | ✓ | TC-API-FLIGHT-* |
| Buses | route `/api/client/buses` | ✗ | ✓ | ✗ | ✗ | TC-API-BUS-* |
| Airport transfers | route `/api/client/airport-transfers` | ✗ | ✓ | ✗ | ✗ | TC-API-AT-* |
| Search | `controllers/client/search.controller.ts` | ✗ | ✓ | ✗ | ✓ | TC-API-SEARCH-* |
| Food reviews (client) | `controllers/client/food_reviews.controller.ts` | ✗ | ✓ | ✗ | ✗ | TC-API-FOOD-* |
| Reviews | `controllers/admin/reviews.controller.ts` | ✗ | ✓ | • | ✗ | TC-API-REVIEW-* |
| Favourites | `controllers/admin/favourites.controller.ts` | ✗ | ✓ | ✓ | ✗ | TC-API-FAV-* |
| Users (admin) | `controllers/admin/users.controller.ts` | ✗ | ✓ | ✓ | ✗ | TC-ADM-USER-* |
| Roles & Permissions | `controllers/admin/roles.controller.ts` | ✗ | ✓ | ✓ | ✗ | TC-ADM-RBAC-* |
| Locations (province/district/ward) | nhiều controller | ✗ | ✓ | ✗ | ✗ | TC-API-LOC-* |
| Chatbot proxy | `controllers/chatbot.controller.ts` | ✗ | ✓ | ✗ | ✓ | TC-CHAT-API-* |
| Itinerary recommend | `getItineraryRecommendation` | ✗ | ✓ | ✗ | ✓ | TC-CHAT-RECO-* |
| SerpAPI service | `services/serpapi.service.ts` | ✗ | • | ✗ | ✗ | TC-INT-SERP-* |
| Apify service | `services/apify-facebook-post.service.ts` | ✗ | • | ✗ | ✗ | TC-INT-APIFY-* |

## Frontend (client/)

| Trang / Component | Path | Smoke | E2E (Playwright) | Visual | A11y |
|------------------|------|:----:|:----:|:----:|:----:|
| Trang chủ | `app/[locale]/page.tsx` | ✓ | ✓ | • | • |
| Hotels list/search | `app/[locale]/hotels/` | ✓ | ✓ | • | • |
| Hotel detail | `app/[locale]/hotels/[id]/` | ✓ | ✓ | • | • |
| Tours list/search | `app/[locale]/tours/` | ✓ | ✓ | • | • |
| Tour detail | `app/[locale]/tours/[id]/` | ✓ | ✓ | • | • |
| Flights search | `app/[locale]/flights/` | ✓ | ✓ | • | • |
| Buses search | `app/[locale]/buses/` | ✓ | ✓ | • | • |
| Airport transfer | `app/[locale]/airport-transfer/` | ✓ | ✓ | • | • |
| Foodtour | `app/[locale]/foodtour/` | ✓ | ✓ | • | • |
| Account (favourites, orders, profile, …) | `app/[locale]/account/` | ✓ | ✓ | • | • |
| Auth (login/register) | components/auth | ✓ | ✓ | • | • |
| Admin pages | `app/[locale]/admin/*` | ✓ | ✓ | • | • |
| Chatbot widget | `components/common/ChatBot.tsx` (+ `components/chatbot/`) | ✓ | ✓ | • | • |

## Chatbot (chatbot/)

| Khía cạnh | Tài nguyên | Tool | Trạng thái |
|----------|-----------|------|-----------|
| Intent classification | `data/nlu.yml` | `rasa test nlu` | ✓ chạy được |
| Entity extraction | `data/nlu.yml` | `rasa test nlu` | ✓ chạy được |
| Story / dialog | `data/stories.yml`, `data/rules.yml` | `rasa test core` | ✓ chạy được |
| Custom actions | `actions/actions.py` | pytest (mock) | ✗ — scaffolding ở `tests/chatbot/` |
| RAG retrieval (Recall@k, MRR) | `rag/eval_embedding_mrr.py` | python | ✓ |
| RAG E2E (DeepEval — answer relevancy/faithfulness/contextual relevancy) | `rag/eval_rag_deepeval.py` | DeepEval | ✓ |

## Bảo mật

| Hạng mục | Phương pháp | Test cases |
|---------|-------------|-----------|
| Auth (no token / invalid token / expired) | Supertest | TC-SEC-001..003 |
| RBAC (admin route, non-admin user) | Supertest | TC-SEC-004..005 |
| SQL/NoSQL injection (input via query/body) | thủ công + Supertest payload | TC-SEC-006..008 |
| XSS reflected/stored (review/foodtour content) | thủ công + curl | TC-SEC-009..010 |
| Rate limiting / DoS basic | k6 stress | TC-SEC-011 |
| Header bảo mật (helmet) | curl + httpheader scanner | TC-SEC-012 |
| Mật khẩu lưu hash (bcrypt salt) | code review + DB inspect | TC-SEC-013 |
| CORS | curl với Origin lạ | TC-SEC-014 |
| File upload (nếu có) | thủ công | TC-SEC-015 |

## Hiệu năng

| Endpoint | Mục tiêu | Công cụ |
|---------|---------|---------|
| `GET /api/client/hotels` (list) | p95 ≤ 800ms @ 50 RPS | k6 |
| `GET /api/client/hotels?province=…` (filter) | p95 ≤ 1200ms @ 50 RPS | k6 |
| `GET /api/client/search?q=…` | p95 ≤ 1500ms @ 30 RPS | k6 |
| `POST /api/client/auth/login` | p95 ≤ 600ms @ 20 RPS | k6 |
| `POST /api/chatbot/message` | p95 ≤ 3500ms @ 10 RPS | k6 |
| RAG retrieval (`food_reviews_rag`) | latency ≤ 500ms @ k=5 | python eval |

## Tổng số module / endpoint

- Server admin routes: **29 module**
- Server client routes: **16 module**
- Server chatbot routes: **6 endpoint**
- Frontend pages chính: **13 nhóm trang** (chưa kể i18n)
- RASA intents: **21** ; entities: **14**

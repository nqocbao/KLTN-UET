# Test Cases — API Backend

Phạm vi: tất cả endpoint dưới `/api/client/*`, `/api/admin/*`, `/api/chatbot/*`. Tự động hoá bằng Jest + Supertest (xem `tests/api/`).

## Hợp đồng chung

- Mọi response thành công: `{ success: true, data: ... }` hoặc `{ success: true, message, data, token }`.
- Lỗi: `{ success: false, message | error: <string> }` + HTTP code phù hợp.
- Tất cả admin endpoint yêu cầu `Authorization: Bearer <token>` (role admin).

## Auth (`/api/client/auth`)

| ID | Endpoint | Case | Expected |
|----|---------|------|---------|
| TC-API-AUTH-001 | POST /register | Body hợp lệ | 201, có token |
| TC-API-AUTH-002 | POST /register | Email tồn tại | 400 |
| TC-API-AUTH-003 | POST /register | Body trống | 400 |
| TC-API-AUTH-004 | POST /login | Cred đúng | 200, token |
| TC-API-AUTH-005 | POST /login | Password sai | 401 |
| TC-API-AUTH-006 | POST /login | Email không tồn tại | 401 (cùng message với 005) |
| TC-API-AUTH-007 | GET /me | Bearer hợp lệ | 200, không có password |
| TC-API-AUTH-008 | GET /me | Không token | 401 |
| TC-API-AUTH-009 | GET /me | Token sai signature | 401 |
| TC-API-AUTH-010 | GET /me | Token hết hạn | 401 |

## Hotels (`/api/client/hotels` — public + `/api/admin/hotels` — admin)

| ID | Endpoint | Case | Expected |
|----|---------|------|---------|
| TC-API-HOTEL-001 | GET /api/client/hotels | Mặc định | 200, array |
| TC-API-HOTEL-002 | GET /api/client/hotels?province=Đà Nẵng | – | 200, đúng province |
| TC-API-HOTEL-003 | GET /api/client/hotels?priceMin=&priceMax= | – | 200, giá trong khoảng |
| TC-API-HOTEL-004 | GET /api/client/hotels?page=2&limit=10 | – | 200, cấu trúc paginated |
| TC-API-HOTEL-005 | GET /api/client/hotels/:id | id hợp lệ | 200, object |
| TC-API-HOTEL-006 | GET /api/client/hotels/:id | id không tồn tại | 404 |
| TC-API-HOTEL-007 | GET /api/client/hotels/:id | id sai format ObjectId | 400 hoặc 404 |
| TC-API-HOTEL-008 | POST /api/admin/hotels | Admin token + body hợp lệ | 201 |
| TC-API-HOTEL-009 | POST /api/admin/hotels | Body thiếu name | 400 |
| TC-API-HOTEL-010 | PUT /api/admin/hotels/:id | Admin | 200 |
| TC-API-HOTEL-011 | DELETE /api/admin/hotels/:id | Admin | 200 |
| TC-API-HOTEL-012 | POST /api/admin/hotels | User thường | 403 |

## Tours, Restaurants, Destinations (cùng pattern)

Tham khảo TC-API-HOTEL-* và áp dụng tương tự cho:
- TC-API-TOUR-001..012
- TC-API-RES-001..012
- TC-API-DEST-001..012
- TC-API-FLIGHT-001..010
- TC-API-BUS-001..008
- TC-API-AT-001..008 (airport transfer)

## Search (`/api/client/search`)

| ID | Endpoint | Case | Expected |
|----|---------|------|---------|
| TC-API-SEARCH-001 | GET /search?q=Đà Nẵng | – | 200, gộp hotels + tours + destinations |
| TC-API-SEARCH-002 | GET /search?q= | Empty query | 400 hoặc list rỗng |
| TC-API-SEARCH-003 | GET /search?q=<script> | XSS payload | Trả về an toàn (escape), không 500 |

## Food reviews (`/api/client/food-reviews`)

| ID | Case | Expected |
|----|------|---------|
| TC-API-FOOD-001 | GET list | 200, array |
| TC-API-FOOD-002 | GET theo city | 200, đúng city |
| TC-API-FOOD-003 | POST import (admin) | 201/200 |

## Chatbot (`/api/chatbot/*`)

| ID | Endpoint | Case | Expected |
|----|---------|------|---------|
| TC-CHAT-API-001 | POST /conversations | – | 201, có conversation_id |
| TC-CHAT-API-002 | GET /conversations | – | 200, list |
| TC-CHAT-API-003 | GET /conversations/:id | id hợp lệ | 200, conversation + messages |
| TC-CHAT-API-004 | GET /conversations/:id | id sai | 404 |
| TC-CHAT-API-005 | PUT /conversations/:id/end | – | 200, ended_at được set |
| TC-CHAT-API-006 | POST /message | RASA up | 200, RASA reply |
| TC-CHAT-API-007 | POST /message | RASA down | 5xx hoặc fallback message rõ ràng |
| TC-CHAT-RECO-001 | POST /recommend với "Đi Đà Nẵng 3 ngày 4 người" | DB có dữ liệu | 200, package có hotel + tour + transport |
| TC-CHAT-RECO-002 | POST /recommend câu vô nghĩa | – | 200, message "không hiểu" hoặc fallback |

## Validation

- Body JSON sai cú pháp → 400.
- Payload > 50MB → 413 (đã có handler ở `index.ts`).
- Content-Type không phải application/json (cho POST) → 400 hoặc xử lý phù hợp.

## Cross-cutting

| ID | Case | Expected |
|----|------|---------|
| TC-API-COMMON-001 | Helmet headers (`x-content-type-options`, `x-frame-options`, …) | Tất cả response có | 
| TC-API-COMMON-002 | CORS allow tất cả (đang `cors()`) | Origin lạ vẫn pass; cảnh báo bảo mật |
| TC-API-COMMON-003 | 404 cho route không tồn tại | 404 |
| TC-API-COMMON-004 | Swagger docs `/api-docs` accessible | 200 |

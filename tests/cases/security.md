# Test Cases — Bảo mật cơ bản

Phạm vi: kiểm thử bảo mật mức ứng dụng (OWASP Top 10 lựa chọn theo bài toán). Không bao gồm pentest hạ tầng.

## Authentication & Session

| ID | Case | Bước | Expected |
|----|------|------|---------|
| TC-SEC-001 | Truy cập endpoint cần auth không có token | curl `GET /api/admin/hotels` | 401 |
| TC-SEC-002 | Truy cập với JWT sai signature | sửa 1 ký tự token | 401, không leak stack |
| TC-SEC-003 | Truy cập với JWT hết hạn | tạo token expiresIn=1s, chờ | 401 "Phiên đăng nhập đã hết hạn" |
| TC-SEC-004 | JWT thiếu role admin truy cập admin route | login user thường, gọi /api/admin/* | 403 |
| TC-SEC-005 | Đổi role trong DB sau khi cấp token | cấp token admin → DB sửa role=user → gọi admin route | 403 (middleware verify lại DB) |
| TC-SEC-006 | Brute force login | 100 request /login sai pwd | Không chặn = **risk** (gợi ý thêm rate-limit) |
| TC-SEC-007 | Session không invalidate sau logout (vì JWT stateless) | logout → dùng lại token | Vẫn pass — gợi ý thêm token blacklist |

## Input validation / Injection

| ID | Case | Payload | Expected |
|----|------|---------|---------|
| TC-SEC-008 | NoSQL injection trên login | `{"email": {"$ne": null}, "password": {"$ne": null}}` | 401, không bypass |
| TC-SEC-009 | NoSQL injection trên search query | `?province[$ne]=` | Không trả full collection |
| TC-SEC-010 | XSS reflected trong search | `?q=<script>alert(1)</script>` | Frontend escape, không exec |
| TC-SEC-011 | XSS stored qua review/food review | submit review chứa `<img onerror>` | Render text, không exec |
| TC-SEC-012 | Path traversal trong tham số file | `?img=../../../../etc/passwd` | 400 hoặc filter |
| TC-SEC-013 | Mass assignment (đăng ký gửi `role:"admin"`) | POST /register {role:"admin"} | role bị bỏ qua, vẫn lưu role="user" — **kiểm tra** |
| TC-SEC-014 | Body quá lớn (DoS) | POST 60MB | 413 (đã có handler) |

## Password & Crypto

| ID | Case | Expected |
|----|------|---------|
| TC-SEC-015 | Password trong DB là bcrypt hash (not plaintext) | bcrypt với cost ≥ 10 |
| TC-SEC-016 | Response không trả về field password | `register/login/me` không có `password` |
| TC-SEC-017 | JWT_SECRET không phải fallback "kltn-travel-secret-fallback" | Đọc env, kiểm tra giá trị | 

## Headers / CORS / Misc

| ID | Case | Expected |
|----|------|---------|
| TC-SEC-018 | Helmet đã active | Response có `x-content-type-options: nosniff`, `x-dns-prefetch-control`, `strict-transport-security` (nếu HTTPS) |
| TC-SEC-019 | CORS hiện đang allow `*` | Origin bất kỳ qua được — **risk** với endpoint mutating; gợi ý whitelist origin |
| TC-SEC-020 | Disclosure stack trace khi 500 | Response không chứa stack trace cho client |
| TC-SEC-021 | Endpoint Swagger `/api-docs` ở production | Khuyến nghị tắt hoặc protect |

## Quyền dữ liệu

| ID | Case | Expected |
|----|------|---------|
| TC-SEC-022 | User A xem favourites của user B | userA token gọi `/account/favourites?userId=userB` | 403 hoặc filter theo token |
| TC-SEC-023 | User thường gọi DELETE /api/admin/hotels/:id | 403 |
| TC-SEC-024 | Conversation của user khác | userA gọi /conversations/:id của userB | 403 (hoặc 404) |

## Tự động hoá

- Authentication tests có thể automate bằng Supertest (xem `tests/api/__tests__/auth.test.ts`).
- Injection / XSS có thể chạy qua [OWASP ZAP](https://www.zaproxy.org/) baseline scan trên `http://localhost:5000`:
  ```bash
  docker run -t owasp/zap2docker-stable zap-baseline.py -t http://host.docker.internal:5000
  ```
- Dependency vulnerabilities: `npm audit` (server, client) và `pip-audit` (chatbot venv).

# Test Cases — Frontend (Next.js client)

Khuyến nghị tự động hoá bằng **Playwright** (đa trình duyệt, có codegen, hỗ trợ CI). Hiện chưa có cấu hình — chỉ cần thêm `@playwright/test` vào `client/`.

## Smoke (mỗi trang phải load thành công, không lỗi console nghiêm trọng)

| ID | URL | Expected |
|----|-----|---------|
| TC-FE-SMOKE-001 | `/` | 200, hero hiển thị, không lỗi React hydration |
| TC-FE-SMOKE-002 | `/vi/hotels` | List hotel render |
| TC-FE-SMOKE-003 | `/vi/hotels/search?province=Đà Nẵng` | Filter áp dụng, list không rỗng nếu DB có dữ liệu |
| TC-FE-SMOKE-004 | `/vi/tours` | List tour render |
| TC-FE-SMOKE-005 | `/vi/tours/[id]` (id hợp lệ) | Chi tiết hiển thị đầy đủ |
| TC-FE-SMOKE-006 | `/vi/flights` | Form tìm vé hiển thị |
| TC-FE-SMOKE-007 | `/vi/buses` | List bus render |
| TC-FE-SMOKE-008 | `/vi/airport-transfer` | Form đặt xe hiển thị |
| TC-FE-SMOKE-009 | `/vi/foodtour` | Card review render |
| TC-FE-SMOKE-010 | `/vi/account/favourites` (đã đăng nhập) | List favourites |
| TC-FE-SMOKE-011 | `/vi/admin` (admin) | Dashboard render |
| TC-FE-SMOKE-012 | `/vi/admin/hotels` (admin) | Bảng quản trị render, có nút thêm |
| TC-FE-SMOKE-013 | `/en/` | Toàn bộ text đổi sang tiếng Anh |
| TC-FE-SMOKE-014 | Theme toggle dark/light | Class `dark` được toggle |

## Form & flow

| ID | Flow | Expected |
|----|------|---------|
| TC-FE-FORM-001 | Đăng ký → đăng nhập → vào /account | Token lưu localStorage, redirect đúng |
| TC-FE-FORM-002 | Đăng nhập sai pwd → hiện toast/inline error | Không reset trang |
| TC-FE-FORM-003 | Tìm hotel → vào chi tiết → "Yêu thích" | API gọi đúng, UI feedback |
| TC-FE-FORM-004 | Tìm tour → vào chi tiết → "Đặt tour" (mock) | Modal/booking flow hoạt động |
| TC-FE-FORM-005 | Mở chatbot → gửi "Tìm khách sạn ở Hà Nội" | Tin nhắn user + reply bot xuất hiện |
| TC-FE-FORM-006 | Mở chatbot lúc backend down | Hiển thị message lỗi thân thiện |

## Responsive & A11y

| ID | Case | Expected |
|----|------|---------|
| TC-FE-A11Y-001 | Lighthouse Accessibility ≥ 90 (homepage) | Score ≥ 90 |
| TC-FE-A11Y-002 | Tab keyboard qua các nút điều hướng | Focus visible, đúng thứ tự |
| TC-FE-A11Y-003 | Alt text cho ảnh hotel/tour | Tất cả `<img>` có alt |
| TC-FE-RESP-001 | Mobile 375px | Menu collapse, chatbot icon không che footer |
| TC-FE-RESP-002 | Tablet 768px | Grid 2 cột |
| TC-FE-RESP-003 | Desktop 1440px | Grid 3-4 cột |

## Error handling

| ID | Case | Expected |
|----|------|---------|
| TC-FE-ERR-001 | URL không tồn tại | Trang 404 custom |
| TC-FE-ERR-002 | API trả 500 | UI hiện skeleton/empty state, không crash |
| TC-FE-ERR-003 | Token hết hạn lúc browsing | Auto redirect /login |

## Cross-browser

| ID | Browser | Expected |
|----|--------|---------|
| TC-FE-CB-001 | Chrome latest | Pass tất cả smoke |
| TC-FE-CB-002 | Firefox latest | Pass tất cả smoke |
| TC-FE-CB-003 | Edge latest | Pass tất cả smoke |
| TC-FE-CB-004 | Safari (nếu test được) | Pass tất cả smoke |

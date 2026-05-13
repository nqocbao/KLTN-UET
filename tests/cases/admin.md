# Test Cases — Chức năng Admin

Tất cả request tới `/api/admin/*` đều phải qua middleware `requireAdmin`. Test phải kiểm cả happy path và phân quyền.

| ID | Mô tả | Tiền điều kiện | Bước | Kết quả mong đợi | Mức |
|----|-------|---------------|------|-----------------|----|
| TC-ADM-001 | Truy cập admin route không có token | – | GET /api/admin/hotels | 401, "Yêu cầu đăng nhập" | High |
| TC-ADM-002 | Truy cập với token user thường | role=user | GET /api/admin/hotels + Bearer | 403, "không có quyền" | High |
| TC-ADM-003 | Truy cập với token admin | role=admin | GET /api/admin/hotels + Bearer | 200, list trả về | High |
| TC-ADM-USER-001 | Liệt kê users | admin | GET /api/admin/users | 200, list paginated | High |
| TC-ADM-USER-002 | Tạo user mới | admin | POST /api/admin/users {email,name,role} | 201, user trong DB | High |
| TC-ADM-USER-003 | Cập nhật role user | admin | PUT /api/admin/users/:id {role:"admin"} | 200, role thay đổi | High |
| TC-ADM-USER-004 | Xoá user | admin | DELETE /api/admin/users/:id | 200, user bị xoá hoặc soft-delete | Medium |
| TC-ADM-RBAC-001 | Tạo role | admin | POST /api/admin/roles | 201 | Medium |
| TC-ADM-RBAC-002 | Gán permission cho role | admin | POST permission_role | 201, role có permission | Medium |
| TC-ADM-HOTEL-001 | Tạo khách sạn | admin | POST /api/admin/hotels | 201, hotel trong DB | High |
| TC-ADM-HOTEL-002 | Tạo thiếu trường bắt buộc (name, location) | admin | POST thiếu name | 400 validation error | High |
| TC-ADM-HOTEL-003 | Cập nhật khách sạn | admin | PUT /api/admin/hotels/:id | 200, dữ liệu thay đổi | High |
| TC-ADM-HOTEL-004 | Xoá khách sạn | admin | DELETE /api/admin/hotels/:id | 200, document xoá | Medium |
| TC-ADM-HOTEL-005 | Upload nhiều ảnh | admin | POST với images[] | Tạo thành công, lưu URL | Medium |
| TC-ADM-TOUR-001 | CRUD tour cơ bản | admin | POST/GET/PUT/DELETE /api/admin/tours | thành công | High |
| TC-ADM-TOUR-002 | Gán destinations cho tour | admin | POST /api/admin/tour-destinations | 201 | Medium |
| TC-ADM-TOUR-003 | Gán transport cho tour | admin | POST /api/admin/tour-transports | 201 | Medium |
| TC-ADM-RES-001 | CRUD restaurant | admin | … | thành công | Medium |
| TC-ADM-DEST-001 | CRUD destination | admin | … | thành công | Medium |
| TC-ADM-LOC-001 | Quản lý province/district/ward | admin | CRUD | thành công | Low |
| TC-ADM-PART-001 | CRUD partner | admin | … | thành công | Low |
| TC-ADM-AIR-001 | CRUD airline | admin | … | thành công | Medium |
| TC-ADM-TRA-001 | CRUD transport (bus/airport-transfer/flight) | admin | … | thành công | Medium |
| TC-ADM-REV-001 | Duyệt / xoá review | admin | PUT /api/admin/reviews/:id | thành công | Medium |
| TC-ADM-FOOD-001 | Import food reviews từ Apify | admin | POST /api/admin/food-reviews/import | dữ liệu vào DB | Medium |
| TC-ADM-CONV-001 | Liệt kê hội thoại chatbot | admin | GET /api/admin/conversations | 200, list | Medium |
| TC-ADM-INTENT-001 | Quản lý intents/entities seed | admin | CRUD | thành công | Low |
| TC-ADM-SERV-001 | CRUD services | admin | … | thành công | Low |
| TC-ADM-GUIDE-001 | CRUD guides | admin | … | thành công | Low |
| TC-ADM-FAV-001 | Xem favourites của user | admin | GET /api/admin/favourites?userId=… | 200 | Low |
| TC-ADM-HISTORY-001 | Xem travel history user | admin | GET /api/admin/travel-history | 200 | Low |
| TC-ADM-UI-001 | Trang admin/hotels load đúng | admin login | /admin/hotels | Bảng + nút thêm/sửa/xoá | High |
| TC-ADM-UI-002 | Form tạo hotel hiển thị đúng | admin | /admin/hotels/new | Hiển thị form | Medium |
| TC-ADM-UI-003 | Bảo vệ trang admin với user thường | – | /admin → user thường | Redirect /login hoặc 403 | High |

# Test Cases — Chức năng người dùng (Client)

Đối tượng: người dùng cuối truy cập website VivuTravel qua trình duyệt.

| ID | Mô tả | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả mong đợi | Mức độ |
|----|-------|---------------|----------------|---------|------------------|--------|
| TC-U-001 | Đăng ký tài khoản hợp lệ | Email chưa tồn tại | Mở /register → nhập email/password/name → submit | email=user1@vivu.vn, pwd=Vivu@1234 | HTTP 201, có token, user lưu DB, password đã hash | High |
| TC-U-002 | Đăng ký với email trùng | Email đã tồn tại | Submit form đăng ký | trùng email | HTTP 400, message "Email đã được sử dụng" | High |
| TC-U-003 | Đăng ký thiếu trường bắt buộc | – | Submit form thiếu password | – | HTTP 400, message yêu cầu trường | Medium |
| TC-U-004 | Đăng ký với password yếu (nếu có rule) | – | Submit pwd ngắn | pwd="123" | Kỳ vọng: từ chối (gợi ý bổ sung rule client-side) | Medium |
| TC-U-005 | Đăng nhập đúng | User tồn tại | /login → submit | đúng cred | HTTP 200, token JWT trong response | High |
| TC-U-006 | Đăng nhập sai mật khẩu | User tồn tại | submit | sai pwd | HTTP 401, message chuẩn | High |
| TC-U-007 | Đăng nhập email không tồn tại | – | submit | email lạ | HTTP 401, message giống TC-U-006 (tránh user enumeration) | High |
| TC-U-008 | Lấy thông tin user (`/me`) đã đăng nhập | Có token | GET /api/client/auth/me + Bearer | – | HTTP 200, user object, không có password | High |
| TC-U-009 | Truy cập `/me` không token | – | GET không Authorization | – | HTTP 401 | High |
| TC-U-010 | Truy cập `/me` token expired | Token hết hạn | GET với token cũ | – | HTTP 401, message hết hạn | High |
| TC-U-011 | Đăng xuất | Có session | Click "Đăng xuất" | – | Token bị xoá khỏi localStorage, redirect về home | Medium |
| TC-U-012 | Tìm khách sạn theo địa điểm | DB có hotel ở "Đà Nẵng" | /hotels/search?province=Đà Nẵng | – | Trả về list hotel đúng province | High |
| TC-U-013 | Tìm khách sạn theo khoảng giá | DB có dữ liệu | /hotels?priceMin=500000&priceMax=2000000 | – | Tất cả hotel có giá nằm trong khoảng | High |
| TC-U-014 | Tìm khách sạn không kết quả | – | /hotels?province=Lào Cai (không có) | – | List rỗng + message "Không tìm thấy" | Medium |
| TC-U-015 | Lọc theo độ nổi bật/rating | – | UI: chọn rating ≥ 4 sao | – | Chỉ hiện hotel rating ≥ 4 | Medium |
| TC-U-016 | Xem chi tiết khách sạn | Hotel id hợp lệ | Click card → /hotels/[id] | – | Hiển thị đủ tên, hình, mô tả, giá, vị trí | High |
| TC-U-017 | Xem chi tiết với id không tồn tại | – | URL với id sai | – | Trang 404 hoặc message lỗi rõ ràng | Medium |
| TC-U-018 | Tìm tour theo ngày khởi hành | – | /tours/search?startDate=2026-06-01 | – | Tour có ngày khởi hành ≥ start_date | High |
| TC-U-019 | Tìm chuyến bay one-way | – | /flights?from=HAN&to=SGN&date=… | – | List flight đúng route | High |
| TC-U-020 | Tìm chuyến bay round-trip | – | đầy đủ tham số | – | Có cả outbound + return | Medium |
| TC-U-021 | Tìm vé xe khách (bus) | – | /buses?from=Hà Nội&to=Sa Pa | – | List bus phù hợp | Medium |
| TC-U-022 | Tìm dịch vụ đưa đón sân bay | – | /airport-transfer | – | Hiển thị danh sách dịch vụ | Medium |
| TC-U-023 | Xem food review | – | /foodtour/[city] | – | List review hiển thị | Medium |
| TC-U-024 | Thêm vào yêu thích (đã đăng nhập) | Logged in | Click ❤ ở hotel card | – | API POST favourites 200, icon đổi trạng thái | High |
| TC-U-025 | Thêm vào yêu thích (chưa đăng nhập) | – | Click ❤ | – | Redirect /login hoặc modal yêu cầu đăng nhập | Medium |
| TC-U-026 | Xem danh sách yêu thích | Đã thêm | /account/favourites | – | List đầy đủ, có thể xoá | Medium |
| TC-U-027 | Đa ngôn ngữ VI/EN | next-intl đã cấu hình | /vi/ và /en/ | – | Text đổi đúng locale | Low |
| TC-U-028 | Xem orders / vouchers / points | Đã đăng nhập | /account/orders, … | – | Trang load không lỗi | Low |
| TC-U-029 | Mở chatbot | – | Click icon góc phải | – | Khung chat mở, gửi tin nhắn nhận phản hồi | High |
| TC-U-030 | Reload trang giữ session | Có token | F5 | – | Vẫn đăng nhập | Medium |

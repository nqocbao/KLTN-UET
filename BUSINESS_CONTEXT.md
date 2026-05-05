# KLTN-UET - Tong Hop Nghiep Vu Va Kien Truc Du An

Cap nhat: 2026-03-31
Pham vi quet: chatbot/, client/, server/, README, scripts, seeders
Muc tieu: Tao tai lieu ngu canh nghiep vu de tai su dung cho cac lan hoi dap sau.

## 1) Tong quan san pham

Du an la nen tang du lich truc tuyen (VivuTravel) gom 3 khoi chinh:
- Client web (Next.js) cho nguoi dung va trang quan tri.
- Backend API (Express + MongoDB) phuc vu du lieu, xac thuc, admin CRUD, tim kiem.
- Chatbot (Rasa) de tu van va tim dich vu du lich bang tieng Viet.

Nhom tinh nang chinh:
- Tim va xem Tour, Hotel, Flight, Bus, Airport transfer.
- Dang ky/dang nhap, quan ly thong tin tai khoan.
- Danh gia (reviews), yeu thich (favourites), lich su du lich.
- Admin dashboard de quan tri du lieu lon (dia ly, dich vu, doi tac, nguoi dung, chat data).
- i18n (vi/en) cho giao dien client.

## 2) Kien truc tong the

Mau trien khai hien tai:
- client/ chay tren Next.js (mac dinh 3000)
- server/ chay Express API (thuong 5000)
- chatbot/ chay Rasa server + actions server (5005 va cong lien quan actions)

Dong du lieu cap cao:
1. Client gui request den Backend API.
2. Backend thao tac MongoDB va tra ket qua.
3. Luong chatbot: Backend luu message -> goi webhook Rasa -> nhan response -> luu DB -> tra ve client.
4. Luong flights: Backend goi SerpAPI de lay gia, co co che cache vao transports.

## 3) Phan he chatbot (chatbot/)

Thanh phan chinh:
- config.yml: cau hinh pipeline NLU va policy hoi thoai.
- domain.yml: intents/entities/slots/forms/responses.
- data/nlu.yml: du lieu huan luyen tieng Viet.
- data/stories.yml + data/rules.yml: kich ban va luat hoi thoai.
- actions/actions.py: custom actions de tim hotels/tours/flights va tra thong tin diem den.

Y nghia nghiep vu:
- Chatbot khong chi tra loi tich; no ket noi du lieu backend de tra ket qua tim kiem co cau truc.
- Form flow duoc dung de hoi du tham so (diem di/den, ngay, muc gia, so khach...).

## 4) Phan he client (client/)

Cong nghe va bo cuc:
- Next.js App Router, React, Tailwind, next-intl.
- app/[locale]/... cho da ngon ngu.
- components/ chia theo domain: tours, hotels, flights, buses, airport-transfer, chatbot, account, admin.

Diem nghiep vu noi bat:
- Public pages cho tim kiem va xem dich vu du lich.
- Account area: thong tin nguoi dung, lich su, yeu thich, danh gia.
- Admin UI de CRUD du lieu he thong.
- Chatbot UI render card theo loai ket qua (hotel/tour/flight).

## 5) Phan he backend (server/)

Kien truc thu muc:
- routes/: tach admin, client, chatbot routes.
- controllers/: xu ly logic theo module.
- models/: bo entity lon tren MongoDB.
- middlewares/: JWT, role checks.
- config/: database, swagger.
- seeders/, scripts/: khoi tao va bao tri du lieu.

### 5.1 Nhom API client
Muc tieu: phuc vu nguoi dung cuoi
- Auth: register/login/me.
- Tours: danh sach, chi tiet, loc theo gia/diem den/trang thai.
- Hotels: danh sach, chi tiet, loc theo vi tri.
- Flights search: tim chuyen bay tu SerpAPI.
- Buses, airport-transfers: loc theo transport type.
- Smart search: tim nhanh da nguon.

### 5.2 Nhom API admin
Muc tieu: quan tri du lieu he thong
- CRUD tren nhieu tai nguyen: users/roles/permissions, dia ly, tours, hotels, restaurants, transports, partners, reviews, chat entities...
- Bao ve boi middleware JWT + role admin.

### 5.3 Nhom API chatbot
Muc tieu: quan ly cuoc hoi thoai va cau noi chatbot
- Tao/list/get/end conversation.
- Gui message den Rasa webhook.
- Luu vet message user/bot trong DB.

## 6) Mo hinh du lieu va y nghia nghiep vu

Du an su dung tap model phong phu; cac nhom quan trong:

1. Dia ly va dia chi
- countries, provinces, districts, wards, addresses.
- Lam nen cho tim kiem theo dia danh, route tour, thong tin khach san.

2. Nguoi dung va phan quyen
- users, roles, permissions, user_roles, role_permissions.
- Hien trang role-based check dong vai tro chinh cho admin.

3. Dich vu du lich cot loi
- tours, hotels, restaurants, destinations, airlines, transports, services, partners.
- transports co tinh chat da hinh (bus/flight/airport_transfer/taxi/train/car_rental).

4. Quan he cau thanh tour
- tour_destinations, tour_transports, guides.
- Cho phep mo ta lich trinh tour gom nhieu diem den va chang di chuyen.

5. Tuong tac nguoi dung
- reviews, tour_reviews, favourites, travel_history.
- Ho tro social proof, ca nhan hoa va hanh vi khach hang.

6. Chatbot analytics data
- conversations, messages, intents, entities.
- Co the dung de thong ke, cai thien NLU va truy vet chat quality.

## 7) Luong nghiep vu tieu bieu

1. Tim tour
- Client goi API tours voi bo loc.
- Backend query + tong hop thong tin lien quan.
- Client hien thi danh sach/chi tiet va co the tiep tuc qua chatbot.

2. Tim khach san
- Query theo vi tri/muc gia/limit.
- Tra ve danh sach khach san va thuoc tinh phong.

3. Tim chuyen bay
- API flights nhan from/to/date/adults.
- Backend goi SerpAPI, chuan hoa ket qua, co cache DB.
- Chatbot va UI deu tai su dung du lieu nay.

4. Dang nhap va bao ve tai nguyen
- Login tao JWT co thoi han.
- Request tiep theo gui Authorization Bearer token.
- Admin route check role admin.

5. Chatbot messaging
- Tao conversation.
- Gui message user -> backend -> Rasa -> nhan response.
- Luu message bot/user vao DB.

## 8) Tich hop ngoai va ha tang

- MongoDB: kho du lieu chinh.
- Rasa + Rasa SDK: xu ly NLU/doi thoai.
- SerpAPI: gia va lich chuyen bay realtime.
- Swagger: tai lieu API backend.
- Helmet + Morgan: security headers + request logging.

## 9) Seed va scripts van hanh

Seeders:
- seed.ts: khoi tao bo du lieu mau lon (dia ly, destination, hotel, tour...).
- seed-admin.ts: tao tai khoan admin mac dinh.
- flights.seed.ts, transports.seed.ts: du lieu van chuyen/chuyen bay.

Scripts:
- Kiem tra gia, ngay tour, cap nhat province cho tour, cleanup collection cu.
- Muc dich: bao tri chat luong du lieu va giup debug nghiep vu.

## 10) Nhan dinh nghiep vu quan trong

1. Du an dang o muc do full-stack travel platform voi chatbot tro ly.
2. Chatbot duoc thiet ke de tro thanh kenh tim kiem dich vu, khong chi FAQ.
3. Du lieu domain du lich da kha day du (dia ly, tour composition, transport polymorphism).
4. Booking/payment end-to-end chua thay day du trong backend hien tai (co dau hieu dang o muc "tu van/dat lien he").
5. He thong co nen tang tot cho mo rong: recommendation, dynamic pricing, booking workflow, order management.

## 11) Goi y su dung tai lieu nay cho cac lan hoi sau

Khi ban hoi tiep, co the tham chieu truc tiep file nay de:
- Nho nhanh boi canh nghiep vu va kien truc.
- Xac dinh dung module can sua (chatbot/client/server).
- Tranh mat ngu canh khi lam feature moi hoac fix bug.

Mau yeu cau de dung nhanh:
- "Dua tren BUSINESS_CONTEXT, toi uu luong tim flights"
- "Dua tren BUSINESS_CONTEXT, them booking workflow cho tours"
- "Dua tren BUSINESS_CONTEXT, refactor role/permission"

---
Nguon tong hop: README + cau truc module + routes/controllers/models + chatbot config/data + seeders/scripts trong workspace KLTN-UET.

## 12) De xuat nang cap chatbot (theo huong Trip.com)

### 12.1 Muc tieu nang cap
- Recommendation minh bach: moi goi y can neu ro ly do chon (gia, hang bay, gio ha canh, khach san sau ha canh, tong chi phi, trade-off).
- Recommendation chi tiet: tra ve bo goi hoan chinh (flight + hotel + tour + de xuat di chuyen + lich trinh theo ngay).
- Co planning engine: khong chi liet ke ket qua, ma lap ke hoach kha thi theo thoi gian va ngan sach.
- Co tuning engine: cho phep dieu chinh trong so va rule qua DB, khong can sua code thu cong moi lan.
- He thong all-in-one + visualize: co dashboard theo doi chat luong entity, chat luong goi y va conversion.

### 12.2 Kien truc logic de xuat
1. Entity Layer
- Trich xuat va chuan hoa entity cot loi: diem di, diem den, ngay di, so khach, ngan sach, uu tien (gia/re nhanh/tien nghi), so ngay.
- Kiem tra do day entity truoc khi recommend. Neu thieu thi bot hoi bo sung (slot filling co dieu kien).

2. Retrieval Layer
- Query DB theo dieu kien cung (hard constraints): ngay, diem den, ngan sach, so khach, loai dich vu.
- Gom ung vien tu nhieu nguon: flights, hotels, tours, transports.

3. Scoring Layer
- Cham diem theo trong so co tuning:
	score = w_price*price_fit + w_time*time_fit + w_quality*rating_fit + w_location*location_fit + w_policy*policy_fit
- Rule cung bo sung: gio ha canh muon, so diem dung qua nhieu, khach san qua xa trung tam, vuot ngan sach.

4. Planning Layer
- Ghep candidate thanh package kha thi:
	- Flight den gio nao
	- Khach san check-in co phu hop khong
	- Tour khoi hanh co khop ngay den/ve khong
- Sinh 2-3 phuong an: tiet kiem, can bang, cao cap.

5. Explanation Layer
- Moi package phai co phan "Vi sao goi y" va "Phuong an thay the" de minh bach voi KH.

### 12.3 Co che tuning qua DB (de xuat)
1. RecommendationConfig
- scenario: solo/couple/family/business.
- weights: price_weight, duration_weight, comfort_weight, location_weight, brand_weight.
- hard_rules: max_layover, max_arrival_hour, min_hotel_rating, max_distance_to_center.
- seasonal_rules: ngay le/cao diem/thap diem.

2. EntityConfig
- required_entities theo tung intent (flight/hotel/tour/itinerary).
- synonyms va normalization (dia danh, viet tat, airport code, ten hang bay).
- confidence_threshold va fallback_question_template.

3. PromptTemplateConfig
- Mau prompt gom: user intent + entities + top candidates + scoring ly do + response style.
- Tach phan data facts va phan wording de de tuning.

### 12.4 Dinh dang response de xuat (minh bach)
- Package summary: tong chi phi, tong thoi gian, muc phu hop ngan sach.
- Flight details: hang bay, gio cat canh/ha canh, so diem dung, hanh ly.
- Hotel details: ten, rating, khoang cach trung tam/san bay, tien nghi chinh.
- Tour details: thoi luong, lich trinh theo ngay, dich vu bao gom.
- Explanation: 3-5 ly do vi sao package nay phu hop.
- Alternatives: 1 goi re hon va 1 goi tien nghi hon.

### 12.5 Backlog uu tien (P0/P1/P2)
P0 (lam ngay)
- Chuan hoa entity bat buoc va hoi bo sung entity khi thieu.
- Dong bo luong flight chatbot voi endpoint search co from/to/date.
- Luu conversation_id day du de giu context hoi thoai va analytics.
- Loai bo du lieu NLU trung lap giua search_* va provide_location.

P1 (nang cap recommendation)
- Trien khai scoring co trong so + hard rules.
- Trien khai planning engine ghep flight-hotel-tour.
- Tra ve response co explanation va alternatives.

P2 (van hanh va toi uu)
- Dashboard visualize: entity coverage, fallback rate, recommendation acceptance, conversion.
- A/B testing bo trong so tuning theo scenario KH.
- Theo doi KPI va auto-adjust theo mua/ngu canh.

### 12.6 KPI de theo doi sau nang cap
- Entity completeness rate.
- Recommendation acceptance rate.
- Fallback rate (nlu_fallback, no_result).
- Time-to-first-useful-recommendation.
- Lead-to-booking conversion.
- User satisfaction score sau hoi thoai.

### 12.7 Lo trinh trien khai de xuat
- Giai doan 1 (1-2 tuan): chuan hoa entity + sua flow chatbot hien tai + on dinh end-to-end.
- Giai doan 2 (2-3 tuan): scoring + planning + response minh bach.
- Giai doan 3 (1-2 tuan): dashboard + A/B tuning + toi uu theo KPI thuc te.
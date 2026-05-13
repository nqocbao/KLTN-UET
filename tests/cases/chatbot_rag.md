# Test Cases — Chatbot (RASA NLU/Core) + RAG

## 1. RASA NLU — Intent classification

Dùng `rasa test nlu --cross-validation --runs 1 --folds 5` trên `chatbot/data/nlu.yml`.

Intent mục tiêu: 21 intent (greet, goodbye, affirm, deny, thank_you, search_hotel, search_flight, search_tour, search_destination, book_hotel, book_flight, book_tour, ask_hotel_price, ask_hotel_amenities, ask_location, ask_recommendation, ask_foodtour, ask_weather, ask_opening_hours, help, bot_challenge, provide_location).

| ID | Câu hỏi mẫu | Intent kỳ vọng | Entities kỳ vọng |
|----|------------|----------------|------------------|
| TC-NLU-001 | "Xin chào" | greet | – |
| TC-NLU-002 | "Tạm biệt" | goodbye | – |
| TC-NLU-003 | "Cảm ơn nhiều" | thank_you | – |
| TC-NLU-004 | "Tìm khách sạn ở Đà Nẵng" | search_hotel | location=Đà Nẵng |
| TC-NLU-005 | "Có khách sạn nào ở Nha Trang dưới 1 triệu không?" | search_hotel | location=Nha Trang, price_range="1 triệu" |
| TC-NLU-006 | "Tour 3 ngày 2 đêm cho gia đình" | search_tour | duration="3 ngày", tour_type=family |
| TC-NLU-007 | "Vé máy bay Hà Nội Sài Gòn ngày mai" | search_flight | flight_from=Hà Nội, flight_to=Sài Gòn, flight_date=ngày mai |
| TC-NLU-008 | "Giá phòng deluxe bao nhiêu?" | ask_hotel_price | room_type=deluxe |
| TC-NLU-009 | "Khách sạn có hồ bơi không?" | ask_hotel_amenities | amenity=hồ bơi |
| TC-NLU-010 | "Đà Lạt có gì hay?" | ask_location | location=Đà Lạt |
| TC-NLU-011 | "Gợi ý điểm đến mùa hè" | ask_recommendation | – |
| TC-NLU-012 | "Quán phở ngon ở Hà Nội" | ask_foodtour | location=Hà Nội |
| TC-NLU-013 | "Bạn là ai?" | bot_challenge | – |
| TC-NLU-014 | "giúp tôi" | help | – |
| TC-NLU-015 | "Hà Nội" (sau câu hỏi cần location) | provide_location | location=Hà Nội |

Ngưỡng đề xuất: F1 trung bình macro **≥ 0.85**, accuracy ≥ 0.88, không có intent nào F1 < 0.6.

## 2. RASA Stories / Core

| ID | Story / Flow | Expected |
|----|-------------|---------|
| TC-CORE-001 | greet → ask_recommendation → utter_recommend | Bot trả lời đúng utter |
| TC-CORE-002 | search_hotel (thiếu location) → form hỏi location → fill → action_search_hotels | Form hoạt động, slot fill đúng |
| TC-CORE-003 | search_tour (đầy đủ slot) → action_search_tours | Trả về danh sách tour |
| TC-CORE-004 | Câu out-of-scope → fallback | Không crash, có message hướng dẫn |
| TC-CORE-005 | Đổi chủ đề giữa chừng | Bot xử lý đúng (không kẹt slot) |

Chạy: `rasa test core --stories data/stories.yml --out results/`.

## 3. RAG — Retrieval (food reviews)

Dùng `chatbot/rag/eval_rag_deepeval.py` với `--skip-deepeval` (chỉ tính retrieval) trên `testcases_vivutravel_500_remapped.json`.

| ID | Mục tiêu | Tham số | Ngưỡng |
|----|---------|---------|--------|
| TC-RAG-RET-001 | Recall@5 baseline (MiniLM, sentence chunking 800) | topK=5, threshold=0.28 | Recall@5 ≥ 0.30 |
| TC-RAG-RET-002 | MRR baseline | topK=5 | MRR ≥ 0.20 |
| TC-RAG-RET-003 | So sánh 3 model (MiniLM, E5-small, vn-embedding) | configs.json | Báo cáo bảng so sánh |
| TC-RAG-RET-004 | Latency trung bình mỗi truy vấn | – | ≤ 500ms với MiniLM |
| TC-RAG-RET-005 | Smoke run (5 testcase) trước khi full | --limit 5 | Không lỗi runtime |

## 4. RAG — Generation (DeepEval)

Cần OPENAI_API_KEY hoặc GEMINI_API_KEY trong `chatbot/.env`.

| ID | Metric (DeepEval) | Ngưỡng tối thiểu |
|----|------------------|-------------------|
| TC-RAG-GEN-001 | AnswerRelevancy | ≥ 0.70 |
| TC-RAG-GEN-002 | Faithfulness | ≥ 0.75 |
| TC-RAG-GEN-003 | ContextualRelevancy | ≥ 0.65 |
| TC-RAG-GEN-004 | HallucinationMetric (optional, --enable-hallucination) | ≤ 0.30 |

## 5. RAG — Ablation / regression

| ID | Case | Expected |
|----|------|---------|
| TC-RAG-AB-001 | chunk_size 600 vs 800 vs 1000 | Báo cáo Recall@5 + latency |
| TC-RAG-AB-002 | chunking method: fixed vs sentence vs paragraph | Báo cáo |
| TC-RAG-AB-003 | similarity_threshold 0.20 vs 0.28 vs 0.40 | Báo cáo |
| TC-RAG-AB-004 | topK = 3 vs 5 vs 10 | Báo cáo Recall@k tương ứng |

## 6. End-to-end qua API backend

| ID | Case | Expected |
|----|------|---------|
| TC-CHAT-E2E-001 | POST /api/chatbot/message {"Tìm khách sạn ở Đà Nẵng"} | Response có ít nhất 1 intent + 1 reply |
| TC-CHAT-E2E-002 | POST /api/chatbot/recommend {"Đi Đà Nẵng 3 ngày 4 người"} | Trip package có hotels[], tours[], transports[] |
| TC-CHAT-E2E-003 | Conversation lưu DB | Sau khi chat, GET /conversations có message |
| TC-CHAT-E2E-004 | RASA unreachable | Backend trả lỗi rõ ràng, không 500 leak stack |

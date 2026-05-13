"""TC-NLU-* — gọi trực tiếp RASA REST webhook để kiểm intent + entity."""
import os

import pytest
import requests


RASA_URL = os.getenv("RASA_URL", "http://localhost:5005")


CASES = [
    ("TC-NLU-001", "Xin chào", "greet", []),
    ("TC-NLU-002", "Tạm biệt", "goodbye", []),
    ("TC-NLU-003", "Cảm ơn nhiều", "thank_you", []),
    ("TC-NLU-004", "Tìm khách sạn ở Đà Nẵng", "search_hotel", ["location"]),
    ("TC-NLU-005", "Khách sạn dưới 1 triệu ở Đà Lạt", "search_hotel", ["location"]),
    ("TC-NLU-006", "Tour 3 ngày 2 đêm cho gia đình", "search_tour", ["duration"]),
    ("TC-NLU-007", "Vé máy bay Hà Nội Sài Gòn ngày mai", "search_flight", ["flight_from", "flight_to"]),
    ("TC-NLU-008", "Giá phòng deluxe bao nhiêu", "ask_hotel_price", []),
    ("TC-NLU-009", "Khách sạn có hồ bơi không", "ask_hotel_amenities", []),
    ("TC-NLU-010", "Đà Lạt có gì hay", "ask_location", ["location"]),
    ("TC-NLU-012", "Quán phở ngon ở Hà Nội", "ask_foodtour", ["location"]),
    ("TC-NLU-013", "Bạn là ai", "bot_challenge", []),
    ("TC-NLU-014", "giúp tôi", "help", []),
]


@pytest.mark.parametrize("tc_id,text,expected_intent,expected_entity_types", CASES)
def test_rasa_intent(rasa_up, tc_id, text, expected_intent, expected_entity_types):
    if not rasa_up:
        pytest.skip("RASA chưa chạy ở localhost:5005")

    r = requests.post(
        f"{RASA_URL}/model/parse",
        json={"text": text},
        timeout=10,
    )
    assert r.status_code == 200, f"{tc_id}: HTTP {r.status_code}"
    payload = r.json()
    intent = payload.get("intent", {}).get("name")
    confidence = payload.get("intent", {}).get("confidence", 0.0)

    assert intent == expected_intent, (
        f"{tc_id}: intent={intent} (conf={confidence:.2f}) "
        f"expected={expected_intent} for text={text!r}"
    )

    if expected_entity_types:
        ent_types = {e.get("entity") for e in payload.get("entities", [])}
        for et in expected_entity_types:
            assert et in ent_types, (
                f"{tc_id}: thiếu entity {et}, thực tế: {ent_types}"
            )

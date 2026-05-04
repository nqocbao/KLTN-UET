"""
Custom Actions for RASA Travel Chatbot
Kết nối với Backend API để query dữ liệu thực từ MongoDB
"""

import os
import re
import unicodedata
import requests
from datetime import datetime, timedelta
from typing import Any, Text, Dict, List, Optional
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from rasa_sdk.forms import FormValidationAction
from dotenv import load_dotenv

load_dotenv()

# Backend API URL
BACKEND_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000")
_FOOD_REVIEW_RAG = None
_RAG_IMPORT_ERROR: Optional[str] = None


def get_food_review_rag():
    global _FOOD_REVIEW_RAG, _RAG_IMPORT_ERROR
    if _FOOD_REVIEW_RAG is not None or _RAG_IMPORT_ERROR:
        return _FOOD_REVIEW_RAG

    try:
        from rag.food_reviews_rag import FoodReviewRagService
    except Exception as e:
        _RAG_IMPORT_ERROR = str(e)
        return None

    _FOOD_REVIEW_RAG = FoodReviewRagService(backend_url=BACKEND_URL)
    return _FOOD_REVIEW_RAG

# Alias địa điểm -> mã sân bay IATA, ưu tiên các route phổ biến của hệ thống.
AIRPORT_IATA_ALIASES: Dict[str, str] = {
    # Vietnam
    "ha noi": "HAN",
    "hanoi": "HAN",
    "noi bai": "HAN",
    "ho chi minh": "SGN",
    "hcm": "SGN",
    "tp hcm": "SGN",
    "tphcm": "SGN",
    "sai gon": "SGN",
    "saigon": "SGN",
    "tan son nhat": "SGN",
    "da nang": "DAD",
    "danang": "DAD",
    "phu quoc": "PQC",
    "nha trang": "CXR",
    "cam ranh": "CXR",
    "da lat": "DLI",
    "dalat": "DLI",
    "lien khuong": "DLI",
    "hue": "HUI",
    "phu bai": "HUI",
    "hai phong": "HPH",
    "cat bi": "HPH",
    "can tho": "VCA",
    "vinh": "VII",
    "quy nhon": "UIH",
    "phu cat": "UIH",
    "thanh hoa": "THD",
    "tho xuan": "THD",
    "dong hoi": "VDH",
    "buon ma thuot": "BMV",
    "pleiku": "PXU",

    # International
    "singapore": "SIN",
    "bangkok": "BKK",
    "seoul": "ICN",
    "tokyo": "NRT",
    "osaka": "KIX",
    "taipei": "TPE",
    "hong kong": "HKG",
    "kuala lumpur": "KUL",
    "jakarta": "CGK",
    "paris": "CDG",
    "dubai": "DXB",
}

# Danh sách tỉnh thành phổ biến để fallback extract
VIETNAM_LOCATIONS = [
    "hà nội", "ha noi", "hanoi",
    "hồ chí minh", "ho chi minh", "sài gòn", "sai gon", "tphcm", "tp.hcm", "tp hcm",
    "đà nẵng", "da nang", "danang",
    "nha trang",
    "phú quốc", "phu quoc",
    "đà lạt", "da lat", "dalat",
    "hội an", "hoi an",
    "sapa", "sa pa",
    "huế", "hue",
    "cần thơ", "can tho",
    "hải phòng", "hai phong",
    "quảng ninh", "quang ninh", "hạ long", "ha long",
    "ninh bình", "ninh binh",
    "phan thiết", "phan thiet", "mũi né", "mui ne",
    "quy nhơn", "quy nhon",
    "vũng tàu", "vung tau",
    "buôn ma thuột", "buon ma thuot",
    "pleiku", "kon tum",
    "vinh", "thanh hóa", "thanh hoa",
    "hà tĩnh", "ha tinh",
    "quảng bình", "quảng trị",
    "phan rang", "ninh thuận",
    "bình thuận", "bình dương", "đồng nai",
    "cà mau", "kiên giang", "bạc liêu",
    "long an", "tiền giang", "bến tre", "vĩnh long",
    "an giang", "đồng tháp",
]


def extract_location_from_text(text: str) -> Optional[str]:
    """Fallback: tìm tên địa điểm trong raw text bằng regex"""
    text_lower = text.lower()

    # Tìm pattern: "ở {location}", "tại {location}", "đến {location}"
    patterns = [
        r'(?:ở|tại|đến|đi|về|ở|cho tôi|cho mình)\s+([\w\s]+?)(?:\s*$|\s+(?:không|nhé|nha|đó|ạ|này|có|được))'
    ]
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            candidate = match.group(1).strip()
            # Kiểm tra xem candidate có phải địa điểm không
            for loc in VIETNAM_LOCATIONS:
                if loc in candidate or candidate in loc:
                    # Trả về dạng title case
                    return candidate.title()

    # Tìm trực tiếp tên địa điểm trong text
    for loc in VIETNAM_LOCATIONS:
        if loc in text_lower:
            return loc.title()

    return None


def format_price(price: int) -> str:
    """Format giá tiền VND"""
    if price >= 1_000_000:
        return f"{price / 1_000_000:.1f} triệu".replace(".0 ", " ")
    elif price >= 1_000:
        return f"{price / 1_000:.0f}K"
    return str(price)


def format_price_range(min_value: Optional[float], max_value: Optional[float]) -> str:
    if min_value and max_value and min_value != max_value:
        return f"{format_price(int(min_value))} - {format_price(int(max_value))}"
    value = min_value or max_value
    if value:
        return format_price(int(value))
    return "Đang cập nhật"


def normalize_flight_date(raw_value: Optional[str]) -> Optional[str]:
    """Chuẩn hóa ngày bay về định dạng YYYY-MM-DD."""
    if not raw_value:
        return None

    text = raw_value.strip().lower()
    today = datetime.now()

    if text in {"hôm nay", "hom nay", "today"}:
        return today.strftime("%Y-%m-%d")
    if text in {"mai", "ngày mai", "ngay mai", "tomorrow"}:
        return (today + timedelta(days=1)).strftime("%Y-%m-%d")

    if re.match(r"^\d{4}-\d{2}-\d{2}$", text):
        return text

    ddmmyyyy = re.match(r"^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$", text)
    if ddmmyyyy:
        day, month, year = ddmmyyyy.groups()
        try:
            return datetime(int(year), int(month), int(day)).strftime("%Y-%m-%d")
        except ValueError:
            return None

    ddmm = re.match(r"^(\d{1,2})[/-](\d{1,2})$", text)
    if ddmm:
        day, month = ddmm.groups()
        year = today.year
        try:
            candidate = datetime(year, int(month), int(day))
            if candidate.date() < today.date():
                candidate = datetime(year + 1, int(month), int(day))
            return candidate.strftime("%Y-%m-%d")
        except ValueError:
            return None

    return None


def normalize_hotel_date(raw_value: Optional[str]) -> Optional[str]:
    """Chuẩn hóa ngày nhận/trả phòng về định dạng YYYY-MM-DD."""
    if not raw_value:
        return None

    text = raw_value.strip().lower()
    today = datetime.now()

    if text in {"hôm nay", "hom nay", "today"}:
        return today.strftime("%Y-%m-%d")
    if text in {"mai", "ngày mai", "ngay mai", "tomorrow"}:
        return (today + timedelta(days=1)).strftime("%Y-%m-%d")

    if re.match(r"^\d{4}-\d{2}-\d{2}$", text):
        return text

    ddmmyyyy = re.match(r"^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$", text)
    if ddmmyyyy:
        day, month, year = ddmmyyyy.groups()
        try:
            return datetime(int(year), int(month), int(day)).strftime("%Y-%m-%d")
        except ValueError:
            return None

    ddmm = re.match(r"^(\d{1,2})[/-](\d{1,2})$", text)
    if ddmm:
        day, month = ddmm.groups()
        year = today.year
        try:
            candidate = datetime(year, int(month), int(day))
            if candidate.date() < today.date():
                candidate = datetime(year + 1, int(month), int(day))
            return candidate.strftime("%Y-%m-%d")
        except ValueError:
            return None

    return None


def normalize_guest_count(raw_value: Any) -> Optional[int]:
    """Chuẩn hóa số lượng khách từ text/number."""
    if raw_value is None:
        return None

    if isinstance(raw_value, (int, float)):
        guests = int(raw_value)
        return guests if guests > 0 else None

    text = str(raw_value).strip().lower()
    m = re.search(r"(\d+)", text)
    if not m:
        if text in {"gia đình", "family"}:
            return 4
        return None

    guests = int(m.group(1))
    return guests if guests > 0 else None


def normalize_text_for_lookup(value: str) -> str:
    """Chuẩn hóa text để tra cứu alias ổn định, không phụ thuộc dấu tiếng Việt."""
    normalized = unicodedata.normalize("NFD", value.strip().lower())
    no_accents = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    no_accents = no_accents.replace("tp.", "tp ").replace("-", " ")
    no_accents = re.sub(r"[^a-z0-9\s]", " ", no_accents)
    return re.sub(r"\s+", " ", no_accents).strip()


def resolve_airport_iata(location: Optional[str]) -> Optional[str]:
    """Chuyển địa điểm tự nhiên hoặc mã sân bay về IATA 3 ký tự."""
    if not location:
        return None

    raw = str(location).strip()
    if not raw:
        return None

    # User nhập thẳng IATA (vd: HAN, SGN)
    if re.fullmatch(r"[A-Za-z]{3}", raw):
        return raw.upper()

    lookup = normalize_text_for_lookup(raw)
    if not lookup:
        return None

    if lookup in AIRPORT_IATA_ALIASES:
        return AIRPORT_IATA_ALIASES[lookup]

    # Fallback: match theo cụm con dài trước để tăng độ chính xác.
    for alias in sorted(AIRPORT_IATA_ALIASES.keys(), key=len, reverse=True):
        if re.search(rf"\b{re.escape(alias)}\b", lookup):
            return AIRPORT_IATA_ALIASES[alias]

    return None


class ActionSearchHotels(Action):
    """Tìm kiếm khách sạn từ database qua Backend API"""

    def name(self) -> Text:
        return "action_search_hotels"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        location = tracker.get_slot("location")
        check_in_date = normalize_hotel_date(tracker.get_slot("check_in_date"))
        check_out_date = normalize_hotel_date(tracker.get_slot("check_out_date"))
        guests = normalize_guest_count(tracker.get_slot("number_of_guests"))

        # Fallback: extract location từ raw message text nếu slot chưa có
        raw_text = tracker.latest_message.get("text", "")
        if not location:
            location = extract_location_from_text(raw_text)

        if not check_in_date:
            check_in_date = normalize_hotel_date(raw_text)

        if not guests:
            guests = normalize_guest_count(raw_text)

        if not location:
            dispatcher.utter_message(
                text="Bạn muốn tìm khách sạn ở đâu? Hãy cho tôi biết địa điểm nhé! "
                "Ví dụ: Hà Nội, Đà Nẵng, Nha Trang..."
            )
            return []

        if not check_in_date:
            dispatcher.utter_message(
                text="Bạn muốn nhận phòng ngày nào? Ví dụ: 2026-04-20 hoặc ngày mai."
            )
            return []

        if not check_out_date:
            dispatcher.utter_message(
                text="Bạn muốn trả phòng ngày nào? Ví dụ: 2026-04-22."
            )
            return []

        if check_out_date <= check_in_date:
            dispatcher.utter_message(
                text="Ngày trả phòng phải sau ngày nhận phòng. Bạn vui lòng nhập lại ngày trả phòng nhé."
            )
            return []

        guests = guests or 2

        try:
            params: Dict[str, Any] = {
                "q": f"{location} hotels",
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "adults": guests,
                "gl": "vn",
                "hl": "vi",
                "currency": "VND",
            }

            response = requests.get(
                f"{BACKEND_URL}/api/client/hotels/search",
                params=params,
                timeout=8,
            )
            response.raise_for_status()
            data = response.json()

            hotels = data.get("data", [])

            # Fallback DB nếu SerpAPI trả về rỗng
            if not hotels:
                fallback_response = requests.get(
                    f"{BACKEND_URL}/api/client/hotels",
                    params={"location": location, "limit": 5, "sortBy": "popularity"},
                    timeout=8,
                )
                fallback_response.raise_for_status()
                fallback_data = fallback_response.json()
                hotels = fallback_data.get("data", [])

            total = data.get("total", len(hotels))

            if hotels:
                dispatcher.utter_message(
                    text=(
                        f"🏨 Tìm thấy **{total} khách sạn** ở **{location}** "
                        f"từ **{check_in_date}** đến **{check_out_date}** "
                        f"cho **{guests} khách**:"
                    )
                )
                items = []
                for hotel in hotels[:5]:
                    raw_price_text = hotel.get("price_text")
                    price = hotel.get("price") or hotel.get("priceTwoSingleBed") or hotel.get("priceOneSingleOneDoubleBed")
                    items.append({
                        "name": hotel.get("name", "N/A"),
                        "image_url": hotel.get("image_url") or hotel.get("banner_url"),
                        "rating": hotel.get("rating"),
                        "price_text": raw_price_text or (format_price(price) if price else None),
                        "available_rooms": hotel.get("available_rooms") if "available_rooms" in hotel else hotel.get("availableRooms"),
                    })
                dispatcher.utter_message(json_message={
                    "type": "hotel_cards",
                    "items": items,
                })
                dispatcher.utter_message(
                    text="💬 Nhập tên khách sạn để xem chi tiết, hoặc cho tôi biết ngân sách của bạn nhé!"
                )
            else:
                dispatcher.utter_message(
                    text=f"Xin lỗi, tôi không tìm thấy khách sạn ở **{location}**. "
                    "Bạn thử tìm ở Hà Nội, Đà Nẵng, Nha Trang hoặc Phú Quốc nhé!"
                )
        except requests.exceptions.ConnectionError:
            dispatcher.utter_message(
                text="Xin lỗi, hệ thống đang bảo trì. Vui lòng thử lại sau ít phút."
            )
        except Exception as e:
            print(f"[action_search_hotels] Error: {e}")
            dispatcher.utter_message(
                text="Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau."
            )

        return [
            SlotSet("check_in_date", check_in_date),
            SlotSet("check_out_date", check_out_date),
            SlotSet("number_of_guests", guests),
        ]


class ActionSearchTours(Action):
    """Tìm kiếm tour du lịch từ database"""

    def name(self) -> Text:
        return "action_search_tours"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        destination = tracker.get_slot("destination")
        location = tracker.get_slot("location")
        search_term = destination or location

        # Fallback: extract từ raw text nếu cả hai slot đều trống
        if not search_term:
            raw_text = tracker.latest_message.get("text", "")
            search_term = extract_location_from_text(raw_text)

        try:
            params: Dict[str, Any] = {
                "limit": 5,
                "sortBy": "popularity",
                "status": "active",
            }

            if search_term:
                params["location"] = search_term

            response = requests.get(
                f"{BACKEND_URL}/api/client/tours",
                params=params,
                timeout=8,
            )
            data = response.json()

            tours = data.get("data", [])
            total = data.get("pagination", {}).get("total", 0)

            if tours:
                location_text = f" tại **{search_term}**" if search_term else ""
                dispatcher.utter_message(
                    text=f"🎫 Tìm thấy **{total} tour**{location_text}:"
                )
                items = []
                for tour in tours[:5]:
                    price = tour.get("adult_price")
                    items.append({
                        "name": tour.get("name", "N/A"),
                        "image_url": tour.get("image") or tour.get("banner_url"),
                        "rating": tour.get("rating"),
                        "price_text": format_price(price) if price else None,
                        "duration": tour.get("duration_days"),
                    })
                dispatcher.utter_message(json_message={
                    "type": "tour_cards",
                    "items": items,
                })
                dispatcher.utter_message(
                    text="💬 Bạn quan tâm tour nào? Tôi có thể xem chi tiết lịch trình cho bạn!"
                )
            else:
                fallback = f" liên quan đến **{search_term}**" if search_term else ""
                dispatcher.utter_message(
                    text=f"Xin lỗi, hiện tại chưa có tour nào{fallback}. "
                    "Bạn thử tìm tour đi Đà Lạt, Sapa, Phú Quốc hoặc Nhật Bản nhé!"
                )
        except requests.exceptions.ConnectionError:
            dispatcher.utter_message(
                text="Xin lỗi, hệ thống đang bảo trì. Vui lòng thử lại sau ít phút."
            )
        except Exception as e:
            print(f"[action_search_tours] Error: {e}")
            dispatcher.utter_message(
                text="Có lỗi xảy ra khi tìm kiếm tour. Vui lòng thử lại sau."
            )

        return []


class ActionSearchFlights(Action):
    """Tìm kiếm chuyến bay"""

    def name(self) -> Text:
        return "action_search_flights"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        flight_from = tracker.get_slot("flight_from")
        flight_to = tracker.get_slot("flight_to")
        flight_date = normalize_flight_date(tracker.get_slot("flight_date"))
        guests = tracker.get_slot("number_of_guests")

        if not flight_date:
            raw_text = tracker.latest_message.get("text", "")
            flight_date = normalize_flight_date(raw_text)

        if not flight_from or not flight_to:
            dispatcher.utter_message(
                text="Bạn muốn bay từ đâu đến đâu? Ví dụ: Hà Nội đi Đà Nẵng."
            )
            return []

        if not flight_date:
            dispatcher.utter_message(
                text="Bạn muốn bay ngày nào? Ví dụ: 2026-04-20 hoặc ngày mai."
            )
            return []

        flight_from_display = clean_location_text(str(flight_from)) if flight_from else str(flight_from)
        flight_to_display = clean_location_text(str(flight_to)) if flight_to else str(flight_to)

        departure_iata = resolve_airport_iata(str(flight_from_display))
        arrival_iata = resolve_airport_iata(str(flight_to_display))

        if not departure_iata:
            dispatcher.utter_message(
                text="Tôi chưa xác định được sân bay điểm đi. "
                "Bạn vui lòng nhập thành phố hoặc mã sân bay (ví dụ: Hà Nội/HAN, TP.HCM/SGN)."
            )
            return []

        if not arrival_iata:
            dispatcher.utter_message(
                text="Tôi chưa xác định được sân bay điểm đến. "
                "Bạn vui lòng nhập thành phố hoặc mã sân bay (ví dụ: Đà Nẵng/DAD, Phú Quốc/PQC)."
            )
            return []

        if departure_iata == arrival_iata:
            dispatcher.utter_message(
                text="Điểm đi và điểm đến đang trùng nhau. "
                "Bạn vui lòng cho tôi điểm đến khác nhé."
            )
            return []

        try:
            params: Dict[str, Any] = {
                "from": departure_iata,
                "to": arrival_iata,
                "date": flight_date,
                "adults": int(guests) if guests else 1,
            }

            print(
                f"[action_search_flights] Route normalized: "
                f"{flight_from_display}({departure_iata}) -> {flight_to_display}({arrival_iata}) on {flight_date}"
            )

            response = requests.get(
                f"{BACKEND_URL}/api/client/flights/search",
                params=params,
                timeout=8,
            )
            response.raise_for_status()
            data = response.json()

            flights = data.get("data", [])

            if flights:
                route = ""
                if flight_from_display and flight_to_display:
                    route = f" từ **{flight_from_display}** đến **{flight_to_display}**"
                elif flight_from_display:
                    route = f" từ **{flight_from_display}**"
                elif flight_to_display:
                    route = f" đến **{flight_to_display}**"

                dispatcher.utter_message(
                    text=f"✈️ Tìm thấy **{len(flights)} chuyến bay**{route} ngày **{flight_date}**:"
                )
                items = []
                for flight in flights[:5]:
                    price = flight.get("price")
                    items.append({
                        "name": flight.get("service_name", "N/A"),
                        "image_url": flight.get("image"),
                        "departure": flight.get("departure_location", ""),
                        "arrival": flight.get("arrival_location", ""),
                        "dep_time": flight.get("departure_time", ""),
                        "duration_text": flight.get("duration", ""),
                        "price_text": format_price(price) if price else None,
                    })
                dispatcher.utter_message(json_message={
                    "type": "flight_cards",
                    "items": items,
                })
                dispatcher.utter_message(
                    text="💬 Bạn muốn đặt chuyến bay nào?"
                )
            else:
                dispatcher.utter_message(
                    text="Xin lỗi, không tìm thấy chuyến bay phù hợp. "
                    "Bạn thử thay đổi điểm đi/đến hoặc ngày bay nhé!"
                )
        except requests.exceptions.ConnectionError:
            dispatcher.utter_message(
                text="Xin lỗi, hệ thống đang bảo trì. Vui lòng thử lại sau."
            )
        except requests.exceptions.HTTPError as e:
            print(f"[action_search_flights] HTTP error: {e}")
            dispatcher.utter_message(
                text="Không thể tìm chuyến bay với thông tin hiện tại. "
                "Bạn thử đổi điểm đi/đến hoặc ngày bay nhé."
            )
        except Exception as e:
            print(f"[action_search_flights] Error: {e}")
            dispatcher.utter_message(
                text="Có lỗi xảy ra khi tìm chuyến bay. Vui lòng thử lại sau."
            )

        return [SlotSet("flight_date", flight_date)]


class ActionGetHotelDetails(Action):
    """Lấy chi tiết khách sạn theo tên"""

    def name(self) -> Text:
        return "action_get_hotel_details"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        hotel_name = tracker.get_slot("hotel_name")

        if not hotel_name:
            dispatcher.utter_message(
                text="Bạn muốn xem chi tiết khách sạn nào? Hãy cho tôi biết tên khách sạn nhé!"
            )
            return []

        try:
            response = requests.get(
                f"{BACKEND_URL}/api/client/hotels",
                params={"name": hotel_name, "limit": 1},
                timeout=8,
            )
            data = response.json()
            hotels = data.get("data", [])

            if hotels:
                hotel = hotels[0]
                name = hotel.get("name", "N/A")
                rating = hotel.get("rating", "N/A")
                description = hotel.get("description", "")
                price_single = hotel.get("priceTwoSingleBed")
                price_double = hotel.get("priceOneSingleOneDoubleBed")
                location = hotel.get("location", "")
                rooms = hotel.get("availableRooms", 0)

                msg = f"🏨 **{name}**\n\n"
                if rating:
                    msg += f"⭐ Đánh giá: {rating}/5\n"
                if location:
                    msg += f"📍 Vị trí: {location}\n"
                if rooms:
                    msg += f"🛏️ Phòng trống: {rooms}\n"
                if price_single:
                    msg += f"💰 Phòng 2 giường đơn: {format_price(price_single)}/đêm\n"
                if price_double:
                    msg += f"💰 Phòng 1 đơn + 1 đôi: {format_price(price_double)}/đêm\n"
                if description:
                    msg += f"\n📝 {description[:200]}"

                msg += "\n\nBạn có muốn đặt phòng không?"
                dispatcher.utter_message(text=msg)
            else:
                dispatcher.utter_message(
                    text=f"Xin lỗi, tôi không tìm thấy khách sạn **{hotel_name}**. "
                    "Bạn thử tìm với tên khác nhé!"
                )
        except Exception as e:
            print(f"[action_get_hotel_details] Error: {e}")
            dispatcher.utter_message(
                text="Có lỗi xảy ra khi lấy thông tin. Vui lòng thử lại sau."
            )

        return []


class ActionGetDestinationInfo(Action):
    """Gợi ý điểm đến du lịch"""

    def name(self) -> Text:
        return "action_get_destination_info"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        destination = tracker.get_slot("destination")
        location = tracker.get_slot("location")

        try:
            params: Dict[str, Any] = {
                "type": "tourist",
                "limit": 5,
            }
            if destination or location:
                params["q"] = destination or location

            response = requests.get(
                f"{BACKEND_URL}/api/client/destinations/suggestions",
                params=params,
                timeout=8,
            )
            data = response.json()
            destinations = data.get("data", [])

            if destinations:
                search_hint = f" liên quan đến **{destination or location}**" if (destination or location) else " phổ biến"
                msg = f"🗺️ Các điểm đến{search_hint}:\n\n"
                for i, dest in enumerate(destinations[:5], 1):
                    name = dest.get("name", "N/A")
                    desc = dest.get("description", "")
                    city = dest.get("city", "")

                    msg += f"**{i}. {name}**"
                    if city:
                        msg += f" - {city}"
                    if desc:
                        msg += f"\n   {desc[:100]}"
                    msg += "\n"

                msg += "\nBạn muốn tìm tour hoặc khách sạn ở điểm đến nào?"
                dispatcher.utter_message(text=msg)
            else:
                dispatcher.utter_message(
                    text="Dưới đây là một số điểm đến phổ biến:\n\n"
                    "🏖️ **Đà Nẵng** - Biển đẹp, Bà Nà Hills\n"
                    "🏔️ **Sapa** - Ruộng bậc thang, trekking\n"
                    "🌴 **Phú Quốc** - Đảo ngọc, biển xanh\n"
                    "🏛️ **Hà Nội** - Văn hóa, lịch sử\n"
                    "🌸 **Đà Lạt** - Thành phố ngàn hoa\n\n"
                    "Bạn quan tâm đến đâu?"
                )
        except Exception as e:
            print(f"[action_get_destination_info] Error: {e}")
            dispatcher.utter_message(
                text="Dưới đây là một số điểm đến phổ biến:\n\n"
                "🏖️ **Đà Nẵng** - Biển đẹp, Bà Nà Hills\n"
                "🏔️ **Sapa** - Ruộng bậc thang, trekking\n"
                "🌴 **Phú Quốc** - Đảo ngọc, biển xanh\n"
                "🏛️ **Hà Nội** - Văn hóa, lịch sử\n"
                "🌸 **Đà Lạt** - Thành phố ngàn hoa\n\n"
                "Bạn quan tâm đến đâu?"
            )

        return []


class ActionGetRecommendations(Action):
    """Gợi ý tour/khách sạn phổ biến"""

    def name(self) -> Text:
        return "action_get_recommendations"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        try:
            # Lấy top tours phổ biến
            response = requests.get(
                f"{BACKEND_URL}/api/client/tours",
                params={
                    "limit": 3,
                    "sortBy": "popularity",
                    "status": "active",
                },
                timeout=8,
            )
            data = response.json()
            tours = data.get("data", [])

            msg = "🌟 **Gợi ý dành cho bạn:**\n\n"

            if tours:
                msg += "🎫 **Top tour nổi bật:**\n"
                for i, tour in enumerate(tours[:3], 1):
                    name = tour.get("name", "N/A")
                    price = tour.get("adult_price")
                    duration = tour.get("duration_days")
                    rating = tour.get("rating")

                    msg += f"  {i}. {name}"
                    if duration:
                        msg += f" ({duration} ngày)"
                    if rating:
                        msg += f" ⭐{rating}"
                    if price:
                        msg += f" - {format_price(price)}"
                    msg += "\n"

            msg += (
                "\n💡 **Bạn cũng có thể:**\n"
                "  • Tìm khách sạn: \"tìm khách sạn ở Đà Nẵng\"\n"
                "  • Tìm tour: \"tìm tour đi Sapa\"\n"
                "  • Tìm vé bay: \"vé máy bay Hà Nội đi Đà Nẵng\"\n"
            )

            dispatcher.utter_message(text=msg)

        except Exception as e:
            print(f"[action_get_recommendations] Error: {e}")
            dispatcher.utter_message(
                text="🌟 **Gợi ý dành cho bạn:**\n\n"
                "🏖️ Tour Đà Nẵng - Hội An (4 ngày)\n"
                "🏔️ Tour Sapa - Fansipan (3 ngày)\n"
                "🌴 Tour Phú Quốc (5 ngày)\n\n"
                "Bạn muốn tìm hiểu thêm về tour nào?"
            )

        return []


class ActionRagFoodReviews(Action):
    """RAG: Gợi ý review food tour dựa trên dữ liệu hiện có."""

    def name(self) -> Text:
        return "action_rag_food_reviews"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        if tracker.active_loop:
            dispatcher.utter_message(
                text="Bạn đang cung cấp thông tin để đặt dịch vụ. "
                "Hãy trả lời phần đang được hỏi trước nhé."
            )
            return []

        question = (tracker.latest_message.get("text") or "").strip()
        if len(question) < 3:
            dispatcher.utter_message(
                text="Bạn có thể nói rõ món ăn hoặc khu vực bạn quan tâm không?"
            )
            return []

        try:
            rag_service = get_food_review_rag()
            if rag_service is None:
                dispatcher.utter_message(
                    text=(
                        "Chưa thể khởi tạo RAG vì thiếu dependencies. "
                        "Vui lòng chạy: pip install -r requirements.txt trong thư mục chatbot."
                    )
                )
                if _RAG_IMPORT_ERROR:
                    print(f"[action_rag_food_reviews] Import error: {_RAG_IMPORT_ERROR}")
                return []

            results = rag_service.query(question)
        except Exception as e:
            print(f"[action_rag_food_reviews] Error: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, tôi chưa thể tra cứu food review lúc này. "
                "Bạn thử lại sau nhé."
            )
            return []

        if not results:
            dispatcher.utter_message(
                text="Mình chưa tìm được review phù hợp. "
                "Bạn thử nêu rõ khu vực hoặc món ăn nhé."
            )
            return []
        dispatcher.utter_message(text="Mình tìm được một số review food tour phù hợp:")

        items = []
        for item in results[:5]:
            location = ", ".join([p for p in [item.district, item.city] if p])
            items.append(
                {
                    "name": item.title,
                    "image_url": item.image_url or None,
                    "description": item.summary,
                    "price_text": format_price_range(item.price_min, item.price_max),
                    "location": location or None,
                    "post_url": item.post_url,
                    "engagement_score": item.engagement_score,
                }
            )

        dispatcher.utter_message(
            json_message={
                "type": "food_review_cards",
                "items": items,
            }
        )

        dispatcher.utter_message(
            text="Bạn muốn lọc theo khu vực, món ăn hay mức giá không?"
        )
        return []


class ActionSaveConversation(Action):
    """Lưu conversation vào database (thông qua Backend API)"""

    def name(self) -> Text:
        return "action_save_conversation"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        # Conversation đã được lưu bởi Backend chatbot controller
        # Action này chỉ dùng làm placeholder nếu cần xử lý thêm
        return []


class ActionGetFullItinerary(Action):
    """Gọi /api/chatbot/recommend để lấy gói lịch trình đầy đủ (tour + chuyến bay + khách sạn)."""

    def name(self) -> Text:
        return "action_get_full_itinerary"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        destination = tracker.get_slot("destination") or tracker.get_slot("location")

        # Fallback to raw text if no slot
        if not destination:
            raw = tracker.latest_message.get("text", "")
            destination = extract_location_from_text(raw)

        if not destination:
            dispatcher.utter_message(
                text="Bạn muốn đi đâu? Hãy cho tôi biết điểm đến để tôi gợi ý lịch trình đầy đủ nhé!"
            )
            return []

        raw_text = tracker.latest_message.get("text", "")

        try:
            response = requests.post(
                f"{BACKEND_URL}/api/chatbot/recommend",
                json={"message": raw_text or f"đi {destination}", "sender": tracker.sender_id},
                timeout=12,
            )
            data = response.json()

            intro = data.get("text", f"Đây là gợi ý lịch trình cho chuyến đi {destination}:")
            dispatcher.utter_message(text=intro)

            trip_package = data.get("trip_package")
            if trip_package:
                # Forward as custom JSON so that the frontend can render TripPackageCard
                dispatcher.utter_message(json_message={"type": "trip_package", **trip_package})
            else:
                dispatcher.utter_message(
                    text=f"Hiện tại chưa có dữ liệu đủ cho {destination}. "
                    "Bạn thử Đà Nẵng, Phú Quốc, Nha Trang hoặc Đà Lạt nhé!"
                )

        except requests.exceptions.ConnectionError:
            dispatcher.utter_message(
                text="Xin lỗi, hệ thống đang bảo trì. Vui lòng thử lại sau ít phút."
            )
        except Exception as e:
            print(f"[action_get_full_itinerary] Error: {e}")
            dispatcher.utter_message(
                text="Có lỗi xảy ra khi tạo lịch trình. Vui lòng thử lại sau."
            )

        return [SlotSet("destination", destination)]


# =============================================================================
# FORM VALIDATION ACTIONS
# Xử lý và làm sạch giá trị slot trong các form multi-turn
# =============================================================================

VIETNAMESE_LOCATION_PREFIXES = [
    "ở ", "tại ", "đến ", "đi ", "về ",
    "bay đến ", "bay từ ", "từ ", "xuất phát từ ",
    "tour đi ", "tour tại ", "muốn đi ", "cần đi ",
]


def clean_location_text(text: str) -> Optional[str]:
    """Làm sạch text địa điểm: xóa prefix 'ở/tại/đến', chuẩn hóa hoa thường.

    Nếu sau khi xóa prefix vẫn còn > 3 từ (câu đầy đủ như "tôi muốn bay đến đà nẵng"),
    dùng extract_location_from_text để tách địa danh thực sự.
    """
    if not text:
        return None
    original = text.strip()
    text = original
    text_lower = text.lower()
    for prefix in VIETNAMESE_LOCATION_PREFIXES:
        if text_lower.startswith(prefix):
            text = text[len(prefix):].strip()
            text_lower = text.lower()
            break  # Chỉ xóa một prefix duy nhất
    # Nếu sau khi xóa prefix vẫn còn > 3 từ → câu đầy đủ, thử extract địa danh
    if len(text.split()) > 3:
        return extract_location_from_text(original)
    # Loại bỏ nếu quá ngắn (< 2 ký tự) hoặc quá dài (> 60 ký tự)
    if len(text) < 2 or len(text) > 60:
        return None
    # Không chấp nhận câu hỏi lưu vào slot
    question_markers = ["?", "không", "giú", "như nào", "bao nhiêu"]
    for marker in question_markers:
        if marker in text_lower:
            return None
    return text.title()


class ValidateFlightForm(FormValidationAction):
    """Validate và làm sạch dữ liệu tìm kiếm chuyến bay."""

    def name(self) -> Text:
        return "validate_flight_form"

    def validate_flight_from(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        if tracker.get_slot("requested_slot") != "flight_from":
            return {"flight_from": tracker.get_slot("flight_from")}

        cleaned = clean_location_text(str(slot_value))
        if not cleaned:
            dispatcher.utter_message(
                text="Tôi chưa hiểu điểm xuất phát. "
                "Bạn muốn bay từ thành phố nào? (ví dụ: Hà Nội, TP.HCM, Đà Nẵng)"
            )
            return {"flight_from": None}
        return {"flight_from": cleaned}

    def validate_flight_to(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        if tracker.get_slot("requested_slot") != "flight_to":
            return {"flight_to": tracker.get_slot("flight_to")}

        cleaned = clean_location_text(str(slot_value))
        if not cleaned:
            dispatcher.utter_message(
                text="Tôi chưa hiểu điểm đến. "
                "Bạn muốn bay đến đâu? (ví dụ: Đà Nẵng, Phú Quốc, Singapore)"
            )
            return {"flight_to": None}

        existing_from = tracker.get_slot("flight_from")
        if existing_from:
            normalized_from = normalize_text_for_lookup(str(existing_from))
            normalized_to = normalize_text_for_lookup(cleaned)
            if normalized_from and normalized_from == normalized_to:
                dispatcher.utter_message(
                    text="Điểm đến đang trùng với điểm đi. "
                    "Bạn vui lòng nhập điểm đến khác nhé."
                )
                return {"flight_to": None}

        return {"flight_to": cleaned}

    def validate_flight_date(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        normalized = normalize_flight_date(str(slot_value))
        if not normalized:
            dispatcher.utter_message(
                text="Ngày bay chưa hợp lệ. Hãy nhập dạng YYYY-MM-DD hoặc ví dụ: ngày mai."
            )
            return {"flight_date": None}
        return {"flight_date": normalized}


class ValidateHotelForm(FormValidationAction):
    """Validate và làm sạch dữ liệu tìm kiếm khách sạn."""

    def name(self) -> Text:
        return "validate_hotel_form"

    def validate_location(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        cleaned = clean_location_text(str(slot_value))
        if not cleaned:
            dispatcher.utter_message(
                text="Tôi chưa hiểu địa điểm bạn muốn tìm. "
                "Bạn muốn tìm khách sạn ở đâu? (ví dụ: Hà Nội, Đà Nẵng, Nha Trang)"
            )
            return {"location": None}
        return {"location": cleaned}

    def validate_check_in_date(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        normalized = normalize_hotel_date(str(slot_value))
        if not normalized:
            dispatcher.utter_message(
                text="Ngày nhận phòng chưa hợp lệ. Hãy nhập dạng YYYY-MM-DD hoặc ví dụ: ngày mai."
            )
            return {"check_in_date": None}
        return {"check_in_date": normalized}

    def validate_check_out_date(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        normalized = normalize_hotel_date(str(slot_value))
        if not normalized:
            dispatcher.utter_message(
                text="Ngày trả phòng chưa hợp lệ. Hãy nhập dạng YYYY-MM-DD."
            )
            return {"check_out_date": None}

        check_in_slot = tracker.get_slot("check_in_date")
        check_in = normalize_hotel_date(str(check_in_slot)) if check_in_slot else None
        if check_in and normalized <= check_in:
            dispatcher.utter_message(
                text="Ngày trả phòng phải sau ngày nhận phòng. Bạn vui lòng nhập lại nhé."
            )
            return {"check_out_date": None}

        return {"check_out_date": normalized}

    def validate_number_of_guests(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        guests = normalize_guest_count(slot_value)
        if guests is None or guests < 1 or guests > 20:
            dispatcher.utter_message(
                text="Số khách chưa hợp lệ. Bạn cho tôi số nguyên từ 1 đến 20 nhé."
            )
            return {"number_of_guests": None}
        return {"number_of_guests": guests}


class ValidateTourForm(FormValidationAction):
    """Validate và làm sạch dữ liệu tìm kiếm tour."""

    def name(self) -> Text:
        return "validate_tour_form"

    def validate_destination(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        cleaned = clean_location_text(str(slot_value))
        if not cleaned:
            dispatcher.utter_message(
                text="Tôi chưa hiểu điểm đến bạn muốn đi. "
                "Bạn muốn đi tour đến đâu? (ví dụ: Đà Lạt, Sapa, Phú Quốc, Nhật Bản)"
            )
            return {"destination": None}
        return {"destination": cleaned}

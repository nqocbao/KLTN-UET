"""
Custom Actions for RASA Travel Chatbot
Kết nối với Backend API để query dữ liệu thực từ MongoDB
"""

import os
import re
import requests
from typing import Any, Text, Dict, List, Optional
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from dotenv import load_dotenv

load_dotenv()

# Backend API URL
BACKEND_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000")

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
        price_range = tracker.get_slot("price_range")

        # Fallback: extract location từ raw message text nếu slot chưa có
        if not location:
            raw_text = tracker.latest_message.get("text", "")
            location = extract_location_from_text(raw_text)

        if not location:
            dispatcher.utter_message(
                text="Bạn muốn tìm khách sạn ở đâu? Hãy cho tôi biết địa điểm nhé! "
                "Ví dụ: Hà Nội, Đà Nẵng, Nha Trang..."
            )
            return []

        try:
            params: Dict[str, Any] = {
                "location": location,
                "limit": 5,
                "sortBy": "popularity",
            }

            response = requests.get(
                f"{BACKEND_URL}/api/client/hotels",
                params=params,
                timeout=8,
            )
            data = response.json()

            hotels = data.get("data", [])
            total = data.get("pagination", {}).get("total", 0)

            if hotels:
                msg = f"🏨 Tìm thấy **{total} khách sạn** ở **{location}**:\n\n"
                for i, hotel in enumerate(hotels[:5], 1):
                    name = hotel.get("name", "N/A")
                    rating = hotel.get("rating")
                    price = hotel.get("priceTwoSingleBed")

                    msg += f"**{i}. {name}**"
                    if rating:
                        msg += f" ⭐ {rating}/5"
                    if price:
                        msg += f" — từ {format_price(price)}/đêm"
                    msg += "\n"

                msg += f"\nBạn muốn xem chi tiết khách sạn nào? Hoặc tôi có thể lọc theo giá cho bạn."
                dispatcher.utter_message(text=msg)
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

        return []


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
                msg = f"🎫 Tìm thấy **{total} tour**{location_text}:\n\n"
                for i, tour in enumerate(tours[:5], 1):
                    name = tour.get("name", "N/A")
                    price = tour.get("adult_price")
                    duration = tour.get("duration_days")
                    rating = tour.get("rating")

                    msg += f"**{i}. {name}**"
                    if duration:
                        msg += f" ({duration} ngày)"
                    if rating:
                        msg += f" ⭐ {rating}/5"
                    if price:
                        msg += f" — {format_price(price)}/người"
                    msg += "\n"

                msg += "\nBạn quan tâm tour nào? Tôi có thể cho bạn xem chi tiết lịch trình."
                dispatcher.utter_message(text=msg)
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

        try:
            params: Dict[str, Any] = {
                "type": "flight",
                "limit": 5,
                "sortBy": "price_asc",
            }

            if flight_from:
                params["from"] = flight_from
            if flight_to:
                params["to"] = flight_to

            response = requests.get(
                f"{BACKEND_URL}/api/client/flights",
                params=params,
                timeout=8,
            )
            data = response.json()

            flights = data.get("data", [])

            if flights:
                route = ""
                if flight_from and flight_to:
                    route = f" từ **{flight_from}** đến **{flight_to}**"
                elif flight_from:
                    route = f" từ **{flight_from}**"
                elif flight_to:
                    route = f" đến **{flight_to}**"

                msg = f"✈️ Tìm thấy **{len(flights)} chuyến bay**{route}:\n\n"
                for i, flight in enumerate(flights[:5], 1):
                    name = flight.get("service_name", "N/A")
                    dep = flight.get("departure_location", "")
                    arr = flight.get("arrival_location", "")
                    dep_time = flight.get("departure_time", "")
                    price = flight.get("price")
                    duration = flight.get("duration", "")

                    msg += f"**{i}. {name}**\n"
                    msg += f"   {dep} → {arr}"
                    if dep_time:
                        msg += f" | {dep_time}"
                    if duration:
                        msg += f" | {duration}"
                    if price:
                        msg += f" | {format_price(price)}"
                    msg += "\n"

                msg += "\nBạn muốn đặt chuyến bay nào?"
                dispatcher.utter_message(text=msg)
            else:
                dispatcher.utter_message(
                    text="Xin lỗi, không tìm thấy chuyến bay phù hợp. "
                    "Bạn thử thay đổi điểm đi/đến hoặc ngày bay nhé!"
                )
        except requests.exceptions.ConnectionError:
            dispatcher.utter_message(
                text="Xin lỗi, hệ thống đang bảo trì. Vui lòng thử lại sau."
            )
        except Exception as e:
            print(f"[action_search_flights] Error: {e}")
            dispatcher.utter_message(
                text="Có lỗi xảy ra khi tìm chuyến bay. Vui lòng thử lại sau."
            )

        return []


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

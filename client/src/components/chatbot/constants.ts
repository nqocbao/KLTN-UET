import { Sparkles, Hotel, Plane, Bus, Utensils } from "lucide-react";

export const CATEGORIES = [
  {
    id: "itinerary",
    label: "Gợi ý lịch trình",
    icon: Sparkles,
    color: "text-purple-600",
    bg: "bg-purple-50 hover:bg-purple-100",
    activeBg: "bg-purple-600 text-white",
    quickReplies: [
      "Gợi ý lịch trình 3 ngày ở Đà Nẵng",
      "Tour Phú Quốc 4 ngày 3 đêm",
      "Kế hoạch du lịch Sapa cho 2 người",
      "Đi Hội An 2 ngày có gì hay?",
    ],
  },
  {
    id: "hotel",
    label: "Khách sạn",
    icon: Hotel,
    color: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100",
    activeBg: "bg-blue-600 text-white",
    quickReplies: [
      "Khách sạn 4 sao ở Đà Lạt",
      "Tìm khách sạn giá rẻ ở Nha Trang",
      "Khách sạn view biển Phú Quốc",
      "Resort ở Hội An dưới 2 triệu",
    ],
  },
  {
    id: "flight",
    label: "Vé máy bay",
    icon: Plane,
    color: "text-sky-600",
    bg: "bg-sky-50 hover:bg-sky-100",
    activeBg: "bg-sky-600 text-white",
    quickReplies: [
      "Chuyến bay Hà Nội đi Đà Nẵng",
      "Vé máy bay đi Phú Quốc tháng 4",
      "Bay từ TP.HCM đến Nha Trang",
      "Chuyến bay rẻ nhất đi Đà Lạt",
    ],
  },
  {
    id: "transfer",
    label: "Đưa đón sân bay",
    icon: Bus,
    color: "text-green-600",
    bg: "bg-green-50 hover:bg-green-100",
    activeBg: "bg-green-600 text-white",
    quickReplies: [
      "Đưa đón sân bay Nội Bài",
      "Xe từ sân bay Tân Sơn Nhất về trung tâm",
      "Giá đưa đón sân bay Đà Nẵng",
      "Thuê xe riêng từ sân bay",
    ],
  },
  {
    id: "foodtour",
    label: "Food Review",
    icon: Utensils,
    color: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100",
    activeBg: "bg-amber-600 text-white",
    quickReplies: [
      "Ăn gì ở Hà Nội",
      "Review bún chả ngon",
      "Quán ăn ngon ở Đà Nẵng",
      "Food tour Sài Gòn có gì hot",
    ],
  },
];

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

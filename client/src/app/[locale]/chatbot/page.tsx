/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  MapPin,
  Plane,
  Hotel,
  Bus,
  Star,
  Clock,
  Users,
  Wallet,
  Calendar,
  ChevronRight,
  RefreshCw,
  Navigation,
  Bot,
  Sparkles,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CardItem {
  name: string;
  image_url?: string;
  rating?: number;
  price_text?: string;
  available_rooms?: number;
  duration?: number;
  departure?: string;
  arrival?: string;
  dep_time?: string;
  arr_time?: string;
  duration_text?: string;
  airline?: string;
  stops?: number;
  tour_code?: string;
  description?: string;
  departure_dates?: string[];
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string[];
}

interface TripPackage {
  destination: string;
  duration_days?: number;
  tours: CardItem[];
  flights: CardItem[];
  hotels: CardItem[];
  itinerary?: ItineraryDay[];
  total_estimate?: string;
}

interface Message {
  id: string;
  text?: string;
  cards?: { type: string; items: CardItem[] };
  trip_package?: TripPackage;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ExtractedEntities {
  destination?: string;
  departure?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  budget?: string;
  duration?: number;
  flight_from?: string;
  flight_to?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
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
];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSenderId(): string {
  if (typeof window === "undefined") return "user_default";
  let id = localStorage.getItem("chatbot_sender_id");
  if (!id) {
    id = "user_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("chatbot_sender_id", id);
  }
  return id;
}

function renderMarkdown(text: string): React.ReactNode {
  return text.split("\n").map((line, lineIndex, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
    return (
      <span key={lineIndex}>
        {rendered}
        {lineIndex < arr.length - 1 && <br />}
      </span>
    );
  });
}

function extractEntitiesFromMessages(messages: Message[]): ExtractedEntities {
  const entities: ExtractedEntities = {};
  for (const msg of messages) {
    if (msg.sender !== "bot" || !msg.trip_package) continue;
    const pkg = msg.trip_package;
    if (pkg.destination) entities.destination = pkg.destination;
    if (pkg.duration_days) entities.duration = pkg.duration_days;
    if (pkg.flights[0]?.departure) entities.flight_from = pkg.flights[0].departure;
    if (pkg.flights[0]?.arrival) entities.flight_to = pkg.flights[0].arrival;
  }
  return entities;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function HotelCard({ item }: { item: CardItem }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex gap-3 p-3">
      {item.image_url && (
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {item.rating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-600">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              {item.rating}/5
            </span>
          )}
          {item.available_rooms !== undefined && (
            <span className="text-xs text-gray-500">
              {item.available_rooms > 0 ? `${item.available_rooms} phòng trống` : "Hết phòng"}
            </span>
          )}
        </div>
        {item.price_text && (
          <p className="text-sm font-bold text-blue-600 mt-1">
            Từ {item.price_text}/đêm
          </p>
        )}
      </div>
    </div>
  );
}

function TourCard({ item }: { item: CardItem }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {item.image_url && (
        <div className="h-32 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="p-3">
        <p className="font-semibold text-gray-800 text-sm leading-snug">{item.name}</p>
        {item.tour_code && (
          <p className="text-xs text-gray-400 mt-0.5">Mã: {item.tour_code}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {item.duration && (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> {item.duration} ngày
            </span>
          )}
          {item.rating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /> {item.rating}
            </span>
          )}
        </div>
        {item.price_text && (
          <p className="text-sm font-bold text-blue-600 mt-2">{item.price_text}/người</p>
        )}
        {item.departure_dates && item.departure_dates.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Ngày khởi hành gần nhất:</p>
            <div className="flex flex-wrap gap-1">
              {item.departure_dates.slice(0, 3).map((d, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {new Date(d).toLocaleDateString("vi-VN")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlightCard({ item }: { item: CardItem }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
            {item.airline && <p className="text-xs text-gray-400">{item.airline}</p>}
          </div>
        </div>
        {item.stops !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${item.stops === 0 ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
            {item.stops === 0 ? "Bay thẳng" : `${item.stops} điểm dừng`}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="text-center">
          <p className="font-bold text-gray-900">{item.dep_time || "--:--"}</p>
          <p className="text-xs text-gray-500">{item.departure}</p>
        </div>
        <div className="flex-1 flex flex-col items-center px-2">
          <p className="text-xs text-gray-400">{item.duration_text}</p>
          <div className="w-full flex items-center gap-1 my-0.5">
            <div className="flex-1 h-[1px] bg-gray-300" />
            <Plane className="w-3 h-3 text-gray-400" />
            <div className="flex-1 h-[1px] bg-gray-300" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900">{item.arr_time || "--:--"}</p>
          <p className="text-xs text-gray-500">{item.arrival}</p>
        </div>
      </div>
      {item.price_text && (
        <p className="text-sm font-bold text-blue-600 mt-2 text-right">{item.price_text}</p>
      )}
    </div>
  );
}

function TripPackageCard({ pkg }: { pkg: TripPackage }) {
  const [expandItinerary, setExpandItinerary] = useState(false);
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 overflow-hidden shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-base">Gợi ý lịch trình tổng thể</span>
        </div>
        <div className="flex gap-3 text-sm text-blue-100">
          {pkg.destination && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {pkg.destination}
            </span>
          )}
          {pkg.duration_days && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {pkg.duration_days} ngày
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tours */}
        {pkg.tours.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">
                Tour phù hợp ({pkg.tours.length})
              </span>
            </div>
            <div className="space-y-2">
              {pkg.tours.slice(0, 2).map((t, i) => (
                <TourCard key={i} item={t} />
              ))}
            </div>
          </section>
        )}

        {/* Flights */}
        {pkg.flights.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-gray-700">
                Chuyến bay gợi ý ({pkg.flights.length})
              </span>
            </div>
            <div className="space-y-2">
              {pkg.flights.slice(0, 2).map((f, i) => (
                <FlightCard key={i} item={f} />
              ))}
            </div>
          </section>
        )}

        {/* Hotels */}
        {pkg.hotels.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Hotel className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                Khách sạn tham khảo ({pkg.hotels.length})
              </span>
            </div>
            <div className="space-y-2">
              {pkg.hotels.slice(0, 2).map((h, i) => (
                <HotelCard key={i} item={h} />
              ))}
            </div>
          </section>
        )}

        {/* Itinerary */}
        {pkg.itinerary && pkg.itinerary.length > 0 && (
          <section>
            <button
              onClick={() => setExpandItinerary((v) => !v)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                Lịch trình chi tiết
              </span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${expandItinerary ? "rotate-90" : ""}`}
              />
            </button>
            {expandItinerary && (
              <div className="space-y-2">
                {pkg.itinerary.map((day) => (
                  <div key={day.day} className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs font-bold text-blue-600 mb-1">
                      Ngày {day.day}: {day.title}
                    </p>
                    <p className="text-xs text-gray-600">{day.description}</p>
                    {day.meals && day.meals.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        🍽️ {day.meals.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Total Cost */}
        {pkg.total_estimate && (
          <div className="bg-white rounded-xl p-3 border border-blue-100 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <Wallet className="w-4 h-4 text-green-600" />
              Tổng chi phí ước tính (1 người)
            </span>
            <span className="font-bold text-blue-700">{pkg.total_estimate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function WelcomeScreen({
  activeCategory,
  onCategorySelect,
  onQuickReply,
}: {
  activeCategory: string;
  onCategorySelect: (id: string) => void;
  onQuickReply: (text: string) => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === activeCategory);
  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-12 px-4 overflow-y-auto">
      {/* Greeting */}
      <div className="text-center mb-8 max-w-md">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Xin chào! 👋</h2>
        <p className="text-gray-500">Hôm nay tôi có thể làm gì để giúp bạn?</p>
      </div>

      {/* Category cards */}
      <div className="w-full max-w-xl mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
          Khách sạn &amp; Di chuyển
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${
                  isActive
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-transparent bg-white hover:bg-gray-50 shadow-sm"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "text-blue-600" : "text-gray-600"}`} />
                </div>
                <span className="text-xs font-medium text-center text-gray-700 leading-tight">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick questions */}
      {cat && (
        <div className="w-full max-w-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600">Có thể bạn muốn hỏi</p>
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-col gap-2">
            {cat.quickReplies.map((q, i) => (
              <button
                key={i}
                onClick={() => onQuickReply(q)}
                className="flex items-center justify-between w-full text-left bg-white hover:bg-blue-50 transition-colors rounded-xl px-4 py-3 text-sm text-gray-700 shadow-sm border border-gray-100 group"
              >
                <span>{q}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Entity Panel ─────────────────────────────────────────────────────────────

function EntityPanel({ entities }: { entities: ExtractedEntities }) {
  const hasAny = Object.values(entities).some(Boolean);
  if (!hasAny) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Kế hoạch của bạn
      </p>
      <div className="space-y-2">
        {entities.destination && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-gray-500">Điểm đến:</span>
            <span className="font-medium text-gray-800">{entities.destination}</span>
          </div>
        )}
        {(entities.flight_from || entities.departure) && (
          <div className="flex items-center gap-2 text-sm">
            <Plane className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span className="text-gray-500">Từ:</span>
            <span className="font-medium text-gray-800">{entities.flight_from || entities.departure}</span>
          </div>
        )}
        {entities.check_in && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-500">Ngày đi:</span>
            <span className="font-medium text-gray-800">{entities.check_in}</span>
          </div>
        )}
        {entities.duration && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span className="text-gray-500">Số ngày:</span>
            <span className="font-medium text-gray-800">{entities.duration} ngày</span>
          </div>
        )}
        {entities.guests && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-gray-500">Số người:</span>
            <span className="font-medium text-gray-800">{entities.guests}</span>
          </div>
        )}
        {entities.budget && (
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-500">Ngân sách:</span>
            <span className="font-medium text-gray-800">{entities.budget}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatbotPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "vi";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("itinerary");
  const [senderId] = useState<string>(getSenderId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const extractedEntities = extractEntitiesFromMessages(messages);

  const sendMessage = useCallback(
    async (messageText?: string) => {
      const textToSend = messageText || inputMessage.trim();
      if (!textToSend || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        text: textToSend,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputMessage("");
      setIsLoading(true);

      try {
        // Determine which endpoint to use based on active category
        const endpoint =
          activeCategory === "itinerary"
            ? `${API_URL}/chatbot/recommend`
            : `${API_URL}/chatbot/message`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: textToSend,
            sender: senderId,
            category: activeCategory,
          }),
        });

        if (!response.ok) throw new Error("API error");

        const data = await response.json();

        // Handle itinerary recommendation response
        if (activeCategory === "itinerary" && data.trip_package) {
          const intro: Message = {
            id: Date.now().toString() + "_intro",
            text: data.text || "Đây là gợi ý lịch trình của tôi cho bạn:",
            sender: "bot",
            timestamp: new Date(),
          };
          const pkgMsg: Message = {
            id: Date.now().toString() + "_pkg",
            trip_package: data.trip_package,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, intro, pkgMsg]);
        } else if (Array.isArray(data) && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const botMessages: Message[] = data.map((msg: Record<string, any>, i: number) => {
            if (msg.custom?.type && Array.isArray(msg.custom?.items)) {
              return {
                id: Date.now().toString() + i,
                cards: { type: msg.custom.type, items: msg.custom.items },
                sender: "bot" as const,
                timestamp: new Date(),
              };
            }
            return {
              id: Date.now().toString() + i,
              text: msg.text || msg.custom?.text || "Xin lỗi, tôi không hiểu.",
              sender: "bot" as const,
              timestamp: new Date(),
            };
          });
          setMessages((prev) => [...prev, ...botMessages]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text:
                data.text ||
                "Xin lỗi, tôi chưa hiểu yêu cầu. Bạn thử diễn đạt khác nhé!",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "Xin lỗi, không thể kết nối đến hệ thống. Vui lòng thử lại sau.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [activeCategory, inputMessage, isLoading, senderId]
  );

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    if (messages.length > 0) {
      const catLabel = CATEGORIES.find((c) => c.id === id)?.label || id;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_sys",
          text: `[Đã chuyển sang chủ đề: ${catLabel}]`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm z-10">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Trợ lý lịch trình VivuTravel
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400">Trực tuyến</span>
            </div>
          </div>
        </div>

        {/* Sidebar toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-gray-500" />
          ) : (
            <Sparkles className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } lg:flex flex-col w-full lg:w-72 xl:w-80 bg-white border-r border-gray-100 p-4 overflow-y-auto flex-shrink-0 z-10 absolute lg:relative inset-0 lg:inset-auto`}
        >
          {/* Category selection */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Chủ đề
            </p>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategorySelect(cat.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extracted entity panel */}
          <EntityPanel entities={extractedEntities} />

          {/* Quick questions */}
          {(() => {
            const cat = CATEGORIES.find((c) => c.id === activeCategory);
            if (!cat) return null;
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Gợi ý câu hỏi
                  </p>
                </div>
                <div className="space-y-1.5">
                  {cat.quickReplies.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSidebarOpen(false);
                        sendMessage(q);
                      }}
                      className="flex items-center justify-between w-full text-left text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg px-3 py-2 group"
                    >
                      <span className="leading-snug">{q}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-400 flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </aside>

        {/* Chat area */}
        <main className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {!hasMessages ? (
              <WelcomeScreen
                activeCategory={activeCategory}
                onCategorySelect={handleCategorySelect}
                onQuickReply={(text) => {
                  setSidebarOpen(false);
                  sendMessage(text);
                }}
              />
            ) : (
              <div className="max-w-2xl mx-auto space-y-4 pb-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Bot avatar */}
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] ${
                        message.sender === "user" ? "items-end" : "items-start"
                      } flex flex-col gap-1`}
                    >
                      {/* Trip package card */}
                      {message.trip_package && (
                        <TripPackageCard pkg={message.trip_package} />
                      )}

                      {/* Card list */}
                      {message.cards && (
                        <div className="w-full space-y-2">
                          {message.cards.type === "hotel_cards" &&
                            message.cards.items.map((item, i) => (
                              <HotelCard key={i} item={item} />
                            ))}
                          {message.cards.type === "tour_cards" &&
                            message.cards.items.map((item, i) => (
                              <TourCard key={i} item={item} />
                            ))}
                          {message.cards.type === "flight_cards" &&
                            message.cards.items.map((item, i) => (
                              <FlightCard key={i} item={item} />
                            ))}
                        </div>
                      )}

                      {/* Text message */}
                      {message.text && (
                        <div
                          className={`rounded-2xl text-sm px-4 py-3 shadow-sm ${
                            message.sender === "user"
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                          } ${
                            message.text.startsWith("[") && message.text.endsWith("]")
                              ? "text-xs italic opacity-60 bg-gray-100 text-gray-500 border-0 shadow-none"
                              : ""
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {renderMarkdown(message.text)}
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <span className="text-[10px] text-gray-400 px-1">
                        {message.timestamp.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex gap-1 items-center h-5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  activeCategory === "itinerary"
                    ? "Hãy mô tả chuyến đi bạn mong muốn..."
                    : "Hãy mô tả câu hỏi trong một câu..."
                }
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:opacity-60 transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
                aria-label="Gửi"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

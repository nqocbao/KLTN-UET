"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { FlightSearchHeader } from "@/components/flights/FlightSearchHeader";
import { FlightSearchSidebar } from "@/components/flights/FlightSearchSidebar";
import { FlightSearchCard, type Flight } from "@/components/flights/FlightSearchCard";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, Plane, RefreshCcw } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface TransportFromBE {
  _id: string;
  service_name: string;
  vehicle_type?: string;
  image?: string;
  departure_location?: string;
  arrival_location?: string;
  departure_time?: string;
  arrival_time?: string;
  duration: string;
  price: number;
  stops?: number;
  amenities?: string[];
  flight_date?: string;
  fetched_at?: string;
}

interface SearchMeta {
  inserted: number;
  updated: number;
  fetched_from_api: number;
  fallback?: boolean;
  error?: string;
}

function extractIATA(location?: string): string {
  if (!location) return "???";
  const match = location.match(/\(([A-Z]{3})\)/);
  return match ? match[1] : location.slice(0, 3).toUpperCase();
}

function formatVND(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price) + " VND";
}

function mapToFlight(t: TransportFromBE, index: number): Flight {
  return {
    id: t._id,
    airline: t.service_name,
    logo: t.image || "",
    flightNumber: t.vehicle_type || "",
    departureTime: t.departure_time || "--:--",
    departureAirport: extractIATA(t.departure_location),
    arrivalTime: t.arrival_time || "--:--",
    arrivalAirport: extractIATA(t.arrival_location),
    duration: t.duration,
    type: (t.stops ?? 0) === 0 ? "Bay thẳng" : "1 điểm dừng",
    price: formatVND(t.price),
    isBest: index === 0,
    tags: t.amenities?.filter(a => !a.toLowerCase().startsWith("carbon")).slice(0, 1) ?? [],
  };
}

function toYMD(dateStr: string | null): string {
  if (!dateStr) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }
  return dateStr.split("T")[0];
}

export default function FlightSearchPage() {
  const searchParams = useSearchParams();

  const from   = searchParams.get("from") || "SGN";
  const to     = searchParams.get("to")   || "HAN";
  const date   = toYMD(searchParams.get("date"));
  const adults = searchParams.get("passengers") || "1";

  const [flights, setFlights] = useState<Flight[]>([]);
  const [meta, setMeta]       = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/client/flights/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&adults=${adults}`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setFlights((json.data as TransportFromBE[]).map(mapToFlight));
      setMeta(json.meta ?? null);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu chuyến bay");
    } finally {
      setLoading(false);
    }
  }, [from, to, date, adults]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const minPrice = flights.length
    ? Math.min(...flights.map(f => parseInt(f.price.replace(/[^\d]/g, ""))))
    : 0;
  const shortestFlight = flights.length
    ? flights.reduce((a, b) => (a.duration < b.duration ? a : b))
    : null;

  const bestFlight   = flights.find(f => f.isBest);
  const otherFlights = flights.filter(f => !f.isBest);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="blue" />

      <div className="pt-[104px]">
        <FlightSearchHeader />
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-[280px] shrink-0">
            <FlightSearchSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button variant="outline" className="rounded-full h-8 text-xs font-medium border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                <span className="mr-1">✈️</span> Bay thẳng
              </Button>
              <Button variant="outline" className="rounded-full h-8 text-xs font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                🌙 Bay đêm
              </Button>
              <Button variant="outline" className="rounded-full h-8 text-xs font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                ☀️ Bay sáng
              </Button>
            </div>

            {/* Sort Bar - chỉ hiện khi có data */}
            {!loading && flights.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex">
                  <div className="flex-1 border-r border-gray-100">
                    <Button variant="ghost" className="w-full h-16 flex flex-col items-start justify-center px-4 gap-0.5 rounded-none border-b-2 border-blue-600 bg-blue-50/30">
                      <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Giá thấp nhất</span>
                      <span className="text-sm font-bold text-gray-900">{formatVND(minPrice)}</span>
                    </Button>
                  </div>
                  {shortestFlight && (
                    <div className="flex-1">
                      <Button variant="ghost" className="w-full h-16 flex flex-col items-start justify-center px-4 gap-0.5 rounded-none hover:bg-gray-50">
                        <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Bay ngắn nhất</span>
                        <span className="text-sm font-bold text-gray-900">{shortestFlight.duration}</span>
                        <span className="text-[10px] text-gray-400">{shortestFlight.price}</span>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="w-full md:w-[200px]">
                  <Button variant="outline" className="w-full h-16 bg-white border-gray-200 flex items-center justify-between px-4 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                      <div className="text-left">
                        <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Sắp xếp</div>
                        <div className="text-sm text-gray-900 font-bold">Giá thấp → cao</div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-blue-600 font-medium bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>Đang tìm kiếm chuyến bay <strong>{from} → {to}</strong> ngày <strong>{date}</strong>...</span>
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-32 h-10 bg-gray-200 rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                      <div className="w-24 h-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center space-y-3">
                <Plane className="w-10 h-10 text-red-300 mx-auto" />
                <p className="text-red-600 font-semibold">{error}</p>
                <Button onClick={fetchFlights} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Thử lại
                </Button>
              </div>
            )}

            {!loading && !error && flights.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-3">
                <Plane className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-600 font-medium">Không tìm thấy chuyến bay {from} → {to} ngày {date}</p>
                <p className="text-sm text-gray-400">Thử chọn ngày khác hoặc route khác</p>
              </div>
            )}

            {!loading && !error && flights.length > 0 && (
              <div className="space-y-6">
                {meta && (
                  <div className="text-xs text-gray-400 flex gap-4 flex-wrap">
                    <span>Tìm thấy <strong className="text-gray-700">{flights.length}</strong> chuyến bay</span>
                    {meta.inserted > 0 && <span className="text-green-600">+{meta.inserted} chuyến mới</span>}
                    {meta.updated > 0 && <span className="text-blue-600">↻ {meta.updated} cập nhật giá</span>}
                    {meta.fallback && <span className="text-orange-500">⚠ Hiển thị dữ liệu cache (API tạm không khả dụng)</span>}
                  </div>
                )}

                {bestFlight && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Chuyến bay tốt nhất</h3>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#ff5e1f] text-white px-2 py-0.5 rounded text-[10px] font-bold">BEST</div>
                        <span className="font-bold text-red-600">Giá rẻ nhất cho route này</span>
                      </div>
                      <div className="text-gray-400 text-xs">{date}</div>
                    </div>
                    <FlightSearchCard flight={bestFlight} />
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Tất cả chuyến bay ({otherFlights.length})</h3>
                  <div className="space-y-4">
                    {otherFlights.map(flight => (
                      <FlightSearchCard key={flight.id} flight={flight} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Users,
  Search,
  Plane,
  ArrowRightLeft,
  ChevronDown,
  X,
  Minus,
  Plus,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AirportAutocomplete } from "@/components/ui/airport-autocomplete";
import { DatePicker } from "@/components/ui/date-picker";

export function FlightSearchHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelRef = useRef<HTMLDivElement>(null);

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : new Date()
  );
  const [passengers, setPassengers] = useState(
    parseInt(searchParams.get("passengers") || "1")
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const f = searchParams.get("from");
    const t = searchParams.get("to");
    const d = searchParams.get("date");
    const p = searchParams.get("passengers");

    if (f) setFrom(f);
    if (t) setTo(t);
    if (d) setDepartureDate(new Date(d));
    if (p) setPassengers(parseInt(p));
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    if (expanded) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (departureDate)
      params.set("date", departureDate.toISOString().split("T")[0]);
    params.set("passengers", passengers.toString());

    const sortBy = searchParams.get("sortBy");
    if (sortBy) params.set("sortBy", sortBy);

    router.push(`/vi/flights/search?${params.toString()}`);
    router.refresh();
    setExpanded(false);
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="bg-gradient-to-r from-[#003580] to-[#0071c2] py-3 shadow-md">
      <div className="container mx-auto px-4" ref={panelRef}>
        {/* Summary Bar */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 shrink-0 rounded-full h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div
            className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 cursor-pointer hover:shadow-lg transition-shadow group"
            onClick={() => setExpanded(!expanded)}
          >
            <Plane className="w-4 h-4 text-blue-600 shrink-0" />

            <div className="flex flex-1 items-center gap-2 min-w-0 flex-wrap">
              <span className="font-bold text-gray-900 truncate">
                {from || "---"}
              </span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-bold text-gray-900 truncate">
                {to || "---"}
              </span>

              <span className="hidden sm:inline w-px h-4 bg-gray-200" />
              <span className="hidden sm:flex text-sm text-gray-500 items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {departureDate?.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>

              <span className="hidden sm:inline w-px h-4 bg-gray-200" />
              <span className="hidden sm:flex text-sm text-gray-500 items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {passengers}
              </span>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Expandable Search Panel */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            expanded
              ? "max-h-[500px] opacity-100 mt-3 overflow-visible"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                Chỉnh sửa tìm kiếm
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* From / Swap / To */}
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-1 min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Điểm đi
                </label>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                  <AirportAutocomplete
                    value={from}
                    onChange={setFrom}
                    placeholder="Sân bay đi..."
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={swapLocations}
                className="rounded-full h-10 w-10 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shrink-0 mb-px transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1 min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Điểm đến
                </label>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 rotate-90 pointer-events-none" />
                  <AirportAutocomplete
                    value={to}
                    onChange={setTo}
                    placeholder="Sân bay đến..."
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Date + Passengers + Search */}
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Ngày bay
                </label>
                <DatePicker
                  date={departureDate}
                  onSelect={setDepartureDate}
                  placeholder="Chọn ngày..."
                />
              </div>

              <div className="w-full sm:w-[160px]">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Hành khách
                </label>
                <div className="flex items-center h-10 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="h-full px-3 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-30"
                    disabled={passengers <= 1}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold text-gray-800">
                    {passengers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.min(9, passengers + 1))}
                    className="h-full px-3 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-30"
                    disabled={passengers >= 9}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full sm:w-auto h-10 px-8 bg-[#0071c2] hover:bg-[#005fa3] text-white font-bold rounded-lg shadow-sm transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

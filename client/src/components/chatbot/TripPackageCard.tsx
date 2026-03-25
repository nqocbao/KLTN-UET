"use client";

import { useState } from "react";
import {
  MapPin,
  Plane,
  Hotel,
  Clock,
  Calendar,
  ChevronRight,
  Navigation,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { TripPackage } from "./types";
import { TourCard } from "./TourCard";
import { FlightCard } from "./FlightCard";
import { HotelCard } from "./HotelCard";

export function TripPackageCard({ pkg }: { pkg: TripPackage }) {
  const [expandItinerary, setExpandItinerary] = useState(false);
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 overflow-hidden shadow-md">
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

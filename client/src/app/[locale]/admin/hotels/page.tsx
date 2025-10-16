"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const mockHotels = [
  {
    id: 1,
    name: "Grand Luxury Hotel",
    location: "Hanoi, Vietnam",
    rating: 4.8,
    rooms: 120,
    priceRange: "$150-300",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    image: "🏨",
    status: "active",
  },
  {
    id: 2,
    name: "Beachfront Resort",
    location: "Da Nang, Vietnam",
    rating: 4.9,
    rooms: 200,
    priceRange: "$200-450",
    amenities: ["Beach", "WiFi", "Pool", "Bar"],
    image: "🏖️",
    status: "active",
  },
  {
    id: 3,
    name: "Mountain View Lodge",
    location: "Sapa, Vietnam",
    rating: 4.6,
    rooms: 50,
    priceRange: "$80-180",
    amenities: ["WiFi", "Restaurant", "Parking"],
    image: "⛰️",
    status: "active",
  },
  {
    id: 4,
    name: "City Center Hotel",
    location: "Ho Chi Minh, Vietnam",
    rating: 4.7,
    rooms: 150,
    priceRange: "$100-250",
    amenities: ["WiFi", "Gym", "Restaurant", "Bar"],
    image: "🏙️",
    status: "active",
  },
];

export default function HotelsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslations("hotels");
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage hotel partnerships and accommodations
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>➕</span>
          {t("addNew")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={tCommon("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>{t("location")}</option>
            <option>Hanoi</option>
            <option>Da Nang</option>
            <option>Ho Chi Minh</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>{t("rating")}</option>
            <option>5 stars</option>
            <option>4 stars</option>
            <option>3 stars</option>
          </select>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="flex">
              {/* Image Section */}
              <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-6xl flex-shrink-0">
                {hotel.image}
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {hotel.name}
                  </h3>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    {hotel.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  📍 {hotel.location}
                </p>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {hotel.rating}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    🛏️ {hotel.rooms} {t("rooms")}
                  </div>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {hotel.priceRange}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                    {tCommon("edit")}
                  </button>
                  <button className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm">
                    {tCommon("delete")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Hotels
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockHotels.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl">
              🏨
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Rooms
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                520
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl">
              🛏️
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Avg Rating
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                4.75
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-2xl">
              ⭐
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Partnerships
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                48
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl">
              🤝
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

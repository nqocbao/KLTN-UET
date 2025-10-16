"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const mockRestaurants = [
  {
    id: 1,
    name: "Pho House",
    cuisine: "Vietnamese",
    rating: 4.7,
    priceLevel: "$$",
    location: "Hanoi",
    specialties: ["Pho", "Bun Cha", "Spring Rolls"],
    image: "🍜",
    status: "active",
  },
  {
    id: 2,
    name: "Seafood Paradise",
    cuisine: "Seafood",
    rating: 4.8,
    priceLevel: "$$$",
    location: "Da Nang",
    specialties: ["Grilled Fish", "Prawns", "Crab"],
    image: "🦞",
    status: "active",
  },
  {
    id: 3,
    name: "Mountain Cafe",
    cuisine: "International",
    rating: 4.5,
    priceLevel: "$",
    location: "Sapa",
    specialties: ["Coffee", "Pancakes", "Pasta"],
    image: "☕",
    status: "active",
  },
  {
    id: 4,
    name: "BBQ Garden",
    cuisine: "Korean BBQ",
    rating: 4.6,
    priceLevel: "$$",
    location: "Ho Chi Minh",
    specialties: ["Bulgogi", "Bibimbap", "Kimchi"],
    image: "🥩",
    status: "active",
  },
  {
    id: 5,
    name: "Sushi Master",
    cuisine: "Japanese",
    rating: 4.9,
    priceLevel: "$$$",
    location: "Hanoi",
    specialties: ["Sushi", "Sashimi", "Ramen"],
    image: "🍣",
    status: "active",
  },
  {
    id: 6,
    name: "Street Food Hub",
    cuisine: "Street Food",
    rating: 4.4,
    priceLevel: "$",
    location: "Ho Chi Minh",
    specialties: ["Banh Mi", "Banh Xeo", "Che"],
    image: "🥖",
    status: "active",
  },
];

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const t = useTranslations("restaurants");
  const tCommon = useTranslations("common");

  const cuisines = [
    "All",
    "Vietnamese",
    "Seafood",
    "International",
    "Korean BBQ",
    "Japanese",
    "Street Food",
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage restaurant partners and dining options
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>➕</span>
          {t("addNew")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
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
              <option>{t("priceLevel")}</option>
              <option>$ - Budget</option>
              <option>$$ - Moderate</option>
              <option>$$$ - Expensive</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>{t("rating")}</option>
              <option>4.5+ stars</option>
              <option>4.0+ stars</option>
              <option>3.5+ stars</option>
            </select>
          </div>

          {/* Cuisine Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCuisine === cuisine.toLowerCase()
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
          >
            {/* Header with Image */}
            <div className="relative h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-7xl">
              {restaurant.image}
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/90 text-gray-800">
                  {restaurant.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {restaurant.name}
                </h3>
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {restaurant.priceLevel}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                  {restaurant.cuisine}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  📍 {restaurant.location}
                </span>
              </div>

              <div className="flex items-center gap-1 mb-3">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {restaurant.rating}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  / 5.0
                </span>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Specialties:
                </p>
                <div className="flex flex-wrap gap-1">
                  {restaurant.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium">
                  View Menu
                </button>
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                  {tCommon("edit")}
                </button>
                <button className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🍽️</div>
          <div className="text-2xl font-bold mb-1">
            {mockRestaurants.length}
          </div>
          <div className="text-orange-100 text-sm">Total Restaurants</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold mb-1">4.65</div>
          <div className="text-yellow-100 text-sm">Average Rating</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🍜</div>
          <div className="text-2xl font-bold mb-1">{cuisines.length - 1}</div>
          <div className="text-green-100 text-sm">Cuisine Types</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">📍</div>
          <div className="text-2xl font-bold mb-1">4</div>
          <div className="text-blue-100 text-sm">Cities</div>
        </div>
      </div>
    </div>
  );
}

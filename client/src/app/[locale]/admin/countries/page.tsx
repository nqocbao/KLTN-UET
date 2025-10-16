"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const mockCountries = [
  {
    id: 1,
    name: "Vietnam",
    code: "VN",
    continent: "Asia",
    currency: "VND",
    language: "Vietnamese",
    flag: "🇻🇳",
    destinations: 24,
    tours: 156,
    hotels: 89,
    status: "active",
  },
  {
    id: 2,
    name: "Japan",
    code: "JP",
    continent: "Asia",
    currency: "JPY",
    language: "Japanese",
    flag: "🇯🇵",
    destinations: 18,
    tours: 134,
    hotels: 76,
    status: "active",
  },
  {
    id: 3,
    name: "Thailand",
    code: "TH",
    continent: "Asia",
    currency: "THB",
    language: "Thai",
    flag: "🇹🇭",
    destinations: 22,
    tours: 145,
    hotels: 92,
    status: "active",
  },
  {
    id: 4,
    name: "Indonesia",
    code: "ID",
    continent: "Asia",
    currency: "IDR",
    language: "Indonesian",
    flag: "🇮🇩",
    destinations: 16,
    tours: 98,
    hotels: 67,
    status: "active",
  },
  {
    id: 5,
    name: "France",
    code: "FR",
    continent: "Europe",
    currency: "EUR",
    language: "French",
    flag: "🇫🇷",
    destinations: 15,
    tours: 87,
    hotels: 54,
    status: "active",
  },
  {
    id: 6,
    name: "Italy",
    code: "IT",
    continent: "Europe",
    currency: "EUR",
    language: "Italian",
    flag: "🇮🇹",
    destinations: 14,
    tours: 79,
    hotels: 48,
    status: "active",
  },
];

export default function CountriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("all");
  const t = useTranslations("countries");
  const tCommon = useTranslations("common");

  const continents = ["All", "Asia", "Europe", "America", "Africa", "Oceania"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage countries and regions for travel services
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
              <option>{t("currency")}</option>
              <option>VND</option>
              <option>USD</option>
              <option>EUR</option>
              <option>JPY</option>
            </select>
          </div>

          {/* Continent Filter */}
          <div className="flex flex-wrap gap-2">
            {continents.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedContinent === continent.toLowerCase()
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {continent}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCountries.map((country) => (
          <div
            key={country.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
          >
            {/* Header */}
            <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-8xl">{country.flag}</div>
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/90 text-gray-800">
                  {country.code}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {country.name}
                </h3>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  {country.status}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t("continent")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {country.continent}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t("currency")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {country.currency}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Language
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {country.language}
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">🌍</div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {country.destinations}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Destinations
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">✈️</div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {country.tours}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tours
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🏨</div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {country.hotels}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hotels
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium">
                  View Details
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

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🌏</div>
          <div className="text-2xl font-bold mb-1">{mockCountries.length}</div>
          <div className="text-blue-100 text-sm">Total Countries</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🌍</div>
          <div className="text-2xl font-bold mb-1">109</div>
          <div className="text-green-100 text-sm">Destinations</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">✈️</div>
          <div className="text-2xl font-bold mb-1">699</div>
          <div className="text-purple-100 text-sm">Tours Available</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🏨</div>
          <div className="text-2xl font-bold mb-1">426</div>
          <div className="text-orange-100 text-sm">Hotels</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🗺️</div>
          <div className="text-2xl font-bold mb-1">3</div>
          <div className="text-pink-100 text-sm">Continents</div>
        </div>
      </div>
    </div>
  );
}

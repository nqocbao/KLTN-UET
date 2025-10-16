"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const mockDestinations = [
  {
    id: 1,
    name: "Hạ Long Bay",
    country: "Vietnam",
    description: "UNESCO World Heritage Site with stunning limestone karsts",
    popularity: 95,
    image: "🏝️",
    tours: 45,
    status: "active",
  },
  {
    id: 2,
    name: "Bali",
    country: "Indonesia",
    description: "Tropical paradise with beautiful beaches and temples",
    popularity: 92,
    image: "🌴",
    tours: 67,
    status: "active",
  },
  {
    id: 3,
    name: "Sapa",
    country: "Vietnam",
    description: "Mountainous region with rice terraces and ethnic villages",
    popularity: 88,
    image: "⛰️",
    tours: 34,
    status: "active",
  },
  {
    id: 4,
    name: "Tokyo",
    country: "Japan",
    description: "Modern metropolis blending tradition and technology",
    popularity: 96,
    image: "🏯",
    tours: 89,
    status: "active",
  },
];

export default function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const t = useTranslations("destinations");
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
            Manage travel destinations and attractions
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>➕</span>
          {t("addNew")}
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder={tCommon("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>{t("country")}</option>
              <option>Vietnam</option>
              <option>Indonesia</option>
              <option>Japan</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>{t("popularity")}</option>
              <option>High (90+)</option>
              <option>Medium (70-90)</option>
              <option>Low (&lt;70)</option>
            </select>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                ▦
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockDestinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl">
                {dest.image}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dest.name}
                  </h3>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    {dest.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  📍 {dest.country}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {dest.description}
                </p>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>{t("popularity")}</span>
                      <span>{dest.popularity}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: `${dest.popularity}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ✈️ {dest.tours} tours
                  </span>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm">
                      {tCommon("edit")}
                    </button>
                    <button className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm">
                      {tCommon("delete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("name")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("country")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("description")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("popularity")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {tCommon("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockDestinations.map((dest) => (
                  <tr
                    key={dest.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{dest.image}</span>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {dest.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {dest.country}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {dest.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{ width: `${dest.popularity}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {dest.popularity}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {dest.tours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 mr-3">
                        {tCommon("edit")}
                      </button>
                      <button className="text-red-600 hover:text-red-800 dark:text-red-400">
                        {tCommon("delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🌍</div>
          <div className="text-2xl font-bold mb-1">
            {mockDestinations.length}
          </div>
          <div className="text-blue-100 text-sm">Total Destinations</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">✈️</div>
          <div className="text-2xl font-bold mb-1">235</div>
          <div className="text-green-100 text-sm">Total Tours</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold mb-1">92.8%</div>
          <div className="text-purple-100 text-sm">Avg Popularity</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold mb-1">12</div>
          <div className="text-orange-100 text-sm">Featured</div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { restaurantsApi } from "@/lib/services";
import type { Restaurant } from "@/types/api";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations("restaurants");
  const tCommon = useTranslations("common");

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantsApi.getAll({
        page: currentPage,
        limit: 10,
      });

      if (response.success) {
        setRestaurants(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Failed to load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return;

    try {
      await restaurantsApi.delete(id);
      fetchRestaurants();
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      alert("Failed to delete restaurant. Please try again.");
    }
  };

  const cuisines = [
    "All",
    "Vietnamese",
    "Seafood",
    "International",
    "Korean BBQ",
    "Japanese",
    "Street Food",
  ];

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{tCommon("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

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
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
          >
            {/* Header with Image */}
            <div className="relative h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-7xl">
              🍽️
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {restaurant.name}
                </h3>
              </div>

              {restaurant.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {restaurant.description}
                </p>
              )}

              {restaurant.location && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    📍 {restaurant.location}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium">
                  View
                </button>
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                  {tCommon("edit")}
                </button>
                <button 
                  onClick={() => handleDelete(restaurant._id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🍽️</div>
          <div className="text-2xl font-bold mb-1">{restaurants.length}</div>
          <div className="text-orange-100 text-sm">Total Restaurants</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold mb-1">
            {filteredRestaurants.length}
          </div>
          <div className="text-yellow-100 text-sm">Filtered Results</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">📄</div>
          <div className="text-2xl font-bold mb-1">{totalPages}</div>
          <div className="text-green-100 text-sm">Total Pages</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">📍</div>
          <div className="text-2xl font-bold mb-1">{currentPage}</div>
          <div className="text-blue-100 text-sm">Current Page</div>
        </div>
      </div>
    </div>
  );
}

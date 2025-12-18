"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { destinationsApi } from "@/lib/services";
import type { Destination } from "@/types/api";
import { DestinationDialog } from "@/components/admin/modals/DestinationDialog";
import { DeleteConfirmDialog } from "@/components/admin/modals/DeleteConfirmDialog";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countries, setCountries] = useState<any[]>([]);
  const t = useTranslations("destinations");
  const tCommon = useTranslations("common");

  // Fetch destinations from API
  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await destinationsApi.getAll({
        page: currentPage,
        limit: 12,
      });

      if (response.success) {
        setDestinations(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError("Failed to load destinations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  useEffect(() => {
    import("@/lib/services").then(({ countriesApi }) => {
      countriesApi.getAll({ limit: 1000 }).then((res) => {
        if (res.success) setCountries(res.data);
      });
    });
  }, []);

  // Handle delete destination
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await destinationsApi.delete(deletingId);
      fetchDestinations();
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting destination:", err);
      alert("Failed to delete destination. Please try again.");
    }
  };

  // Handle save destination
  const handleSave = async (data: any) => {
    try {
      if (editingDestination) {
        await destinationsApi.update(editingDestination._id, data);
      } else {
        await destinationsApi.create(data);
      }
      fetchDestinations();
    } catch (err) {
      console.error("Error saving destination:", err);
      alert("Failed to save destination. Please try again.");
    }
  };

  // Filter logic
  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = dest.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || (dest as any).country_id?._id === selectedCountry;
    return matchesSearch && matchesCountry;
  });

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
            Manage travel destinations and attractions
          </p>
        </div>
        <button 
          onClick={() => { setEditingDestination(null); setDialogOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
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
          <div className="w-full md:w-64">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country._id} value={country._id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
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

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((dest) => (
            <div
              key={dest._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {(dest as any).banner_url ? (
                  <img 
                    src={(dest as any).banner_url} 
                    alt={dest.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🏝️</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dest.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  📍 {(dest as any).country_id?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {dest.description}
                </p>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => { setEditingDestination(dest); setDialogOpen(true); }}
                    className="flex-1 px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => { setDeletingId(dest._id); setDeleteDialogOpen(true); }}
                    className="flex-1 px-3 py-1.5 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {tCommon("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDestinations.map((dest) => (
                <tr
                  key={dest._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {dest.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {(dest as any).country_id?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {dest.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => { setEditingDestination(dest); setDialogOpen(true); }}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                    >
                      {tCommon("edit")}
                    </button>
                    <button
                      onClick={() => { setDeletingId(dest._id); setDeleteDialogOpen(true); }}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      {tCommon("delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDestinations.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {tCommon("noDataFound")}
          </p>
        </div>
      )}

      <DestinationDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} destination={editingDestination} />
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} title="Delete Destination" description="Are you sure you want to delete this destination? This action cannot be undone." />
    </div>
  );
}

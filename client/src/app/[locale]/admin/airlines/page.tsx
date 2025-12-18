"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { airlinesApi, type Airline } from "@/lib/services/other.service";
import { AirlineDialog } from "@/components/admin/modals/AirlineDialog";
import { DeleteConfirmDialog } from "@/components/admin/modals/DeleteConfirmDialog";

export default function AirlinesPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = useTranslations("airlines");
  const tCommon = useTranslations("common");

  const fetchAirlines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await airlinesApi.getAll({
        page: currentPage,
        limit: 9,
      });

      if (response.success) {
        setAirlines(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching airlines:", err);
      setError("Failed to load airlines. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchAirlines();
  }, [fetchAirlines]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await airlinesApi.delete(deletingId);
      fetchAirlines();
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting airline:", err);
      alert("Failed to delete airline. Please try again.");
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingAirline) {
        await airlinesApi.update(editingAirline._id, data);
      } else {
        await airlinesApi.create(data);
      }
      fetchAirlines();
    } catch (err) {
      console.error("Error saving airline:", err);
      alert("Failed to save airline. Please try again.");
    }
  };

  const filteredAirlines = airlines.filter((airline) =>
    airline.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Manage airline companies and their information
          </p>
        </div>
        <button onClick={() => { setEditingAirline(null); setDialogOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
            <option>{t("country")}</option>
            <option>Vietnam</option>
            <option>Thailand</option>
            <option>Singapore</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {tCommon("filter")}
          </button>
        </div>
      </div>

      {/* Airlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAirlines.map((airline) => (
          <div
            key={airline._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                ✈️
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {airline.name}
            </h3>
            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Code: {airline.code}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Country: {airline.country}
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => { setEditingAirline(airline); setDialogOpen(true); }} className="flex-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                {tCommon("edit")}
              </button>
              <button
                onClick={() => { setDeletingId(airline._id); setDeleteDialogOpen(true); }}
                className="flex-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {tCommon("delete")}
              </button>
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

      <AirlineDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} airline={editingAirline} />
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} title="Delete Airline" description="Are you sure you want to delete this airline? This action cannot be undone." />
    </div>
  );
}

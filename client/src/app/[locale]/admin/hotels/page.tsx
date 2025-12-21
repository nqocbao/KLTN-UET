"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { hotelsApi } from "@/lib/services";
import type { Hotel } from "@/types/api";
import { HotelDialog } from "@/components/admin/modals/HotelDialog";
import { DeleteConfirmDialog } from "@/components/admin/modals/DeleteConfirmDialog";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = useTranslations("hotels");
  const tCommon = useTranslations("common");

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hotelsApi.getAll({
        page: currentPage,
        limit: 10,
      });

      if (response.success) {
        setHotels(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError("Failed to load hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await hotelsApi.delete(deletingId);
      fetchHotels();
      setDeletingId(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting hotel:", err);
      alert("Failed to delete hotel. Please try again.");
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingHotel) {
        await hotelsApi.update(editingHotel._id, data);
      } else {
        await hotelsApi.create(data);
      }
      fetchHotels();
    } catch (err) {
      console.error("Error saving hotel:", err);
      alert("Failed to save hotel. Please try again.");
    }
  };

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // console.log("day ne=>>>>>>>>>>",hotels, "    ", filteredHotels)

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
            Manage hotel partnerships and accommodations
          </p>
        </div>
        <button 
          onClick={() => { setEditingHotel(null); setDialogOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          {t("addNew")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <input
          type="text"
          placeholder={tCommon("search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="flex">
              {/* Image Section */}
              <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-6xl flex-shrink-0 overflow-hidden">
                {(hotel as any).image_url ? (
                  <img 
                    src={(hotel as any).image_url} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover"
                  />
                ) : hotel.images && hotel.images.length > 0 ? (
                  <img 
                    src={hotel.images[0]} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "🏨"
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {hotel.name}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  📍 {(hotel as any).address_id?.ward_id?.name && `${(hotel as any).address_id.ward_id.name}, `}
                  {(hotel as any).address_id?.district_id?.name && `${(hotel as any).address_id.district_id.name}, `}
                  {(hotel as any).address_id?.province_id?.name || hotel.location || "Chưa có địa chỉ"}
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

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                   <div>Available: <span className="font-medium text-green-600 dark:text-green-400">{hotel.availableRooms} rooms</span></div>
                   <div>Total: <span className="font-medium text-gray-900 dark:text-gray-300">{hotel.rooms} rooms</span></div>
                   <div>2 Single: <span className="font-medium text-gray-900 dark:text-gray-300">{hotel.priceTwoSingleBed?.toLocaleString()}₫</span></div>
                   <div>1S+1D: <span className="font-medium text-gray-900 dark:text-gray-300">{hotel.priceOneSingleOneDoubleBed?.toLocaleString()}₫</span></div>
                </div>

                {hotel.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {hotel.description}
                  </p>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium">
                    View Details
                  </button>
                  <button onClick={() => { setEditingHotel(hotel); setDialogOpen(true); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                    {tCommon("edit")}
                  </button>
                  <button
                    onClick={() => { setDeletingId(hotel._id); setDeleteDialogOpen(true); }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                  >
                    {tCommon("delete")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
      {filteredHotels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No hotels found</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Hotels
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {hotels.length}
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
                {hotels.reduce((acc, hotel) => acc + (hotel.rooms || 0), 0)}
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
                {hotels.length > 0 ? (hotels.reduce((acc, hotel) => acc + (hotel.rating || 0), 0) / hotels.length).toFixed(2) : "0"}
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
                Active Hotels
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {hotels.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl">
              ✓
            </div>
          </div>
        </div>
      </div>

      <HotelDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} hotel={editingHotel} />
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} title="Delete Hotel" description="Are you sure you want to delete this hotel? This action cannot be undone." />
    </div>
  );
}

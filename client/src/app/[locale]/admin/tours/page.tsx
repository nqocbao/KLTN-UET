"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toursApi } from "@/lib/services";
import type { Tour } from "@/types/api";
import { TourDialog } from "@/components/admin/modals/TourDialog";
import { DeleteConfirmDialog } from "@/components/admin/modals/DeleteConfirmDialog";
import { Eye, Edit, Trash2, Star, StarOff, MapPin, Calendar, Users } from "lucide-react";

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [domesticFilter, setDomesticFilter] = useState<string>("");
  const t = useTranslations("tours");
  const tCommon = useTranslations("common");

  const fetchTours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await toursApi.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
        is_domestic: domesticFilter || undefined,
      } as any);

      if (response.success) {
        setTours(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError("Failed to load tours. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, domesticFilter]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await toursApi.delete(deletingId);
      fetchTours();
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting tour:", err);
      alert("Failed to delete tour. Please try again.");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toursApi.toggleFeatured(id);
      fetchTours();
    } catch (err) {
      console.error("Error toggling featured:", err);
      alert("Failed to update tour. Please try again.");
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingTour) {
        await toursApi.update(editingTour._id, data);
      } else {
        await toursApi.create(data);
      }
      fetchTours();
    } catch (err) {
      console.error("Error saving tour:", err);
      alert("Failed to save tour. Please try again.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const filteredTours = tours.filter((tour) =>
    tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.tour_code?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchTours}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý Tour
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý tất cả các tour du lịch ({tours.length} tour)
          </p>
        </div>
        <button 
          onClick={() => { setEditingTour(null); setDialogOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Thêm Tour mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm theo tên tour hoặc mã tour..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
          <select 
            value={domesticFilter}
            onChange={(e) => { setDomesticFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại tour</option>
            <option value="true">Tour trong nước</option>
            <option value="false">Tour nước ngoài</option>
          </select>
        </div>
      </div>

      {/* Tours Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mã Tour
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Giá người lớn
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Giá trẻ em
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lịch trình
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTours.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Không tìm thấy tour nào
                  </td>
                </tr>
              ) : (
                filteredTours.map((tour) => (
                  <tr
                    key={tour._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {tour.banner_url && (
                          <img 
                            src={tour.banner_url} 
                            alt={tour.name}
                            className="w-16 h-12 object-cover rounded-lg" 
                          />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[250px]">
                            {tour.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {tour.featured && (
                              <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                <Star className="w-3 h-3 fill-current" /> Nổi bật
                              </span>
                            )}
                            {tour.rating && (
                              <span className="text-xs text-gray-500">
                                ⭐ {tour.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                        {tour.tour_code || tour._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {tour.duration_days}N{tour.duration_days - 1}Đ
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {formatPrice(tour.adult_price || 0)}đ
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatPrice(tour.child_price || 0)}đ
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm">
                        {tour.itinerary && tour.itinerary.length > 0 ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                            {tour.itinerary.length} ngày
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                            Chưa có
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        tour.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {tour.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleToggleFeatured(tour._id)}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={tour.featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                        >
                          {tour.featured ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <a 
                          href={`/vi/tours/${tour._id}`}
                          target="_blank"
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Xem tour"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </a>
                        <button 
                          onClick={() => { setEditingTour(tour); setDialogOpen(true); }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4 text-green-500" />
                        </button>
                        <button 
                          onClick={() => { setDeletingId(tour._id); setDeleteDialogOpen(true); }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Xoá"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-6 pb-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <TourDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        tour={editingTour}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xoá Tour"
        description="Bạn có chắc chắn muốn xoá tour này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}

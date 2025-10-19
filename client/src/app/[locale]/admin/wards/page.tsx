"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { wardsApi } from "@/lib/services/locations.service";
import type { Ward } from "@/types/api";

export default function WardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations("wards");
  const tCommon = useTranslations("common");

  const fetchWards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await wardsApi.getAll({ page: currentPage, limit: 10 });
      if (response.success) {
        setWards(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching wards:", err);
      setError("Failed to load wards");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchWards();
  }, [fetchWards]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await wardsApi.delete(id);
    fetchWards();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-lg">{tCommon("loading")}</div></div>;
  if (error) return <div className="flex items-center justify-center h-64"><div className="text-lg text-red-600">{error}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage wards</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t("addNew")}</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4">
        <input type="text" placeholder={tCommon("search")} className="w-full px-4 py-2 border rounded-lg"/>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {wards.map((ward) => (
              <tr key={ward._id}>
                <td className="px-6 py-4"><div className="text-sm font-medium">{ward.name}</div></td>
                <td className="px-6 py-4"><div className="text-sm">{ward.code}</div></td>
                <td className="px-6 py-4"><div className="text-sm">{ward.district}</div></td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(ward._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg">Previous</button>
          <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg">Next</button>
        </div>
      )}
    </div>
  );
}

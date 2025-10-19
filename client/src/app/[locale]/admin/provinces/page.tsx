"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { provincesApi } from "@/lib/services/locations.service";
import type { Province } from "@/types/api";

export default function ProvincesPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations("provinces");
  const tCommon = useTranslations("common");

  const fetchProvinces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await provincesApi.getAll({ page: currentPage, limit: 10 });
      if (response.success) {
        setProvinces(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching provinces:", err);
      setError("Failed to load provinces");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await provincesApi.delete(id);
    fetchProvinces();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-lg">{tCommon("loading")}</div></div>;
  if (error) return <div className="flex items-center justify-center h-64"><div className="text-lg text-red-600">{error}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage provinces</p>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {provinces.map((province) => (
              <tr key={province._id}>
                <td className="px-6 py-4"><div className="text-sm font-medium">{province.name}</div></td>
                <td className="px-6 py-4"><div className="text-sm">{province.code}</div></td>
                <td className="px-6 py-4"><div className="text-sm">{province.country}</div></td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(province._id)} className="text-red-600 hover:text-red-900">Delete</button>
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


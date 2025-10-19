"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { countriesApi } from "@/lib/services/locations.service";
import type { Country } from "@/types/api";

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations("countries");
  const tCommon = useTranslations("common");

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await countriesApi.getAll({ page: currentPage, limit: 10 });
      if (response.success) {
        setCountries(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
      setError("Failed to load countries");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await countriesApi.delete(id);
    fetchCountries();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-lg">{tCommon("loading")}</div></div>;
  if (error) return <div className="flex items-center justify-center h-64"><div className="text-lg text-red-600">{error}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage countries</p>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {countries.map((country) => (
              <tr key={country._id}>
                <td className="px-6 py-4"><div className="text-sm font-medium">{country.name}</div></td>
                <td className="px-6 py-4"><div className="text-sm">{country.code}</div></td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(country._id)} className="text-red-600 hover:text-red-900">Delete</button>
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

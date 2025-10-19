"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { rolesApi, type Role } from "@/lib/services/other.service";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rolesApi.getAll({ page: currentPage, limit: 10 });
      if (response.success) {
        setRoles(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await rolesApi.delete(id);
    fetchRoles();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-lg">{tCommon("loading")}</div></div>;
  if (error) return <div className="flex items-center justify-center h-64"><div className="text-lg text-red-600">{error}</div></div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user roles and access levels
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {t("addNew")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <input type="text" placeholder={tCommon("search")} className="w-full px-4 py-2 border rounded-lg"/>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {roles.map((role) => (
              <tr key={role._id}>
                <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</div></td>
                <td className="px-6 py-4"><div className="text-sm text-gray-600 dark:text-gray-400">{role.description}</div></td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(role._id)} className="text-red-600 hover:text-red-900">Delete</button>
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

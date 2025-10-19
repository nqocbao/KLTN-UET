"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { permissionsApi, type Permission } from "@/lib/services/other.service";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations("permissions");
  const tCommon = useTranslations("common");

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await permissionsApi.getAll({ page: currentPage, limit: 10 });
      if (response.success) {
        setPermissions(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await permissionsApi.delete(id);
    fetchPermissions();
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
            Manage system permissions and access control
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

      {/* Permissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {permissions.map((permission) => (
              <tr key={permission._id}>
                <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900 dark:text-white">{permission.name}</div></td>
                <td className="px-6 py-4"><span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">{permission.resource}</span></td>
                <td className="px-6 py-4"><span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">{permission.action}</span></td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(permission._id)} className="text-red-600 hover:text-red-900">Delete</button>
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

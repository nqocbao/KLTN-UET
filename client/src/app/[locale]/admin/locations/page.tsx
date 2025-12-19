"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  countriesApi,
  provincesApi,
  districtsApi,
  wardsApi,
} from "@/lib/services";
import type { Country, Province, District, Ward } from "@/types/api";

type TabType = "countries" | "provinces" | "districts" | "wards";

interface FormData {
  name: string;
  code?: string;
  description?: string;
  country_id?: string;
  province_id?: string;
  district_id?: string;
}

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("countries");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // All data for dropdowns
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [allProvinces, setAllProvinces] = useState<Province[]>([]);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);

  // Filter states
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({ name: "" });
  const [formCountry, setFormCountry] = useState("");
  const [formProvince, setFormProvince] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [filteredProvinces, setFilteredProvinces] = useState<Province[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [saving, setSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const t = useTranslations("locations");
  const tCommon = useTranslations("common");

  // Fetch all data for dropdowns
  const fetchAllData = useCallback(async () => {
    try {
      const [countriesRes, provincesRes, districtsRes] = await Promise.all([
        countriesApi.getAll({ limit: 1000 }),
        provincesApi.getAll({ limit: 1000 }),
        districtsApi.getAll({ limit: 1000 }),
      ]);
      if (countriesRes.success) setAllCountries(countriesRes.data);
      if (provincesRes.success) setAllProvinces(provincesRes.data);
      if (districtsRes.success) setAllDistricts(districtsRes.data);
    } catch (err) {
      console.error("Error fetching all data:", err);
    }
  }, []);

  // Main data fetch based on active tab
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      switch (activeTab) {
        case "countries": {
          const response = await countriesApi.getAll({
            page: currentPage,
            limit: 10,
          });
          if (response.success) {
            setCountries(response.data);
            setTotalPages(response.pagination?.totalPages || 1);
          }
          break;
        }
        case "provinces": {
          const response = await provincesApi.getAll({
            page: currentPage,
            limit: 10,
          });
          if (response.success) {
            let data = response.data;
            if (selectedCountry) {
              data = data.filter(
                (p: any) =>
                  p.country_id?._id === selectedCountry ||
                  p.country_id === selectedCountry
              );
            }
            setProvinces(data);
            setTotalPages(response.pagination?.totalPages || 1);
          }
          break;
        }
        case "districts": {
          const response = await districtsApi.getAll({
            page: currentPage,
            limit: 10,
          });
          if (response.success) {
            let data = response.data;
            if (selectedProvince) {
              data = data.filter(
                (d: any) =>
                  d.province_id?._id === selectedProvince ||
                  d.province_id === selectedProvince
              );
            }
            setDistricts(data);
            setTotalPages(response.pagination?.totalPages || 1);
          }
          break;
        }
        case "wards": {
          const response = await wardsApi.getAll({
            page: currentPage,
            limit: 10,
          });
          if (response.success) {
            let data = response.data;
            if (selectedDistrict) {
              data = data.filter(
                (w: any) =>
                  w.district_id?._id === selectedDistrict ||
                  w.district_id === selectedDistrict
              );
            }
            setWards(data);
            setTotalPages(response.pagination?.totalPages || 1);
          }
          break;
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    currentPage,
    selectedCountry,
    selectedProvince,
    selectedDistrict,
  ]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    setCurrentPage(1);
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update filtered provinces when country changes in form
  useEffect(() => {
    if (formCountry) {
      const filtered = allProvinces.filter(
        (p: any) =>
          p.country_id?._id === formCountry || p.country_id === formCountry
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces([]);
    }
    setFormProvince("");
    setFormDistrict("");
  }, [formCountry, allProvinces]);

  // Update filtered districts when province changes in form
  useEffect(() => {
    if (formProvince) {
      const filtered = allDistricts.filter(
        (d: any) =>
          d.province_id?._id === formProvince || d.province_id === formProvince
      );
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts([]);
    }
    setFormDistrict("");
  }, [formProvince, allDistricts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    try {
      switch (activeTab) {
        case "countries":
          await countriesApi.delete(id);
          break;
        case "provinces":
          await provincesApi.delete(id);
          break;
        case "districts":
          await districtsApi.delete(id);
          break;
        case "wards":
          await wardsApi.delete(id);
          break;
      }
      fetchData();
      fetchAllData();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Failed to delete. Please try again.");
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setFormCountry("");
    setFormProvince("");
    setFormDistrict("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      code: item.code || "",
      description: item.description || "",
    });

    // Set cascading values for editing
    if (activeTab === "provinces") {
      setFormCountry(item.country_id?._id || item.country_id || "");
    } else if (activeTab === "districts") {
      const province = allProvinces.find(
        (p: any) => p._id === (item.province_id?._id || item.province_id)
      );
      if (province) {
        setFormCountry(
          (province as any).country_id?._id || (province as any).country_id || ""
        );
        setTimeout(() => {
          setFormProvince(item.province_id?._id || item.province_id || "");
        }, 100);
      }
    } else if (activeTab === "wards") {
      const district = allDistricts.find(
        (d: any) => d._id === (item.district_id?._id || item.district_id)
      );
      if (district) {
        const province = allProvinces.find(
          (p: any) => p._id === ((district as any).province_id?._id || (district as any).province_id)
        );
        if (province) {
          setFormCountry(
            (province as any).country_id?._id || (province as any).country_id || ""
          );
          setTimeout(() => {
            setFormProvince((district as any).province_id?._id || (district as any).province_id || "");
            setTimeout(() => {
              setFormDistrict(item.district_id?._id || item.district_id || "");
            }, 100);
          }, 100);
        }
      }
    }

    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên!");
      return;
    }

    // Validate cascading requirements
    if (activeTab === "provinces" && !formCountry) {
      alert("Vui lòng chọn Quốc gia!");
      return;
    }
    if (activeTab === "districts" && (!formCountry || !formProvince)) {
      alert("Vui lòng chọn Quốc gia và Tỉnh/Thành phố!");
      return;
    }
    if (activeTab === "wards" && (!formCountry || !formProvince || !formDistrict)) {
      alert("Vui lòng chọn Quốc gia, Tỉnh/Thành phố và Quận/Huyện!");
      return;
    }

    setSaving(true);
    try {
      let payload: any = { name: formData.name };

      switch (activeTab) {
        case "countries":
          payload.code = formData.code;
          payload.description = formData.description;
          if (editingItem) {
            await countriesApi.update(editingItem._id, payload);
          } else {
            await countriesApi.create(payload);
          }
          break;
        case "provinces":
          payload.country_id = formCountry;
          if (editingItem) {
            await provincesApi.update(editingItem._id, payload);
          } else {
            await provincesApi.create(payload);
          }
          break;
        case "districts":
          payload.province_id = formProvince;
          if (editingItem) {
            await districtsApi.update(editingItem._id, payload);
          } else {
            await districtsApi.create(payload);
          }
          break;
        case "wards":
          payload.district_id = formDistrict;
          if (editingItem) {
            await wardsApi.update(editingItem._id, payload);
          } else {
            await wardsApi.create(payload);
          }
          break;
      }

      setIsModalOpen(false);
      fetchData();
      fetchAllData();
    } catch (err) {
      console.error("Error saving:", err);
      alert("Lỗi khi lưu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "countries" as TabType, label: "Quốc gia", icon: "🌍", count: countries.length },
    { id: "provinces" as TabType, label: "Tỉnh/Thành phố", icon: "🏙️", count: provinces.length },
    { id: "districts" as TabType, label: "Quận/Huyện", icon: "🏘️", count: districts.length },
    { id: "wards" as TabType, label: "Phường/Xã", icon: "📍", count: wards.length },
  ];

  const getModalTitle = () => {
    const action = editingItem ? "Sửa" : "Thêm";
    switch (activeTab) {
      case "countries":
        return `${action} Quốc gia`;
      case "provinces":
        return `${action} Tỉnh/Thành phố`;
      case "districts":
        return `${action} Quận/Huyện`;
      case "wards":
        return `${action} Phường/Xã`;
    }
  };

  const renderTable = () => {
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

    switch (activeTab) {
      case "countries":
        return (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên quốc gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {countries
                .filter((c) =>
                  c.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((country) => (
                  <tr
                    key={country._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌍</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {country.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-mono">
                        {country.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {(country as any).description || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(country)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(country._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        );

      case "provinces":
        return (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên tỉnh/thành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quốc gia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {provinces
                .filter((p) =>
                  p.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((province) => (
                  <tr
                    key={province._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏙️</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {province.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {(province as any).country_id?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(province)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(province._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        );

      case "districts":
        return (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên quận/huyện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tỉnh/Thành phố
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {districts
                .filter((d) =>
                  d.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((district) => (
                  <tr
                    key={district._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏘️</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {district.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {(district as any).province_id?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(district)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(district._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        );

      case "wards":
        return (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên phường/xã
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quận/Huyện
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {wards
                .filter((w) =>
                  w.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((ward) => (
                  <tr
                    key={ward._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📍</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {ward.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {(ward as any).district_id?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(ward)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(ward._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý Địa điểm
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý quốc gia, tỉnh thành, quận huyện và phường xã
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Thêm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeTab !== "countries" && (
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedProvince("");
                setSelectedDistrict("");
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <option value="">Tất cả quốc gia</option>
              {allCountries.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {(activeTab === "districts" || activeTab === "wards") && (
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedDistrict("");
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <option value="">Tất cả tỉnh/thành</option>
              {allProvinces
                .filter(
                  (p: any) =>
                    !selectedCountry ||
                    p.country_id?._id === selectedCountry ||
                    p.country_id === selectedCountry
                )
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
            </select>
          )}

          {activeTab === "wards" && (
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <option value="">Tất cả quận/huyện</option>
              {allDistricts
                .filter(
                  (d: any) =>
                    !selectedProvince ||
                    d.province_id?._id === selectedProvince ||
                    d.province_id === selectedProvince
                )
                .map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {renderTable()}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🌍</div>
          <div className="text-2xl font-bold mb-1">{allCountries.length}</div>
          <div className="text-blue-100 text-sm">Quốc gia</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🏙️</div>
          <div className="text-2xl font-bold mb-1">{allProvinces.length}</div>
          <div className="text-purple-100 text-sm">Tỉnh/Thành phố</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">🏘️</div>
          <div className="text-2xl font-bold mb-1">{allDistricts.length}</div>
          <div className="text-orange-100 text-sm">Quận/Huyện</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">📍</div>
          <div className="text-2xl font-bold mb-1">{wards.length}</div>
          <div className="text-green-100 text-sm">Phường/Xã</div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {getModalTitle()}
            </h2>

            <div className="space-y-4">
              {/* Country Select - for provinces, districts, wards */}
              {activeTab !== "countries" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quốc gia <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn Quốc gia --</option>
                    {allCountries.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Province Select - for districts, wards */}
              {(activeTab === "districts" || activeTab === "wards") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    disabled={!formCountry}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formCountry ? "-- Chọn Tỉnh/Thành phố --" : "-- Chọn Quốc gia trước --"}
                    </option>
                    {filteredProvinces.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* District Select - for wards */}
              {activeTab === "wards" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    disabled={!formProvince}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formProvince ? "-- Chọn Quận/Huyện --" : "-- Chọn Tỉnh/Thành phố trước --"}
                    </option>
                    {filteredDistricts.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Country-specific fields */}
              {activeTab === "countries" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mã quốc gia
                    </label>
                    <input
                      type="text"
                      value={formData.code || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="VD: VN, US, JP..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Nhập mô tả..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

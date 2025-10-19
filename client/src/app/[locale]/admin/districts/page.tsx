"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const mockDistricts = [
  {
    id: 1,
    name: "Quận Ba Đình",
    code: "BD",
    province_id: "province_001",
    province: "Hà Nội",
    country: "Vietnam",
    wardCount: 14,
    population: "228,353",
    area: "9.21 km²",
    status: "active",
  },
  {
    id: 2,
    name: "Quận Hoàn Kiếm",
    code: "HK",
    province_id: "province_001",
    province: "Hà Nội",
    country: "Vietnam",
    wardCount: 18,
    population: "142,587",
    area: "5.29 km²",
    status: "active",
  },
  {
    id: 3,
    name: "Quận 1",
    code: "Q1",
    province_id: "province_002",
    province: "Hồ Chí Minh",
    country: "Vietnam",
    wardCount: 10,
    population: "204,899",
    area: "7.73 km²",
    status: "active",
  },
  {
    id: 4,
    name: "Quận 3",
    code: "Q3",
    province_id: "province_002",
    province: "Hồ Chí Minh",
    country: "Vietnam",
    wardCount: 14,
    population: "188,030",
    area: "4.90 km²",
    status: "active",
  },
  {
    id: 5,
    name: "Quận Hải Châu",
    code: "HC",
    province_id: "province_003",
    province: "Đà Nẵng",
    country: "Vietnam",
    wardCount: 13,
    population: "202,255",
    area: "20.55 km²",
    status: "active",
  },
];

export default function DistrictsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const t = useTranslations("districts");
  const tCommon = useTranslations("common");

  // Filter logic
  const filteredDistricts = mockDistricts.filter((district) => {
    const matchesSearch = district.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCountry =
      selectedCountry === "all" || district.country === selectedCountry;
    const matchesProvince =
      selectedProvince === "all" || district.province === selectedProvince;

    return matchesSearch && matchesCountry && matchesProvince;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage districts and administrative divisions
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t("country")} - All</option>
            <option value="Vietnam">Vietnam</option>
            <option value="Thailand">Thailand</option>
            <option value="Cambodia">Cambodia</option>
            <option value="Laos">Laos</option>
            <option value="Myanmar">Myanmar</option>
          </select>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t("province")} - All</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCountry("all");
              setSelectedProvince("all");
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {tCommon("reset")}
          </button>
        </div>
      </div>

      {/* Districts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("code")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("country")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("province")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("wards")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("population")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("area")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {tCommon("status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {tCommon("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDistricts.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {tCommon("noResults")}
                  </td>
                </tr>
              ) : (
                filteredDistricts.map((district) => (
                <tr
                  key={district.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs mr-3">
                        {district.code}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {district.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                    {district.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      {district.country}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                      {district.province}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {district.wardCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {district.population}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {district.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      {district.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 mr-3">
                      {tCommon("edit")}
                    </button>
                    <button className="text-red-600 hover:text-red-800 dark:text-red-400">
                      {tCommon("delete")}
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

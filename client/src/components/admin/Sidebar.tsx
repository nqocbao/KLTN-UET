"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations("navigation");

  const menuItems = [
    {
      title: "Dashboard",
      items: [
        { label: t("dashboard"), href: "/admin", icon: "📊" },
        { label: "E-commerce", href: "/admin/ecommerce", icon: "🛍️" },
      ],
    },
    {
      title: "Management",
      items: [
        { label: t("tours"), href: "/admin/tours", icon: "✈️" },
        { label: t("destinations"), href: "/admin/destinations", icon: "🌍" },
        { label: t("hotels"), href: "/admin/hotels", icon: "🏨" },
        { label: t("restaurants"), href: "/admin/restaurants", icon: "🍽️" },
        { label: "Airlines", href: "/admin/airlines", icon: "✈️" },
        { label: "Transports", href: "/admin/transports", icon: "🚗" },
      ],
    },
    {
      title: "User Management",
      items: [
        { label: t("users"), href: "/admin/users", icon: "👥" },
        { label: "Roles", href: "/admin/roles", icon: "🔐" },
        { label: "Permissions", href: "/admin/permissions", icon: "🔑" },
      ],
    },
    {
      title: "Content",
      items: [
        { label: "Reviews", href: "/admin/reviews", icon: "⭐" },
        { label: "Guides", href: "/admin/guides", icon: "📖" },
        { label: "Conversations", href: "/admin/conversations", icon: "💬" },
      ],
    },
    {
      title: "Location",
      items: [
        { label: t("countries"), href: "/admin/countries", icon: "🌏" },
        { label: "Provinces", href: "/admin/provinces", icon: "🏙️" },
        { label: "Districts", href: "/admin/districts", icon: "🏘️" },
        { label: "Wards", href: "/admin/wards", icon: "🏠" },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Travel</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin
            </span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const isActive = pathname === item.href;
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.href as any}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      title={isCollapsed ? item.label : ""}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Clock,
  MapPin,
  Star,
  Trash2,
  Plane,
  Building2,
  Map,
  Compass,
  X,
} from "lucide-react";

import {
  RecentlyViewedItem,
  getRecentlyViewed,
  clearRecentlyViewed,
} from "@/lib/recently-viewed";

const typeLabels: Record<RecentlyViewedItem["type"], string> = {
  tour: "Tour",
  hotel: "Khách sạn",
  flight: "Chuyến bay",
  destination: "Điểm đến",
};

const typeIcons: Record<RecentlyViewedItem["type"], React.ReactNode> = {
  tour: <Map className="h-4 w-4" />,
  hotel: <Building2 className="h-4 w-4" />,
  flight: <Plane className="h-4 w-4" />,
  destination: <Compass className="h-4 w-4" />,
};

const typeColors: Record<RecentlyViewedItem["type"], string> = {
  tour: "bg-orange-100 text-orange-700",
  hotel: "bg-blue-100 text-blue-700",
  flight: "bg-purple-100 text-purple-700",
  destination: "bg-green-100 text-green-700",
};

type FilterType = "all" | RecentlyViewedItem["type"];

function RecentlyViewedCard({
  item,
  locale,
  onRemove,
}: {
  item: RecentlyViewedItem;
  locale: string;
  onRemove: (id: string, type: string) => void;
}) {
  const timeAgo = getTimeAgo(item.viewedAt);

  return (
    <div className="group relative flex gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Image */}
      <Link
        href={`/${locale}${item.url}`}
        className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            {typeIcons[item.type]}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[item.type]}`}
            >
              {typeIcons[item.type]}
              {typeLabels[item.type]}
            </span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
          <Link
            href={`/${locale}${item.url}`}
            className="line-clamp-1 text-sm font-semibold text-gray-900 hover:text-orange-600"
          >
            {item.name}
          </Link>
          {item.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{item.location}</span>
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.price != null && (
              <span className="text-sm font-bold text-orange-600">
                {item.price.toLocaleString("vi-VN")}đ
              </span>
            )}
            {item.rating != null && (
              <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {item.rating}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(item.id, item.type)}
        className="absolute right-2 top-2 rounded-full p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        title="Xóa khỏi lịch sử"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function RecentlyViewedPage() {
  const locale = useLocale();
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterType>("all");

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  const filteredItems =
    activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  const counts = {
    all: items.length,
    tour: items.filter((i) => i.type === "tour").length,
    hotel: items.filter((i) => i.type === "hotel").length,
    flight: items.filter((i) => i.type === "flight").length,
    destination: items.filter((i) => i.type === "destination").length,
  };

  const tabs: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "tour", label: "Tour" },
    { key: "hotel", label: "Khách sạn" },
    { key: "flight", label: "Chuyến bay" },
    { key: "destination", label: "Điểm đến" },
  ];

  function handleRemove(id: string, type: string) {
    const updated = items.filter(
      (i) => !(i.id === id && i.type === type)
    );
    setItems(updated);
    localStorage.setItem("vivutravel_recently_viewed", JSON.stringify(updated));
  }

  function handleClearAll() {
    clearRecentlyViewed();
    setItems([]);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xem gần đây</h1>
          <p className="mt-1 text-sm text-gray-500">
            Lịch sử các tour, khách sạn, chuyến bay và điểm đến bạn đã xem
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            <span
              className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${
                activeTab === tab.key
                  ? "bg-orange-400 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-16">
          <Clock className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">
            {items.length === 0
              ? "Chưa có lịch sử xem"
              : "Không có mục nào trong danh mục này"}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Các tour, khách sạn, chuyến bay và điểm đến bạn xem sẽ xuất hiện ở
            đây
          </p>
          <Link
            href={`/${locale}`}
            className="mt-4 rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item, idx) => (
            <RecentlyViewedCard
              key={`${item.type}-${item.id}-${idx}`}
              item={item}
              locale={locale}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

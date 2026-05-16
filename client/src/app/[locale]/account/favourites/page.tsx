"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, MapPin, Star, Trash2, Hotel, Plane, Bus, Map, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { favouritesApi, type FavouriteType, type FavouriteItem } from "@/lib/services/favourites.service";

type TabKey = "all" | FavouriteType;

interface FlatItem {
  favouriteId: string;
  type: FavouriteType;
  itemId: string;
  name: string;
  image: string;
  location?: string;
  price?: number;
  rating?: number;
  savedAt: string;
}

const TYPE_LABELS: Record<FavouriteType, string> = {
  hotel: "Khách sạn",
  tour: "Tour",
  restaurant: "Nhà hàng",
  destination: "Điểm đến",
  transport: "Phương tiện",
  airline: "Hãng bay",
};

const TYPE_BADGE_COLORS: Record<FavouriteType, string> = {
  hotel: "bg-blue-100 text-blue-700",
  tour: "bg-orange-100 text-orange-700",
  restaurant: "bg-pink-100 text-pink-700",
  destination: "bg-teal-100 text-teal-700",
  transport: "bg-green-100 text-green-700",
  airline: "bg-purple-100 text-purple-700",
};

const getTypeIcon = (type: FavouriteType) => {
  switch (type) {
    case "tour":
      return <Map className="w-3 h-3" />;
    case "hotel":
      return <Hotel className="w-3 h-3" />;
    case "airline":
      return <Plane className="w-3 h-3" />;
    case "transport":
      return <Bus className="w-3 h-3" />;
    case "destination":
      return <MapPin className="w-3 h-3" />;
    case "restaurant":
      return <Utensils className="w-3 h-3" />;
    default:
      return <Heart className="w-3 h-3" />;
  }
};

const flattenFavourite = (fav: FavouriteItem): FlatItem | null => {
  const pairs: Array<[FavouriteType, any]> = [
    ["hotel", fav.hotel_id],
    ["tour", fav.tour_id],
    ["restaurant", fav.restaurant_id],
    ["destination", fav.destination_id],
    ["transport", fav.transport_id],
    ["airline", fav.airline_id],
  ];
  const hit = pairs.find(([, v]) => v && typeof v === "object");
  if (!hit) return null;
  const [type, item] = hit;
  return {
    favouriteId: fav._id,
    type,
    itemId: item._id,
    name: item.name || item.title || item.service_name || "Mục yêu thích",
    image:
      item.image_url ||
      item.images?.[0] ||
      item.image ||
      item.thumbnail ||
      "https://placehold.co/300x200/png?text=Image",
    location: item.location || item.address || undefined,
    price:
      item.priceTwoSingleBed ||
      item.adult_price ||
      item.price ||
      undefined,
    rating: item.rating,
    savedAt: fav.createdAt,
  };
};

export default function FavouritesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [favourites, setFavourites] = useState<FlatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await favouritesApi.list();
        if (!mounted) return;
        const flat = (res.data || [])
          .map(flattenFavourite)
          .filter((x): x is FlatItem => x !== null);
        setFavourites(flat);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Không tải được danh sách yêu thích");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const removeFavourite = async (item: FlatItem) => {
    try {
      await favouritesApi.remove(item.type, item.itemId);
      setFavourites((prev) => prev.filter((f) => f.favouriteId !== item.favouriteId));
    } catch (err) {
      console.error("Remove favourite failed:", err);
    }
  };

  const filteredFavourites = useMemo(
    () => (activeTab === "all" ? favourites : favourites.filter((f) => f.type === activeTab)),
    [activeTab, favourites]
  );

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: favourites.length,
      hotel: 0,
      tour: 0,
      restaurant: 0,
      destination: 0,
      transport: 0,
      airline: 0,
    };
    favourites.forEach((f) => {
      c[f.type] += 1;
    });
    return c;
  }, [favourites]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "tour", label: "Tour" },
    { key: "hotel", label: "Khách sạn" },
    { key: "restaurant", label: "Nhà hàng" },
    { key: "destination", label: "Điểm đến" },
    { key: "airline", label: "Hãng bay" },
    { key: "transport", label: "Phương tiện" },
  ];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <Heart className="w-10 h-10 text-red-300" />
      </div>
      <p className="text-gray-500 text-lg mb-2">Chưa có mục yêu thích nào</p>
      <p className="text-gray-400 text-sm mb-4">
        Nhấn vào biểu tượng trái tim trên các tour, khách sạn để lưu lại
      </p>
      <Link href="/tours">
        <Button className="bg-blue-600 hover:bg-blue-700">Khám phá tour</Button>
      </Link>
    </div>
  );

  const FavouriteCard = ({ item }: { item: FlatItem }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="flex">
        <div className="w-36 h-32 relative flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/300x200/png?text=Image")}
          />
          <span
            className={cn(
              "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1",
              TYPE_BADGE_COLORS[item.type]
            )}
          >
            {getTypeIcon(item.type)}
            {TYPE_LABELS[item.type]}
          </span>
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">{item.name}</h3>
            <button
              onClick={() => removeFavourite(item)}
              className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Xóa khỏi yêu thích"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {item.location && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              {item.rating != null && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
              )}
              {item.price != null && (
                <span className="text-orange-600 font-bold">
                  {item.price.toLocaleString("vi-VN")} đ
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              Lưu: {new Date(item.savedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Đã lưu yêu thích</h2>
        </div>
        <span className="text-sm text-gray-500">{favourites.length} mục</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span
                  className={cn(
                    "ml-1.5 px-1.5 py-0.5 rounded-full text-xs",
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="py-16 text-center text-gray-500">Đang tải danh sách yêu thích…</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">{error}</div>
        ) : filteredFavourites.length > 0 ? (
          <div className="space-y-4">
            {filteredFavourites.map((item) => (
              <FavouriteCard key={item.favouriteId} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

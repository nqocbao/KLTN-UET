"use client";

import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Trash2, Hotel, Plane, Bus, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

type FavouriteType = "all" | "tour" | "hotel" | "flight" | "transport" | "destination";

interface FavouriteItem {
  id: string;
  type: FavouriteType;
  name: string;
  image: string;
  location?: string;
  price?: number;
  rating?: number;
  savedAt: string;
}

export default function FavouritesPage() {
  const [activeTab, setActiveTab] = useState<FavouriteType>("all");
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);

  useEffect(() => {
    // Load favourites from localStorage
    const saved = localStorage.getItem("vivutravel_favourites");
    if (saved) {
      try {
        setFavourites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favourites:", e);
      }
    }
  }, []);

  const removeFavourite = (id: string) => {
    const updated = favourites.filter((f) => f.id !== id);
    setFavourites(updated);
    localStorage.setItem("vivutravel_favourites", JSON.stringify(updated));
  };

  const filteredFavourites = activeTab === "all" 
    ? favourites 
    : favourites.filter((f) => f.type === activeTab);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tour: "Tour",
      hotel: "Khách sạn",
      flight: "Chuyến bay",
      transport: "Xe buýt",
      destination: "Điểm đến",
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      tour: <Map className="w-3 h-3" />,
      hotel: <Hotel className="w-3 h-3" />,
      flight: <Plane className="w-3 h-3" />,
      transport: <Bus className="w-3 h-3" />,
      destination: <MapPin className="w-3 h-3" />,
    };
    return icons[type] || <Heart className="w-3 h-3" />;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      tour: "bg-orange-100 text-orange-700",
      hotel: "bg-blue-100 text-blue-700",
      flight: "bg-purple-100 text-purple-700",
      transport: "bg-green-100 text-green-700",
      destination: "bg-teal-100 text-teal-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const tabs = [
    { key: "all" as FavouriteType, label: "Tất cả", count: favourites.length },
    { key: "tour" as FavouriteType, label: "Tour", count: favourites.filter(f => f.type === "tour").length },
    { key: "hotel" as FavouriteType, label: "Khách sạn", count: favourites.filter(f => f.type === "hotel").length },
    { key: "flight" as FavouriteType, label: "Chuyến bay", count: favourites.filter(f => f.type === "flight").length },
    { key: "destination" as FavouriteType, label: "Điểm đến", count: favourites.filter(f => f.type === "destination").length },
  ];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <Heart className="w-10 h-10 text-red-300" />
      </div>
      <p className="text-gray-500 text-lg mb-2">Chưa có mục yêu thích nào</p>
      <p className="text-gray-400 text-sm mb-4">
        Nhấn vào biểu tượng ❤️ trên các tour, khách sạn để lưu lại
      </p>
      <Link href="/tours">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Khám phá tour
        </Button>
      </Link>
    </div>
  );

  const FavouriteCard = ({ item }: { item: FavouriteItem }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="flex">
        <div className="w-36 h-32 relative flex-shrink-0">
          <img
            src={item.image || "https://placehold.co/300x200/png?text=Image"}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/300x200/png?text=Image")}
          />
          <span className={cn(
            "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1",
            getTypeBadgeColor(item.type)
          )}>
            {getTypeIcon(item.type)}
            {getTypeLabel(item.type)}
          </span>
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">{item.name}</h3>
            <button 
              onClick={() => removeFavourite(item.id)}
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
              {item.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
              )}
              {item.price && (
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
              {tab.count > 0 && (
                <span className={cn(
                  "ml-1.5 px-1.5 py-0.5 rounded-full text-xs",
                  activeTab === tab.key ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredFavourites.length > 0 ? (
          <div className="space-y-4">
            {filteredFavourites.map((item) => (
              <FavouriteCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

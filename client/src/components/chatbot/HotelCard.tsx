/* eslint-disable @next/next/no-img-element */
import { Star } from "lucide-react";
import type { CardItem } from "./types";

export function HotelCard({ item }: { item: CardItem }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex gap-3 p-3">
      {item.image_url && (
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {item.rating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-600">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              {item.rating}/5
            </span>
          )}
          {item.available_rooms !== undefined && (
            <span className="text-xs text-gray-500">
              {item.available_rooms > 0 ? `${item.available_rooms} phòng trống` : "Hết phòng"}
            </span>
          )}
        </div>
        {item.price_text && (
          <p className="text-sm font-bold text-blue-600 mt-1">
            Từ {item.price_text}/đêm
          </p>
        )}
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import { Clock, Star } from "lucide-react";
import type { CardItem } from "./types";

export function TourCard({ item }: { item: CardItem }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {item.image_url && (
        <div className="h-32 overflow-hidden">
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
      <div className="p-3">
        <p className="font-semibold text-gray-800 text-sm leading-snug">{item.name}</p>
        {item.tour_code && (
          <p className="text-xs text-gray-400 mt-0.5">Mã: {item.tour_code}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {item.duration && (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> {item.duration} ngày
            </span>
          )}
          {item.rating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /> {item.rating}
            </span>
          )}
        </div>
        {item.price_text && (
          <p className="text-sm font-bold text-blue-600 mt-2">{item.price_text}/người</p>
        )}
        {item.departure_dates && item.departure_dates.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Ngày khởi hành gần nhất:</p>
            <div className="flex flex-wrap gap-1">
              {item.departure_dates.slice(0, 3).map((d, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {new Date(d).toLocaleDateString("vi-VN")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

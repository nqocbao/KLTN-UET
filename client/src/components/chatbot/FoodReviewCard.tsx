/* eslint-disable @next/next/no-img-element */
import { ExternalLink, MapPin } from "lucide-react";
import type { CardItem } from "./types";

export function FoodReviewCard({ item }: { item: CardItem }) {
  const location = item.location ? item.location : "";
  const engagement = item.engagement_score ? Math.round(item.engagement_score) : null;

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
        {location && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
          </div>
        )}
        {item.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-semibold text-amber-600">
            {item.price_text ? item.price_text : "Dang cap nhat"}
          </span>
          {engagement !== null && engagement > 0 && (
            <span className="text-[11px] text-gray-400">Hot score: {engagement}</span>
          )}
        </div>
        {item.post_url && (
          <a
            href={item.post_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 mt-2 hover:text-blue-700"
          >
            <ExternalLink className="w-3 h-3" />
            Xem bai viet
          </a>
        )}
      </div>
    </div>
  );
}

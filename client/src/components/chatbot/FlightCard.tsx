import { Plane } from "lucide-react";
import type { CardItem } from "./types";

export function FlightCard({ item }: { item: CardItem }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
            {item.airline && <p className="text-xs text-gray-400">{item.airline}</p>}
          </div>
        </div>
        {item.stops !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${item.stops === 0 ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
            {item.stops === 0 ? "Bay thẳng" : `${item.stops} điểm dừng`}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="text-center">
          <p className="font-bold text-gray-900">{item.dep_time || "--:--"}</p>
          <p className="text-xs text-gray-500">{item.departure}</p>
        </div>
        <div className="flex-1 flex flex-col items-center px-2">
          <p className="text-xs text-gray-400">{item.duration_text}</p>
          <div className="w-full flex items-center gap-1 my-0.5">
            <div className="flex-1 h-[1px] bg-gray-300" />
            <Plane className="w-3 h-3 text-gray-400" />
            <div className="flex-1 h-[1px] bg-gray-300" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900">{item.arr_time || "--:--"}</p>
          <p className="text-xs text-gray-500">{item.arrival}</p>
        </div>
      </div>
      {item.price_text && (
        <p className="text-sm font-bold text-blue-600 mt-2 text-right">{item.price_text}</p>
      )}
    </div>
  );
}

import { MapPin, Plane, Calendar, Clock, Users, Wallet } from "lucide-react";
import type { ExtractedEntities } from "./types";

export function EntityPanel({ entities }: { entities: ExtractedEntities }) {
  const hasAny = Object.values(entities).some(Boolean);
  if (!hasAny) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Kế hoạch của bạn
      </p>
      <div className="space-y-2">
        {entities.destination && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-gray-500">Điểm đến:</span>
            <span className="font-medium text-gray-800">{entities.destination}</span>
          </div>
        )}
        {(entities.flight_from || entities.departure) && (
          <div className="flex items-center gap-2 text-sm">
            <Plane className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span className="text-gray-500">Từ:</span>
            <span className="font-medium text-gray-800">{entities.flight_from || entities.departure}</span>
          </div>
        )}
        {entities.check_in && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-500">Ngày đi:</span>
            <span className="font-medium text-gray-800">{entities.check_in}</span>
          </div>
        )}
        {entities.duration && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span className="text-gray-500">Số ngày:</span>
            <span className="font-medium text-gray-800">{entities.duration} ngày</span>
          </div>
        )}
        {entities.guests && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-gray-500">Số người:</span>
            <span className="font-medium text-gray-800">{entities.guests}</span>
          </div>
        )}
        {entities.budget && (
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-500">Ngân sách:</span>
            <span className="font-medium text-gray-800">{entities.budget}</span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Palmtree, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Vacation {
  id: string;
  tourName: string;
  tourImage: string;
  destination: string;
  startDate: string;
  endDate: string;
  guests: number;
  status: "upcoming" | "ongoing" | "completed";
}

export default function VacationsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");

  // Mock data - replace with actual API call
  const vacations: Vacation[] = [];

  const filteredVacations = vacations.filter((v) => {
    if (activeTab === "upcoming") return v.status === "upcoming" || v.status === "ongoing";
    return v.status === "completed";
  });

  const getStatusBadge = (status: Vacation["status"]) => {
    const config = {
      upcoming: { label: "Sắp diễn ra", class: "bg-blue-100 text-blue-700" },
      ongoing: { label: "Đang diễn ra", class: "bg-green-100 text-green-700" },
      completed: { label: "Đã hoàn thành", class: "bg-gray-100 text-gray-700" },
    };
    const c = config[status];
    return (
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", c.class)}>
        {c.label}
      </span>
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-72 h-48 relative mb-6">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          {/* Beach scene */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="100%" stopColor="#E0F4FF" />
            </linearGradient>
            <linearGradient id="seaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4CADD4" />
              <stop offset="100%" stopColor="#2E8BC0" />
            </linearGradient>
          </defs>
          
          {/* Sky */}
          <rect x="0" y="0" width="400" height="180" fill="url(#skyGradient)" />
          
          {/* Sun */}
          <circle cx="320" cy="60" r="30" fill="#FFE066" />
          
          {/* Sea */}
          <ellipse cx="200" cy="230" rx="200" ry="50" fill="url(#seaGradient)" />
          
          {/* Beach */}
          <ellipse cx="200" cy="260" rx="180" ry="40" fill="#F4D03F" />
          
          {/* Palm tree */}
          <path d="M100 260 L100 180" stroke="#8B4513" strokeWidth="8" />
          <path d="M100 180 Q70 160 50 180" stroke="#228B22" strokeWidth="4" fill="none" />
          <path d="M100 180 Q85 150 60 160" stroke="#228B22" strokeWidth="4" fill="none" />
          <path d="M100 180 Q130 160 150 180" stroke="#228B22" strokeWidth="4" fill="none" />
          <path d="M100 180 Q115 150 140 160" stroke="#228B22" strokeWidth="4" fill="none" />
          <path d="M100 180 Q100 145 100 140" stroke="#228B22" strokeWidth="4" fill="none" />
          
          {/* Beach umbrella */}
          <path d="M280 260 L280 200" stroke="#8B4513" strokeWidth="4" />
          <path d="M230 200 Q280 160 330 200" fill="#FF6B6B" stroke="#E55555" strokeWidth="2" />
          
          {/* Beach chair */}
          <rect x="260" y="240" width="40" height="5" fill="#4CADD4" />
          <path d="M265 245 L255 260" stroke="#8B4513" strokeWidth="3" />
          <path d="M295 245 L305 260" stroke="#8B4513" strokeWidth="3" />
        </svg>
      </div>
      
      <p className="text-gray-500 text-lg mb-2">Chưa có kỳ nghỉ nào</p>
      <p className="text-gray-400 text-sm mb-4">Hãy đặt tour để khám phá những điểm đến tuyệt vời</p>
      <Button className="bg-blue-600 hover:bg-blue-700">
        Khám phá tour
      </Button>
    </div>
  );

  const VacationCard = ({ vacation }: { vacation: Vacation }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <img
          src={vacation.tourImage}
          alt={vacation.tourName}
          className="w-48 h-36 object-cover"
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{vacation.tourName}</h3>
            {getStatusBadge(vacation.status)}
          </div>
          
          <div className="mt-3 space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{vacation.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{vacation.startDate} - {vacation.endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{vacation.guests} khách</span>
            </div>
          </div>
          
          <div className="mt-3">
            <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
              Xem chi tiết
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { key: "upcoming", label: "Kỳ nghỉ sắp tới" },
            { key: "completed", label: "Kỳ nghỉ đã qua" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredVacations.length > 0 ? (
          <div className="space-y-4">
            {filteredVacations.map((vacation) => (
              <VacationCard key={vacation.id} vacation={vacation} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

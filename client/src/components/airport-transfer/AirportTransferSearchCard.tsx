"use client";

import { Button } from "@/components/ui/button";
import { Star, Users, Clock, MapPin, Wifi, User, Shield, Coffee } from "lucide-react";

interface AirportTransferSearchCardProps {
  transfer: {
    _id?: string;
    id?: string;
    service_name: string;
    vehicle_type: string;
    pickup_location: string;
    dropoff_location: string;
    price: number;
    duration: string;
    rating: number;
    total_reviews: number;
    features: string[];
    image?: string;
  };
}

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "WiFi": Wifi,
  "Driver chuyên nghiệp": User,
  "Driver tiếng Anh": User,
  "Nước uống miễn phí": Coffee,
  "Nước uống cao cấp": Coffee,
};

export function AirportTransferSearchCard({ transfer }: AirportTransferSearchCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Vehicle Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{transfer.service_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                  {transfer.vehicle_type}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">{transfer.rating}</span>
                  <span className="text-gray-500 text-xs">({transfer.total_reviews})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Điểm đón</div>
              <div className="font-semibold text-gray-900 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                {transfer.pickup_location}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="h-px bg-gray-300 flex-1"></div>
                <Clock className="w-4 h-4" />
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{transfer.duration}</div>
            </div>

            <div className="text-right md:text-left">
              <div className="text-xs text-gray-500 mb-1">Điểm đến</div>
              <div className="font-semibold text-gray-900 flex items-center gap-1 justify-end md:justify-start">
                <MapPin className="w-4 h-4 text-red-600" />
                {transfer.dropoff_location}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {transfer.features.map((feature, index) => {
              const Icon = featureIcons[feature] || Shield;
              return (
                <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                  <Icon className="w-3 h-3" />
                  <span>{feature}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price & Booking */}
        <div className="flex md:flex-col items-end justify-between md:justify-start gap-4 md:w-48 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Giá chuyến đi</div>
            <div className="text-2xl font-bold text-blue-600">
              {transfer.price.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-xs text-gray-500 mt-1">/ xe</div>
          </div>
          <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
            Đặt ngay
          </Button>
        </div>
      </div>
    </div>
  );
}

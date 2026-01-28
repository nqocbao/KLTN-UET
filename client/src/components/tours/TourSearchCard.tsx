"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Tour } from "@/types/api";

interface TourSearchCardProps {
  tour: Tour;
}

export function TourSearchCard({ tour }: TourSearchCardProps) {
  const router = useRouter();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"][date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${dayOfWeek}, ${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
  };

  const image = Array.isArray(tour.images) && tour.images.length > 0 
    ? tour.images[0] 
    : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80";

  // Get promotional message if available
  const promotionalMessage = tour.included_services && Array.isArray(tour.included_services) && tour.included_services.length > 0
    ? typeof tour.included_services[0] === 'object' 
      ? tour.included_services[0].name 
      : tour.included_services[0]
    : null;

  return (
    <Card className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-gray-200">
      <div className="flex flex-col md:flex-row h-full">
        {/* Tour Image */}
        <div className="relative w-full md:w-[260px] h-[180px] overflow-hidden shrink-0">
          <img
            src={image}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Promotional Banner */}
          {promotionalMessage && (
            <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1.5 text-xs font-semibold shadow-lg">
              {promotionalMessage}
            </div>
          )}
        </div>

        {/* Tour Details */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          {/* Top Section */}
          <div>
            {/* Tour Name */}
            <h3 className="text-base font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {tour.name}
            </h3>

            {/* Departure Dates */}
            {tour.departure_dates && tour.departure_dates.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Khởi hành:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tour.departure_dates.slice(0, 3).map((date, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="border-blue-400 text-blue-600 hover:bg-blue-50 px-3 py-1 text-xs font-medium"
                    >
                      {formatDate(date)}
                    </Badge>
                  ))}
                  {tour.departure_dates.length > 3 && (
                    <Badge 
                      variant="outline" 
                      className="border-blue-400 text-blue-600 hover:bg-blue-50 px-3 py-1 text-xs font-medium"
                    >
                      +{tour.departure_dates.length - 3} ngày
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Tour Info */}
            <div className="flex flex-wrap gap-6 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{tour.duration_days} Ngày {tour.duration_days - 1} Đêm</span>
              </div>
              
              {tour.departure_location_id && typeof tour.departure_location_id === 'object' && 'name' in tour.departure_location_id && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{tour.departure_location_id.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Price & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Giá từ</span>
              <span className="text-2xl font-bold text-orange-600">
                {formatPrice(tour.adult_price || 0)} đ
              </span>
            </div>
            
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() => router.push(`/vi/tours/${tour._id}`)}
            >
              Xem Tour
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

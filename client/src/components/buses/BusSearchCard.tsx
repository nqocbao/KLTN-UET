"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Users, Clock, MapPin, Wifi, Wind, Coffee, Tv, Phone, Heart } from "lucide-react";
import { ContactDialog } from "@/components/common/ContactDialog";
import { favouritesApi, isMongoObjectId } from "@/lib/services/favourites.service";

interface BusSearchCardProps {
  bus: {
    _id?: string;
    id?: string;
    service_name?: string;
    company_name?: string;
    vehicle_type?: string;
    bus_type?: string;
    departure_location: string;
    arrival_location: string;
    departure_time: string;
    arrival_time: string;
    duration: string;
    price: number;
    available_seats: number;
    rating: number;
    total_reviews: number;
    amenities: string[];
    image?: string;
  };
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "WiFi": Wifi,
  "Điều hòa": Wind,
  "Nước uống": Coffee,
  "TV": Tv,
  "Chăn gối": Users,
  "Massage": Users,
};

export function BusSearchCard({ bus }: BusSearchCardProps) {
  const [showContact, setShowContact] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const busRefId = bus._id || bus.id;
  const canFavourite = isMongoObjectId(busRefId);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (!token || !canFavourite) return;
    favouritesApi
      .check("transport", busRefId as string)
      .then((res) => setIsSaved(!!res.data?.favourited))
      .catch(() => {});
  }, [busRefId, canFavourite]);

  const toggleFavourite = async () => {
    if (!canFavourite || isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await favouritesApi.remove("transport", busRefId as string);
        setIsSaved(false);
      } else {
        await favouritesApi.add("transport", busRefId as string);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Toggle favourite failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <ContactDialog
      open={showContact}
      onOpenChange={setShowContact}
      itemType="bus"
      itemName={bus.company_name || bus.service_name}
    />
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Company Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">{(bus.company_name || bus.service_name)?.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{bus.company_name || bus.service_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                  {bus.bus_type || bus.vehicle_type}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">{bus.rating}</span>
                  <span className="text-gray-500 text-xs">({bus.total_reviews})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Điểm đi</div>
              <div className="font-semibold text-gray-900 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                {bus.departure_time}
              </div>
              <div className="text-sm text-gray-600">{bus.departure_location}</div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="h-px bg-gray-300 flex-1"></div>
                <Clock className="w-4 h-4" />
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{bus.duration}</div>
            </div>

            <div className="text-right md:text-left">
              <div className="text-xs text-gray-500 mb-1">Điểm đến</div>
              <div className="font-semibold text-gray-900 flex items-center gap-1 justify-end md:justify-start">
                <MapPin className="w-4 h-4 text-red-600" />
                {bus.arrival_time}
              </div>
              <div className="text-sm text-gray-600">{bus.arrival_location}</div>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
            {bus.amenities.map((amenity, index) => {
              const Icon = amenityIcons[amenity] || Coffee;
              return (
                <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                  <Icon className="w-3 h-3" />
                  <span>{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price & Booking */}
        <div className="flex md:flex-col items-end justify-between md:justify-start gap-4 md:w-48 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Còn {bus.available_seats} ghế</div>
            <div className="text-2xl font-bold text-blue-600">
              {bus.price.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-xs text-gray-500 mt-1">/ khách</div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowContact(true)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Liên hệ tư vấn
            </Button>
            {isLoggedIn && canFavourite && (
              <Button
                variant="outline"
                size="sm"
                disabled={isSaving}
                className={`w-full ${isSaved ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-600'}`}
                onClick={toggleFavourite}
              >
                <Heart className={`w-4 h-4 mr-1 ${isSaved ? 'fill-red-500' : ''}`} />
                {isSaved ? 'Đã lưu' : 'Lưu yêu thích'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronUp, ChevronDown } from "lucide-react";

export function BusSearchSidebar() {
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [departureTimeExpanded, setDepartureTimeExpanded] = useState(true);
  const [busTypeExpanded, setBusTypeExpanded] = useState(true);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(true);
  const [ratingExpanded, setRatingExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h3 className="font-bold text-lg mb-4">Bộ lọc tìm kiếm</h3>

      {/* Price Range */}
      <div className="mb-6 pb-6 border-b">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-sm">Khoảng giá</span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500000}
          step={10000}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{priceRange[0].toLocaleString('vi-VN')} ₫</span>
          <span>{priceRange[1].toLocaleString('vi-VN')} ₫</span>
        </div>
      </div>

      {/* Departure Time */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => setDepartureTimeExpanded(!departureTimeExpanded)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-sm">Giờ khởi hành</span>
          {departureTimeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {departureTimeExpanded && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="time-morning" />
              <span className="text-sm">Sáng sớm (00:00 - 06:00)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="time-day" />
              <span className="text-sm">Buổi sáng (06:00 - 12:00)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="time-afternoon" />
              <span className="text-sm">Buổi chiều (12:00 - 18:00)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="time-evening" />
              <span className="text-sm">Buổi tối (18:00 - 24:00)</span>
            </label>
          </div>
        )}
      </div>

      {/* Bus Type */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => setBusTypeExpanded(!busTypeExpanded)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-sm">Loại xe</span>
          {busTypeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {busTypeExpanded && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="type-limousine" />
              <span className="text-sm">Limousine</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="type-sleeper" />
              <span className="text-sm">Giường nằm</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="type-seat" />
              <span className="text-sm">Ghế ngồi</span>
            </label>
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => setAmenitiesExpanded(!amenitiesExpanded)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-sm">Tiện nghi</span>
          {amenitiesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {amenitiesExpanded && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="amenity-wifi" />
              <span className="text-sm">WiFi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="amenity-ac" />
              <span className="text-sm">Điều hòa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="amenity-water" />
              <span className="text-sm">Nước uống</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="amenity-blanket" />
              <span className="text-sm">Chăn gối</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="amenity-massage" />
              <span className="text-sm">Ghế massage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="amenity-tv" />
              <span className="text-sm">TV/Giải trí</span>
            </label>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-6">
        <button
          onClick={() => setRatingExpanded(!ratingExpanded)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-sm">Đánh giá</span>
          {ratingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {ratingExpanded && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="rating-5" />
              <span className="text-sm">5 sao</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="rating-4" />
              <span className="text-sm">4 sao trở lên</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="rating-3" />
              <span className="text-sm">3 sao trở lên</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

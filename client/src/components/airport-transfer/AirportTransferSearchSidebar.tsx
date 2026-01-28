"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronUp, ChevronDown } from "lucide-react";

export function AirportTransferSearchSidebar() {
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [vehicleTypeExpanded, setVehicleTypeExpanded] = useState(true);
  const [featuresExpanded, setFeaturesExpanded] = useState(true);
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
          max={1000000}
          step={50000}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{priceRange[0].toLocaleString('vi-VN')} ₫</span>
          <span>{priceRange[1].toLocaleString('vi-VN')} ₫</span>
        </div>
      </div>

      {/* Vehicle Type */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => setVehicleTypeExpanded(!vehicleTypeExpanded)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-sm">Loại xe</span>
          {vehicleTypeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {vehicleTypeExpanded && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="vehicle-sedan" />
              <span className="text-sm">Sedan 4 chỗ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="vehicle-suv" />
              <span className="text-sm">SUV 7 chỗ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="vehicle-limousine" />
              <span className="text-sm">Limousine 9 chỗ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="vehicle-van" />
              <span className="text-sm">Van 16 chỗ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="vehicle-luxury" />
              <span className="text-sm">Xe sang</span>
            </label>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => setFeaturesExpanded(!featuresExpanded)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-sm">Tiện nghi</span>
          {featuresExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {featuresExpanded && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="feature-pro-driver" />
              <span className="text-sm">Driver chuyên nghiệp</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="feature-english" />
              <span className="text-sm">Driver tiếng Anh</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="feature-wifi" />
              <span className="text-sm">WiFi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="feature-water" />
              <span className="text-sm">Nước uống</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="feature-newspaper" />
              <span className="text-sm">Báo chí</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="feature-massage" />
              <span className="text-sm">Ghế massage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox id="feature-luggage" />
              <span className="text-sm">Hành lý nhiều</span>
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

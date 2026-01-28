"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function TourSearchSidebar() {
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    duration: true,
    type: true,
    rating: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="space-y-4">
      {/* Price Filter */}
      <Card className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => toggleSection('price')}
        >
          <h3 className="font-bold text-sm">Giá tour</h3>
          {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        
        {expandedSections.price && (
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={20000000}
              step={500000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{formatPrice(priceRange[0])} VNĐ</span>
              <span className="text-gray-600">{formatPrice(priceRange[1])} VNĐ</span>
            </div>
          </div>
        )}
      </Card>

      {/* Duration Filter */}
      <Card className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => toggleSection('duration')}
        >
          <h3 className="font-bold text-sm">Thời gian tour</h3>
          {expandedSections.duration ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        
        {expandedSections.duration && (
          <div className="space-y-2">
            {[
              { label: "1-2 ngày", value: "1-2" },
              { label: "3-4 ngày", value: "3-4" },
              { label: "5-7 ngày", value: "5-7" },
              { label: "Trên 7 ngày", value: "7+" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox id={`duration-${option.value}`} />
                <Label
                  htmlFor={`duration-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tour Type Filter */}
      <Card className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => toggleSection('type')}
        >
          <h3 className="font-bold text-sm">Loại tour</h3>
          {expandedSections.type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        
        {expandedSections.type && (
          <div className="space-y-2">
            {[
              { label: "Tour miền Bắc", value: "north" },
              { label: "Tour miền Trung", value: "central" },
              { label: "Tour miền Nam", value: "south" },
              { label: "Tour biển đảo", value: "beach" },
              { label: "Tour núi rừng", value: "mountain" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox id={`type-${option.value}`} />
                <Label
                  htmlFor={`type-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Rating Filter */}
      <Card className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => toggleSection('rating')}
        >
          <h3 className="font-bold text-sm">Đánh giá</h3>
          {expandedSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        
        {expandedSections.rating && (
          <div className="space-y-2">
            {[5, 4, 3, 2].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox id={`rating-${rating}`} />
                <Label
                  htmlFor={`rating-${rating}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1"
                >
                  <span>⭐</span>
                  <span>{rating}+ sao</span>
                </Label>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Reset Filters */}
      <Button variant="outline" className="w-full">
        Xóa bộ lọc
      </Button>
    </div>
  );
}

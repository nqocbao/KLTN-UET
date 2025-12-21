"use client";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { useState } from "react";

export function HotelSearchSidebar() {
  const [priceRange, setPriceRange] = useState([0, 24000000]);

  return (
    <div className="space-y-6">
      {/* Map Widget */}
      <div className="bg-blue-100 rounded-xl p-4 h-32 flex items-center justify-center relative overflow-hidden cursor-pointer group">
         <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Nha+Trang&zoom=12&size=400x200&sensor=false')] bg-cover opacity-50"></div>
         <div className="relative z-10 bg-white/90 px-4 py-2 rounded-full text-blue-600 font-bold shadow-sm group-hover:scale-105 transition-transform">
           Explore on Map
         </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4 border-b border-gray-200 pb-6">
        <h3 className="font-bold text-gray-900">Khoảng giá</h3>
        <p className="text-sm text-gray-500">1 phòng, 1 đêm</p>
        
        <Slider
          defaultValue={[0, 24000000]}
          max={24000000}
          step={100000}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mt-6"
        />
        
        <div className="flex items-center justify-between text-sm font-medium text-gray-700">
           <span className="border p-2 rounded w-24 text-center">{priceRange[0].toLocaleString()}0</span>
           <span>-</span>
           <span className="border p-2 rounded w-24 text-center">{priceRange[1] >= 24000000 ? "24tr+" : priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Popular Filters */}
      <div className="space-y-4 border-b border-gray-200 pb-6">
         <h3 className="font-bold text-gray-900">Lọc phổ biến</h3>
         
         <div className="space-y-3">
           {["Cam kết giá tốt", "Có bữa sáng", "4-5 sao giá tốt", "Vị trí thuận tiện", "Phù hợp cho gia đình"].map((label) => (
             <div key={label} className="flex items-center space-x-2">
               <Checkbox id={label} />
               <label htmlFor={label} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                 {label}
               </label>
             </div>
           ))}
         </div>
      </div>

      {/* Star Rating */}
      <div className="space-y-4 border-b border-gray-200 pb-6">
         <h3 className="font-bold text-gray-900">Hạng sao</h3>
         <div className="space-y-3">
           {[5, 4, 3, 2, 1].map((star) => (
             <div key={star} className="flex items-center space-x-2">
               <Checkbox id={`star-${star}`} />
               <label htmlFor={`star-${star}`} className="text-sm font-medium leading-none flex items-center text-gray-700">
                 {star} <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 ml-1" />
               </label>
             </div>
           ))}
         </div>
      </div>

    </div>
  );
}

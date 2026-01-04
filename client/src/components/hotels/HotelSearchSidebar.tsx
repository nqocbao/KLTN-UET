"use client";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";

interface HotelSearchSidebarProps {
  rooms: number;
  nights: number;
}

export function HotelSearchSidebar({ rooms, nights }: HotelSearchSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialMin = parseInt(searchParams.get("minPrice") || "0");
  const initialMax = parseInt(searchParams.get("maxPrice") || "24000000");
  const [priceRange, setPriceRange] = useState([initialMin, initialMax]);

  // Sync with URL if it changes from outside
  useEffect(() => {
    const min = parseInt(searchParams.get("minPrice") || "0");
    const max = parseInt(searchParams.get("maxPrice") || "24000000");
    setPriceRange([min, max]);
  }, [searchParams]);

  // Simple debounce
  const timerRef = useRef<NodeJS.Timeout>(null);
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("minPrice", value[0].toString());
      params.set("maxPrice", value[1].toString());
      router.push(`?${params.toString()}`);
    }, 500);
  };

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
        <p className="text-sm text-gray-500">{rooms} phòng, {nights} đêm</p>
        
        <Slider
          defaultValue={[0, 24000000]}
          max={24000000}
          step={100000}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="mt-6"
        />
        
        <div className="flex items-center justify-between text-sm font-medium text-gray-700">
           <div className="flex flex-col gap-1">
             <span className="text-[10px] text-gray-400">Từ</span>
             <span className="border p-2 rounded w-24 text-center">{priceRange[0].toLocaleString()}</span>
           </div>
           <span>-</span>
           <div className="flex flex-col gap-1">
             <span className="text-[10px] text-gray-400">Đến</span>
             <span className="border p-2 rounded w-24 text-center">{priceRange[1] >= 24000000 ? "24tr+" : priceRange[1].toLocaleString()}</span>
           </div>
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

"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { TourSearchHeader } from "@/components/tours/TourSearchHeader";
import { TourSearchSidebar } from "@/components/tours/TourSearchSidebar";
import { TourSearchCard } from "@/components/tours/TourSearchCard";
import { toursApi } from "@/lib/services";
import type { Tour } from "@/types/api";
import { ListFilter, Map as MapIcon, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOCK_TOURS: Tour[] = [
  {
    _id: "1",
    name: "Tour Hà Nội - Hạ Long - Sapa 4N3Đ",
    description: "Khám phá vẻ đẹp miền Bắc với Vịnh Hạ Long kỳ vĩ và Sapa mờ sương",
    duration_days: 4,
    price: 6500000,
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"]
  },
  {
    _id: "2",
    name: "Tour Đà Nẵng - Hội An - Bà Nà 3N2Đ",
    description: "Trải nghiệm miền Trung với biển xanh cát trắng và phố cổ Hội An",
    duration_days: 3,
    price: 4200000,
    rating: 4.9,
    images: ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80"]
  },
  {
    _id: "3",
    name: "Tour Phú Quốc 4N3Đ",
    description: "Nghỉ dưỡng tại đảo ngọc Phú Quốc với bãi biển đẹp nhất Việt Nam",
    duration_days: 4,
    price: 7800000,
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80"]
  },
  {
    _id: "4",
    name: "Tour Đà Lạt 3N2Đ",
    description: "Thành phố ngàn hoa với khí hậu mát mẻ quanh năm",
    duration_days: 3,
    price: 3500000,
    rating: 4.6,
    images: ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80"]
  }
] as any[];

export default function TourSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get search params
  const location = searchParams.get("location") || "";
  const destination_id = searchParams.get("destination_id") || "";
  const location_id = searchParams.get("location_id") || "";
  const location_type = searchParams.get("location_type") || "";
  const departure_province_id = searchParams.get("departure_province_id") || "";
  const departure = searchParams.get("departure") || "";
  const guests = parseInt(searchParams.get("guests") || "2");
  const sortBy = searchParams.get("sortBy") || "popularity";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const fetchTours = async () => {
      console.log(`[TourSearchPage] Fetching with:`, {
        location,
        destination_id,
        location_id,
        location_type,
        departure_province_id,
        departure,
        sortBy,
        minPrice,
        maxPrice,
        from,
        to
      });
      setLoading(true);
      try {
        const res = await toursApi.getAll({ 
          limit: 20,
          location: location || undefined,
          destination_id: destination_id || undefined,
          location_id: location_id || undefined,
          location_type: location_type || undefined,
          departure_province_id: departure_province_id || undefined,
          departure: departure || undefined,
          sortBy: sortBy,
          minPrice: minPrice,
          maxPrice: maxPrice,
          from: from || undefined,
          to: to || undefined,
        });
        
        console.log('[TourSearchPage] API Response:', res);
        
        if (res.success && res.data) {
          console.log(`[TourSearchPage] Found ${res.data.length} tours from API`);
          setTours(res.data);
        } else {
          console.log('[TourSearchPage] No tours found from API');
          setTours([]);
        }
      } catch (error) {
        console.error("Failed to fetch tours", error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [location, destination_id, location_id, location_type, departure_province_id, departure, guests, sortBy, from, to, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="blue" />
      
      {/* Spacer for fixed header */}
      <div className="pt-[100px]">
        <TourSearchHeader />
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Dynamic Header Info */}
        <div className="flex justify-between items-end mb-6">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">
               {location || "Tất cả điểm đến"}
               {departure && ` - Khởi hành từ ${departure}`}
             </h1>
             <p className="text-gray-500">{tours.length} tour được tìm thấy</p>
           </div>
           
           <div className="flex gap-4">
             <div className="flex items-center gap-2">
               <span className="text-sm text-gray-600">Xếp theo:</span>
               <Select value={sortBy} onValueChange={handleSortChange}>
                 <SelectTrigger className="w-[180px] h-9 bg-white text-blue-600 border-blue-200">
                   <SelectValue placeholder="Chọn kiểu xếp" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="popularity">Độ phổ biến</SelectItem>
                   <SelectItem value="price_asc">
                     <span className="flex items-center gap-1">Giá thấp nhất <ArrowUp className="w-4 h-4" /></span>
                   </SelectItem>
                   <SelectItem value="price_desc">
                     <span className="flex items-center gap-1">Giá cao nhất <ArrowDown className="w-4 h-4" /></span>
                   </SelectItem>
                   <SelectItem value="alphabet">Mặc định (A-Z)</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded">
                  <ListFilter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded text-gray-400">
                   <MapIcon className="w-4 h-4" />
                </Button>
             </div>
           </div>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-[280px] shrink-0">
             <TourSearchSidebar />
          </div>

          {/* Main List */}
          <div className="flex-1 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-[250px] bg-white rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                tours.map((tour) => (
                  <TourSearchCard key={tour._id} tour={tour} />
                ))
              )}

              {!loading && tours.length === 0 && (
                 <div className="text-center py-20">
                   <p className="text-gray-500">Không tìm thấy tour nào.</p>
                 </div>
              )}
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  );
}

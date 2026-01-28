"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { HotelSearchHeader } from "@/components/hotels/HotelSearchHeader";
import { HotelSearchSidebar } from "@/components/hotels/HotelSearchSidebar";
import { HotelSearchCard } from "@/components/hotels/HotelSearchCard";
import { hotelsApi } from "@/lib/services";
import type { Hotel } from "@/types/api";
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

const MOCK_HOTELS: Hotel[] = [
  // ... (keeping same mock data)
  {
    _id: "1",
    name: "Vinpearl Resort & Spa Nha Trang Bay",
    location: "Đảo Hòn Tre, Nha Trang",
    rating: 4.8,
    priceTwoSingleBed: 3500000,
    images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80"]
  },
  {
    _id: "2",
    name: "Amiana Resort Nha Trang",
    location: "Vịnh Nha Trang, Phạm Văn Đồng, Nha Trang",
    rating: 4.9,
    priceTwoSingleBed: 5200000,
    images: ["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80"]
  },
  {
    _id: "3",
    name: "Sheraton Nha Trang Hotel & Spa",
    location: "26-28 Trần Phú, Nha Trang",
    rating: 4.7,
    priceTwoSingleBed: 2800000,
    images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"]
  },
  {
    _id: "4",
    name: "Liberty Central Nha Trang Hotel",
    location: "9 Biệt Thự, Lộc Thọ, Nha Trang",
    rating: 4.5,
    priceTwoSingleBed: 1500000,
    images: ["https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80"]
  }
] as any[];

export default function HotelSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get search params
  const location = searchParams.get("location") || "";
  const rooms = parseInt(searchParams.get("rooms") || "1");
  const adults = parseInt(searchParams.get("adults") || "2");
  const children = parseInt(searchParams.get("children") || "0");
  const sortBy = searchParams.get("sortBy") || "popularity";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;

  // Calculate nights
  const calculateNights = () => {
    if (!from || !to) return 1;
    const startDate = new Date(from);
    const endDate = new Date(to);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const fetchHotels = async () => {
      console.log(`[HotelSearchPage] Fetching with: location="${location}", sortBy="${sortBy}", nights=${nights}, price=[${minPrice}, ${maxPrice}]`);
      setLoading(true);
      try {
        const res = await hotelsApi.getAll({ 
          limit: 20,
          location: location || undefined,
          sortBy: sortBy,
          minPrice: minPrice,
          maxPrice: maxPrice,
          from: from || undefined,
          to: to || undefined
        });
        
        console.log('[HotelSearchPage] API Response:', res);
        
        if (res.success && res.data && res.data.length > 0) {
          console.log(`[HotelSearchPage] Found ${res.data.length} hotels from API`);
          setHotels(res.data);
        } else {
          console.log('[HotelSearchPage] No hotels from API, using mock data');
          // If no results from API, show mock data and sort/filter locally
          let filteredMock = !location ? [...MOCK_HOTELS] : MOCK_HOTELS.filter(h => 
            h.location.toLowerCase().includes(location.toLowerCase()) ||
            h.name.toLowerCase().includes(location.toLowerCase())
          );

          // Apply price filter locally (Total price based on nights)
          if (minPrice !== undefined) {
            filteredMock = filteredMock.filter(h => ((h.priceTwoSingleBed || 0) * nights) >= minPrice);
          }
          if (maxPrice !== undefined) {
            filteredMock = filteredMock.filter(h => ((h.priceTwoSingleBed || 0) * nights) <= maxPrice);
          }

          if (sortBy === "price_asc") {
            filteredMock.sort((a, b) => (a.priceTwoSingleBed || 0) - (b.priceTwoSingleBed || 0));
          } else if (sortBy === "price_desc") {
            filteredMock.sort((a, b) => (b.priceTwoSingleBed || 0) - (a.priceTwoSingleBed || 0));
          } else if (sortBy === "alphabet") {
            filteredMock.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          } else {
            // popularity as default
            filteredMock.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          }
          
          setHotels(filteredMock);
        }
      } catch (error) {
        console.error("Failed to fetch hotels", error);
        // On error, show mock data
        setHotels(MOCK_HOTELS);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [location, rooms, adults, children, sortBy, from, to, minPrice, maxPrice, nights]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="blue" />
      
      {/* Spacer for fixed header */}
      <div className="pt-[110px]">
        <HotelSearchHeader />
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Dynamic Header Info */}
        <div className="flex justify-between items-end mb-6">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">{location || "Tất cả địa điểm"}</h1>
             <p className="text-gray-500">{hotels.length} nơi lưu trú được tìm thấy</p>
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
              <div className="hidden md:flex items-center gap-2">
               <span className="text-sm text-gray-600">Hiển thị giá:</span>
               <Button variant="outline" className="h-9 bg-white text-blue-600 border-blue-200">
                 {nights > 1 ? "Tùy chọn" : "Mỗi phòng mỗi đêm"} <ChevronDown className="w-4 h-4 ml-1" />
               </Button>
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
             <HotelSearchSidebar rooms={rooms} nights={nights} />
          </div>

          {/* Main List */}
          <div className="flex-1 space-y-4">
              {/* Promo Banner */}
              {/* <div className="bg-[#469ae3] text-white p-4 rounded-xl flex justify-between items-center shadow-md mb-6">
                 <div>
                   <h3 className="font-bold text-lg">Mã giảm đến 500K chỉ dành cho App. Mở App đặt ngay!</h3>
                 </div>
              </div> */}

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-[200px] bg-white rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                hotels.map((hotel) => (
                  <HotelSearchCard key={hotel._id} hotel={hotel} nights={nights} />
                ))
              )}

              {!loading && hotels.length === 0 && (
                 <div className="text-center py-20">
                   <p className="text-gray-500">Không tìm thấy khách sạn nào.</p>
                 </div>
              )}
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  );
}

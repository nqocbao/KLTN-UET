"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { HotelSearchHeader } from "@/components/hotels/HotelSearchHeader";
import { HotelSearchSidebar } from "@/components/hotels/HotelSearchSidebar";
import { HotelSearchCard } from "@/components/hotels/HotelSearchCard";
import { hotelsApi } from "@/lib/services";
import type { Hotel } from "@/types/api";
import { ListFilter, Map as MapIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

const MOCK_HOTELS: Hotel[] = [
  {
    _id: "1",
    name: "Vinpearl Resort & Spa Nha Trang Bay",
    location: "Đảo Hòn Tre, Nha Trang",
    rating: 4.8,
    priceTwoSingleBed: 3500000,
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80"
    ],
    amenities: ["Free Wifi", "Breakfast", "Parking", "Pool", "Spa"]
  },
  {
    _id: "2",
    name: "Amiana Resort Nha Trang",
    location: "Vịnh Nha Trang, Phạm Văn Đồng, Nha Trang",
    rating: 4.9,
    priceTwoSingleBed: 5200000,
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
      "https://images.unsplash.com/photo-1544124499-58912cbddade?w=400&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80"
    ],
    amenities: ["Private Beach", "Pool", "Gym", "Restaurant"]
  },
  {
    _id: "3",
    name: "Sheraton Nha Trang Hotel & Spa",
    location: "26-28 Trần Phú, Nha Trang",
    rating: 4.7,
    priceTwoSingleBed: 2800000,
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=400&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&q=80"
    ],
    amenities: ["Ocean View", "RooftopBar", "Spa", "International Buffet"]
  },
  {
    _id: "4",
    name: "Liberty Central Nha Trang Hotel",
    location: "9 Biệt Thự, Lộc Thọ, Nha Trang",
    rating: 4.5,
    priceTwoSingleBed: 1500000,
    images: [
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
      "https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?w=400&q=80",
      "https://images.unsplash.com/photo-1517840901100-8179e982ad91?w=400&q=80",
      "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400&q=80"
    ],
    amenities: ["City Center", "Gym", "Pool", "Bar"]
  }
] as any[];

export default function HotelSearchPage() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get search params
  const rooms = parseInt(searchParams.get("rooms") || "1");
  const adults = parseInt(searchParams.get("adults") || "2");
  const children = parseInt(searchParams.get("children") || "0");

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await hotelsApi.getAll({ limit: 20 });
        if (res.success && res.data.length > 0) {
          // Merge mock data with real data to ensure high quality visuals
          const merged = [...MOCK_HOTELS, ...res.data.filter((h: any) => !MOCK_HOTELS.find(m => m.name === h.name))];
          setHotels(merged);
        } else {
          setHotels(MOCK_HOTELS);
        }
      } catch (error) {
        console.error("Failed to fetch hotels", error);
        setHotels(MOCK_HOTELS);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [rooms, adults, children]);

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
             <h1 className="text-2xl font-bold text-gray-900">Nha Trang</h1>
             <p className="text-gray-500">{hotels.length} nơi lưu trú được tìm thấy</p>
           </div>
           
           <div className="flex gap-4">
             <div className="flex items-center gap-2">
               <span className="text-sm text-gray-600">Xếp theo:</span>
               <Button variant="outline" className="h-9 bg-white text-blue-600 border-blue-200">
                 Độ phổ biến <ChevronDown className="w-4 h-4 ml-1" />
               </Button>
             </div>
              <div className="flex items-center gap-2">
               <span className="text-sm text-gray-600">Hiển thị giá:</span>
               <Button variant="outline" className="h-9 bg-white text-blue-600 border-blue-200">
                 Mỗi phòng mỗi đêm <ChevronDown className="w-4 h-4 ml-1" />
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
             <HotelSearchSidebar />
          </div>

          {/* Main List */}
          <div className="flex-1 space-y-4">
              {/* Promo Banner */}
              {/* <div className="bg-[#1ba0e2] text-white p-4 rounded-xl flex justify-between items-center shadow-md mb-6">
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
                  <HotelSearchCard key={hotel._id} hotel={hotel} />
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

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { BusSearchHeader } from "@/components/buses/BusSearchHeader";
import { BusSearchCard } from "@/components/buses/BusSearchCard";
import { BusSearchSidebar } from "@/components/buses/BusSearchSidebar";
import { ListFilter, Map as MapIcon, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { busService, type Bus } from "@/lib/services/transportation.service";

export default function BusSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const sortBy = searchParams.get("sortBy") || "price_asc";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        
        // Get search params
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const date = searchParams.get("date");
        const sortBy = searchParams.get("sortBy") || "price_asc";
        
        console.log("Fetching buses with params:", { from, to, date, sortBy });

        // Call API
        const response = await busService.searchBuses({
          from: from || undefined,
          to: to || undefined,
          date: date || undefined,
          sortBy: sortBy as 'price_asc' | 'price_desc' | 'rating_high' | 'departure_early' | 'duration_short',
        });
        
        if (response.success) {
          setBuses(response.data);
        } else {
          setBuses([]);
        }
      } catch (error) {
        console.error("Error fetching buses:", error);
        setBuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="blue" />
      
      {/* Spacer for fixed header */}
      <div className="pt-[110px]">
        <BusSearchHeader />
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Dynamic Header Info */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{from && to ? `${from} → ${to}` : "Tìm kiếm vé xe khách"}</h1>
            <p className="text-gray-500">{buses.length} chuyến xe được tìm thấy</p>
          </div>
           
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Xếp theo:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[200px] h-9 bg-white text-blue-600 border-blue-200">
                  <SelectValue placeholder="Chọn kiểu xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">
                    <span className="flex items-center gap-1">Giá thấp nhất <ArrowUp className="w-4 h-4" /></span>
                  </SelectItem>
                  <SelectItem value="departure_early">Khởi hành sớm nhất</SelectItem>
                  <SelectItem value="duration_short">Thời gian ngắn nhất</SelectItem>
                  <SelectItem value="rating_high">Đánh giá cao nhất</SelectItem>
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
            <BusSearchSidebar />
          </div>

          {/* Main List */}
          <div className="flex-1 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[200px] bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : buses.length > 0 ? (
              buses.map((bus) => (
                <BusSearchCard key={bus._id} bus={bus} />
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500">Không tìm thấy chuyến xe nào.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

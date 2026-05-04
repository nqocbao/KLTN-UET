"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestRoomPicker, type GuestRoomValue } from "@/components/ui/guest-room-picker";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { useRouter, useSearchParams } from "next/navigation";

// Helper function to format date for display
function formatDateShort(date: Date | null | undefined): string {
  if (!date) return "";
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day} thg ${month} ${year}`;
}

export function HotelSearchHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse URL params
  const [location, setLocation] = useState(searchParams.get("location") || "");
  
  const [guestRoom, setGuestRoom] = useState<GuestRoomValue>({
    rooms: parseInt(searchParams.get("rooms") || "1"),
    adults: parseInt(searchParams.get("adults") || "2"),
    children: parseInt(searchParams.get("children") || "0"),
  });
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(),
    to: searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Sync state with URL if it changes (e.g. back/forward or navigation)
  useEffect(() => {
    const loc = searchParams.get("location");
    if (loc) setLocation(loc);
    
    const r = searchParams.get("rooms");
    const a = searchParams.get("adults");
    const c = searchParams.get("children");
    if (r || a || c) {
      setGuestRoom({
        rooms: parseInt(r || "1"),
        adults: parseInt(a || "2"),
        children: parseInt(c || "0"),
      });
    }

    const f = searchParams.get("from");
    const t = searchParams.get("to");
    if (f && t) {
      setDateRange({
        from: new Date(f),
        to: new Date(t),
      });
    }
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    params.set("rooms", guestRoom.rooms.toString());
    params.set("adults", guestRoom.adults.toString());
    params.set("children", guestRoom.children.toString());
    if (dateRange?.from) params.set("from", dateRange.from.toISOString());
    if (dateRange?.to) params.set("to", dateRange.to.toISOString());
    const sortBy = searchParams.get("sortBy");
    if (sortBy) params.set("sortBy", sortBy);
    const minP = searchParams.get("minPrice");
    const maxP = searchParams.get("maxPrice");
    if (minP) params.set("minPrice", minP);
    if (maxP) params.set("maxPrice", maxP);
    
    router.push(`/vi/hotels/search?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-[104px] z-30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white md:bg-gray-100 rounded-full p-2 md:p-1 border border-gray-200 md:border-none">
          
          {/* Location */}
          <div className="flex-1 min-w-[150px] relative px-4 py-2 border-r border-gray-300">
            <div className="text-xs text-gray-500 mb-0.5">Thành phố, địa điểm hoặc tên khách sạn:</div>
            <div className="flex items-center gap-2">
               <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
               <LocationAutocomplete
                 value={location}
                 onChange={setLocation}
                 placeholder="Nhập địa điểm..."
                 mode="hotels-only"
               />
            </div>
          </div>

          {/* Date */}
          <div className="flex-1 min-w-[200px] relative px-4 py-2 border-r border-gray-300 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
             <div className="text-xs text-gray-500 mb-0.5">Ngày nhận phòng & trả phòng</div>
             <DateRangePicker
               value={dateRange}
               onChange={setDateRange}
               open={datePickerOpen}
               onOpenChange={setDatePickerOpen}
             >
               <div className="flex items-center gap-2 font-medium text-gray-900 truncate">
                 <Calendar className="w-4 h-4 text-blue-500" />
                 {dateRange?.from && dateRange?.to 
                   ? `${formatDateShort(dateRange.from)} - ${formatDateShort(dateRange.to)}`
                   : "Chọn ngày"
                 }
               </div>
             </DateRangePicker>
          </div>

          {/* Guests */}
          <div className="flex-1 min-w-[150px] relative px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
             <div className="text-xs text-gray-500 mb-0.5">Khách và phòng</div>
             <GuestRoomPicker
               value={guestRoom}
               onChange={setGuestRoom}
             >
               <div className="flex items-center gap-2 font-medium text-gray-900 truncate">
                 <User className="w-4 h-4 text-blue-500" />
                 {`${guestRoom.adults} người lớn, ${guestRoom.children} trẻ em, ${guestRoom.rooms} phòng`}
               </div>
             </GuestRoomPicker>
          </div>

          <Button 
            className="rounded-full bg-blue-500 hover:bg-blue-600 px-6 h-10 w-full md:w-auto"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </Button>

        </div>
      </div>
    </div>
  );
}

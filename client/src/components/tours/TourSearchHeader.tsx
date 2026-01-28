"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { GuestRoomPicker, type GuestRoomValue } from "@/components/ui/guest-room-picker";
import { MapPin, Calendar, User, Search } from "lucide-react";
import { useRouter } from "next/navigation";

function formatDateShort(date: Date | null | undefined): string {
  if (!date) return "";
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
}

export function TourSearchHeader() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [guestRoom, setGuestRoom] = useState<GuestRoomValue>({
    rooms: 1,
    adults: 2,
    children: 0,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    params.set("guests", (guestRoom.adults + guestRoom.children).toString());
    if (dateRange?.from) params.set("from", dateRange.from.toISOString());
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-[#f1f1f1] border-b border-blue-400 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="bg-white rounded-lg p-2 shadow-xl grid grid-cols-12 gap-0.5">
          {/* Destination */}
          <div className="col-span-12 md:col-span-4 relative group">
            <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Điểm đến:</div>
            <div className="relative h-14 bg-white rounded-l-md hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3 flex-shrink-0" />
              <div className="pl-12 w-full pt-6 pb-2">
                <LocationAutocomplete 
                  value={location}
                  onChange={setLocation}
                  placeholder="Chọn điểm đến"
                />
              </div>
            </div>
          </div>

          {/* Departure Date */}
          <div className="col-span-12 md:col-span-3 relative group">
            <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Ngày khởi hành</div>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              open={datePickerOpen}
              onOpenChange={setDatePickerOpen}
            >
              <div 
                className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center cursor-pointer"
              >
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                  {dateRange?.from 
                    ? formatDateShort(dateRange.from)
                    : "Chọn ngày"
                  }
                </div>
              </div>
            </DateRangePicker>
          </div>

          {/* Guests & Search */}
          <div className="col-span-12 md:col-span-5 flex">
            <GuestRoomPicker
              value={guestRoom}
              onChange={setGuestRoom}
            >
              <div className="relative flex-1 h-14 bg-white hover:bg-gray-50 transition-colors cursor-pointer group rounded-l-none">
                <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Số khách</div>
                <div className="relative h-full flex items-center">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                    <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                      {`${guestRoom.adults + guestRoom.children} khách`}
                    </div>
                </div>
              </div>
            </GuestRoomPicker>
            
            <Button 
              className="h-14 w-16 bg-[#ff5e1f] hover:bg-[#e04f15] rounded-r-md rounded-l-none shrink-0"
              onClick={handleSearch}
            >
              <Search className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

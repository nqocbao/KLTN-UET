"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LocationAutocomplete, type LocationSuggestion } from "@/components/ui/location-autocomplete";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { MapPin, Calendar, Search } from "lucide-react";
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
  const [selectedDestination, setSelectedDestination] = useState<LocationSuggestion | null>(null);
  const [departureLocation, setDepartureLocation] = useState("");
  const [selectedDeparture, setSelectedDeparture] = useState<LocationSuggestion | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    // Nếu chọn tour trực tiếp → navigate đến tour detail
    if (suggestion.type === 'tour') {
      router.push(`/vi/tours/${suggestion.id}`);
      return;
    }
    
    // Các loại khác → set để search
    setSelectedDestination(suggestion);
    setLocation(suggestion.name);
  };

  const handleDepartureSelect = (suggestion: LocationSuggestion) => {
    setSelectedDeparture(suggestion);
    setDepartureLocation(suggestion.name);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // ĐIỂM ĐẾN: Tìm theo quốc gia hoặc destination
    if (selectedDestination?.id) {
      // Nếu chọn destination (điểm du lịch cụ thể)
      if (selectedDestination.type === "destination") {
        params.set("destination_id", selectedDestination.id);
        // Gửi cả country_id nếu có
        if (selectedDestination.country_id) {
          params.set("country_id", selectedDestination.country_id);
        }
      }
      // Nếu chọn country (quốc gia)
      else if (selectedDestination.type === "country") {
        params.set("country_id", selectedDestination.id);
      }
      // Nếu chọn province (tìm tours đến khu vực đó)
      else if (selectedDestination.type === "province") {
        params.set("location_id", selectedDestination.id);
        params.set("location_type", "province");
      }
    } else if (location) {
      params.set("location", location);
    }
    
    // KHỞI HÀNH TỪ: Tìm theo province (sử dụng departure_location_id)
    if (selectedDeparture?.id) {
      params.set("departure_province_id", selectedDeparture.id);
    } else if (departureLocation) {
      params.set("departure", departureLocation);
    }
    
    // Other search params
    if (dateRange?.from) params.set("from", dateRange.from.toISOString());
    if (dateRange?.to) params.set("to", dateRange.to.toISOString());
    
    // Check if we're already on the search page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/tours/search')) {
      // If on search page, just update params
      router.push(`?${params.toString()}`);
    } else {
      // If on landing page or elsewhere, navigate to search page
      router.push(`/vi/tours/search?${params.toString()}`);
    }
  };

  return (
    <div className="bg-[#f1f1f1] border-b border-blue-400 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="bg-white rounded-lg p-2 shadow-xl grid grid-cols-12 gap-0.5">
          {/* Destination */}
          <div className="col-span-12 md:col-span-4 relative group">
            <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Tìm tour / Điểm đến</div>
            <div className="relative h-14 bg-white rounded-l-md hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3 flex-shrink-0" />
              <div className="pl-12 w-full pt-6 pb-2">
                <LocationAutocomplete 
                  value={location}
                  onChange={setLocation}
                  onSelectLocation={handleLocationSelect}
                  placeholder="Tìm tour, điểm đến..."
                  mode="all"
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
                    ? dateRange.to 
                      ? `${formatDateShort(dateRange.from)} - ${formatDateShort(dateRange.to)}`
                      : formatDateShort(dateRange.from)
                    : "Chọn ngày"
                  }
                </div>
              </div>
            </DateRangePicker>
          </div>

          {/* Departure Location & Search */}
          <div className="col-span-12 md:col-span-5 flex">
            <div className="relative flex-1 h-14 bg-white hover:bg-gray-50 transition-colors group rounded-l-none">
              <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Khởi hành từ</div>
              <div className="relative h-full flex items-center">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3 flex-shrink-0" />
                <div className="pl-12 w-full pt-6 pb-2">
                  <LocationAutocomplete 
                    value={departureLocation}
                    onChange={setDepartureLocation}
                    onSelectLocation={handleDepartureSelect}
                    placeholder="Chọn điểm khởi hành"
                    mode="provinces-only"
                  />
                </div>
              </div>
            </div>
            
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

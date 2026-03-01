"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Plane,
  ArrowRightLeft
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AirportAutocomplete } from "@/components/ui/airport-autocomplete";
import { DatePicker } from "@/components/ui/date-picker";

export function FlightSearchHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse URL params
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : new Date()
  );
  const [passengers, setPassengers] = useState(
    parseInt(searchParams.get("passengers") || "1")
  );
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  // Sync with URL params
  useEffect(() => {
    const f = searchParams.get("from");
    const t = searchParams.get("to");
    const d = searchParams.get("date");
    const p = searchParams.get("passengers");
    
    if (f) setFrom(f);
    if (t) setTo(t);
    if (d) setDepartureDate(new Date(d));
    if (p) setPassengers(parseInt(p));
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (departureDate) params.set("date", departureDate.toISOString());
    params.set("passengers", passengers.toString());
    
    const sortBy = searchParams.get("sortBy");
    if (sortBy) params.set("sortBy", sortBy);
    
    router.push(`/vi/flights/search?${params.toString()}`);
    router.refresh();
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  // Fake dates for the strip
  const dates = [
    { day: "Thứ 2", date: "16 thg 12", price: "2.449.200 VND", active: false },
    { day: "Thứ 3", date: "17 thg 12", price: "2.000.000 VND", active: false },
    { day: "Thứ 4", date: "18 thg 12", price: "1.950.000 VND", active: false },
    { day: "Thứ 5", date: "19 thg 12", price: "1.995.758 VND", active: false },
    { day: "Thứ 6", date: "20 thg 12", price: "2.512.889 VND", active: false },
    { day: "Thứ 7", date: "21 thg 12", price: "2.468.000 VND", active: false },
    { day: "CN", date: "22 thg 12", price: "1.995.758 VND", active: true },
    { day: "Thứ 2", date: "23 thg 12", price: "1.504.000 VND", active: false },
    { day: "Thứ 3", date: "24 thg 12", price: "1.485.000 VND", active: false },
  ];

  return (
    <div className="bg-[#4bc3ff] pb-4 py-4">
      <div className="container mx-auto px-4">
        {/* Combined Row: Route Info + Date Strip */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Left: Route Info */}
          <div className="flex items-center gap-4 w-full lg:w-auto min-w-0 lg:min-w-[400px]">
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => router.back()} 
               className="text-white hover:bg-white/20 shrink-0"
             >
               <ArrowLeft className="w-6 h-6" />
             </Button>
             
             <div 
               className="bg-white/10 backdrop-blur-sm rounded px-4 py-2 flex-1 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/20 transition-colors text-white"
               onClick={() => setShowSearchDialog(!showSearchDialog)}
             >
               <div className="flex flex-col min-w-0">
                  <span className="font-bold flex items-center gap-2 truncate">
                    {from || "Điểm đi"} <span className="text-white/60">→</span> {to || "Điểm đến"}
                  </span>
                  <div className="flex items-center gap-3 text-sm text-white/80 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> 
                      {departureDate?.toLocaleDateString('vi-VN')}
                    </span>
                    <span className="w-px h-3 bg-white/30"></span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {passengers} hành khách
                    </span>
                  </div>
               </div>
               <Search className="w-5 h-5 text-white/80 shrink-0" />
             </div>
          </div>
        
          {/* Right: Date Strip */}
          <div className="relative flex-1 w-full min-w-0">
             <Button 
               variant="ghost" 
               size="icon" 
               className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-black/20 -ml-2 disabled:opacity-30"
             >
               <ChevronLeft className="w-6 h-6" />
             </Button>
             
             <div className="flex gap-2 overflow-x-auto scrollbar-hide px-8 pb-2">
               {dates.map((item, index) => (
                 <div 
                   key={index}
                   className={`
                     min-w-[120px] p-2 rounded cursor-pointer transition-all text-center flex flex-col gap-1
                     ${item.active 
                       ? "bg-white text-blue-600 font-bold shadow-lg transform scale-105" 
                       : "bg-white/10 text-white hover:bg-white/20"
                     }
                   `}
                 >
                   <div className="text-xs">{item.day}, {item.date}</div>
                   <div className="text-xs">{item.price}</div>
                 </div>
               ))}
             </div>
             
             <Button 
               variant="ghost" 
               size="icon" 
               className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-black/20 -mr-2"
             >
               <ChevronRight className="w-6 h-6" />
             </Button>
          </div>
        </div>

        {/* Search Dialog */}
        {showSearchDialog && (
          <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* From */}
              <div className="relative">
                <label className="text-xs text-gray-500 mb-1 block">Điểm đi</label>
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-500" />
                  <AirportAutocomplete
                    value={from}
                    onChange={setFrom}
                    placeholder="Chọn sân bay đi..."
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex items-end justify-center pb-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapLocations}
                  className="rounded-full"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* To */}
              <div className="relative">
                <label className="text-xs text-gray-500 mb-1 block">Điểm đến</label>
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-500" />
                  <AirportAutocomplete
                    value={to}
                    onChange={setTo}
                    placeholder="Chọn sân bay đến..."
                  />
                </div>
              </div>

              {/* Date */}
              <div className="relative">
                <label className="text-xs text-gray-500 mb-1 block">Ngày bay</label>
                <DatePicker
                  date={departureDate}
                  onSelect={setDepartureDate}
                  placeholder="Chọn ngày..."
                />
              </div>

              {/* Passengers */}
              <div className="relative">
                <label className="text-xs text-gray-500 mb-1 block">Hành khách</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={passengers === 0 ? "" : passengers}
                  onChange={(e) => setPassengers(e.target.value === "" ? 0 : parseInt(e.target.value))}
                  onBlur={(e) => { if (e.target.value === "" || passengers < 1) setPassengers(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end md:col-span-2 lg:col-span-3">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Tìm chuyến bay
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

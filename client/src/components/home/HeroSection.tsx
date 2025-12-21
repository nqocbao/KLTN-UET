"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { GuestRoomPicker, type GuestRoomValue } from "@/components/ui/guest-room-picker";
import { Search, Calendar, User, Hotel, Plane, Bus, Car, MapPin, Grid, Home, Building, ChevronDown, ArrowLeftRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

// Helper function to format date for display
function formatDateShort(date: Date | null | undefined): string {
  if (!date) return "";
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day} thg ${month} ${year}`;
}

export function HeroSection() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [guestRoom, setGuestRoom] = useState<GuestRoomValue>({
    rooms: 1,
    adults: 2,
    children: 0,
  });


  return (
    <div className="relative h-[600px] w-full bg-[#1ba0e2] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop")', // Mountains
          filter: 'brightness(0.6)'
        }}
      />
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center pt-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-10 shadow-sm drop-shadow-md">
          Hãy đi cùng VivuTravel để đặt chân đến mọi nơi
        </h1>

        <div className="w-full max-w-6xl">
          <Tabs defaultValue="hotels" className="w-full">
            {/* Main Category Tabs */}
            <TabsList className="flex justify-center gap-2 bg-transparent h-auto p-0 mb-6 flex-wrap">
              <TabsTrigger 
                value="hotels" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:rounded-full bg-transparent text-white/90 hover:bg-white/10 rounded-full px-4 md:px-6 py-2 gap-2 text-sm md:text-base font-medium transition-all"
              >
                <Hotel className="w-5 h-5" /> Khách sạn
              </TabsTrigger>
              <TabsTrigger 
                value="flights" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:rounded-full bg-transparent text-white/90 hover:bg-white/10 rounded-full px-4 md:px-6 py-2 gap-2 text-sm md:text-base font-medium transition-all"
              >
                <Plane className="w-5 h-5" /> Vé máy bay
              </TabsTrigger>
              <TabsTrigger 
                value="bus" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:rounded-full bg-transparent text-white/90 hover:bg-white/10 rounded-full px-4 md:px-6 py-2 gap-2 text-sm md:text-base font-medium transition-all"
              >
                <Bus className="w-5 h-5" /> Vé xe khách
              </TabsTrigger>
              <TabsTrigger 
                value="transfer" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:rounded-full bg-transparent text-white/90 hover:bg-white/10 rounded-full px-4 md:px-6 py-2 gap-2 text-sm md:text-base font-medium transition-all"
              >
                <Car className="w-5 h-5" /> Đưa đón sân bay
              </TabsTrigger>
              <TabsTrigger 
                value="car" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:rounded-full bg-transparent text-white/90 hover:bg-white/10 rounded-full px-4 md:px-6 py-2 gap-2 text-sm md:text-base font-medium transition-all"
              >
                <Car className="w-5 h-5" /> Cho thuê xe
              </TabsTrigger>
              <TabsTrigger 
                value="more" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:rounded-full bg-transparent text-white/90 hover:bg-white/10 rounded-full px-4 md:px-6 py-2 gap-2 text-sm md:text-base font-medium transition-all"
              >
                <Grid className="w-5 h-5" /> Khác
              </TabsTrigger>
            </TabsList>

            {/* Content Area */}
            <TabsContent value="hotels" className="mt-0">
               {/* Sub-options */}
               {/* <div className="flex justify-center gap-3 mb-4 flex-wrap">
                  <Button size="sm" className="rounded-full bg-[#007ce8] hover:bg-[#006bb3] text-white font-medium px-6 h-8">
                    Tất cả
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                    <Hotel className="w-4 h-4 mr-2" /> Khách sạn
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                    <Home className="w-4 h-4 mr-2" /> Biệt thự
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                    <Building className="w-4 h-4 mr-2" /> Căn hộ
                  </Button>
               </div> */}

               {/* Search Bar Container */}
               <div className="bg-white rounded-lg p-2 shadow-xl grid grid-cols-12 gap-0.5">
                  {/* Destination */}
                  <div className="col-span-12 md:col-span-4 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Thành phố, địa điểm hoặc tên khách sạn:</div>
                    <div className="relative h-14 bg-white rounded-l-md hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="Thành phố, khách sạn, điểm đến" 
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-base pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="col-span-12 md:col-span-4 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Ngày nhận phòng và trả phòng</div>
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
                          {dateRange?.from && dateRange?.to 
                            ? `${formatDateShort(dateRange.from)} - ${formatDateShort(dateRange.to)}`
                            : "Chọn ngày"
                          }
                        </div>
                      </div>
                    </DateRangePicker>
                  </div>

                  {/* Guests & Search Button */}
                  <div className="col-span-12 md:col-span-4 flex">
                    <GuestRoomPicker
                      value={guestRoom}
                      onChange={setGuestRoom}
                    >
                      <div className="relative flex-1 h-14 bg-white hover:bg-gray-50 transition-colors cursor-pointer group rounded-l-none">
                        <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Khách và Phòng</div>
                        <div className="relative h-full flex items-center">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                            <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                              {`${guestRoom.adults} người lớn, ${guestRoom.children} trẻ em, ${guestRoom.rooms} phòng`}
                            </div>
                        </div>
                      </div>
                    </GuestRoomPicker>
                    
                    <Button 
                      className="h-14 w-16 bg-[#ff5e1f] hover:bg-[#e04f15] rounded-r-md rounded-l-none shrink-0"
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set("rooms", guestRoom.rooms.toString());
                        params.set("adults", guestRoom.adults.toString());
                        params.set("children", guestRoom.children.toString());
                        if (dateRange?.from) params.set("from", dateRange.from.toISOString());
                        if (dateRange?.to) params.set("to", dateRange.to.toISOString());
                        
                        router.push(`/vi/hotels/search?${params.toString()}`);
                      }}
                    >
                      <Search className="w-6 h-6 text-white" />
                    </Button>
                  </div>
               </div>
            </TabsContent>
            
            {/* Flights Tab */}
            <TabsContent value="flights" className="mt-0">
              {/* Sub-options */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-full bg-[#007ce8] hover:bg-[#006bb3] text-white font-medium px-6 h-8">
                    Một chiều / Khứ hồi
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                    Nhiều thành phố
                  </Button>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <User className="w-4 h-4" />
                    <span>1 Người lớn, 0 Trẻ em, 0 Em bé</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <span>Phổ thông</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Search Bar Container */}
              <div className="bg-white rounded-lg p-2 shadow-xl">
                <div className="grid grid-cols-12 gap-0.5 items-center">
                  {/* From */}
                  <div className="col-span-12 md:col-span-3 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Từ</div>
                    <div className="relative h-14 bg-white rounded-l-md hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="TP HCM (SGN)" 
                        defaultValue="TP HCM (SGN)"
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-base pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Swap Icon */}
                  <div className="hidden md:flex col-span-0 md:col-span-1 justify-center items-center">
                    <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors shadow-sm -mx-5 z-10">
                      <ArrowLeftRight className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>

                  {/* To */}
                  <div className="col-span-12 md:col-span-3 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Đến</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="Bangkok (BKKA)" 
                        defaultValue="Bangkok (BKKA)"
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-base pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Departure Date */}
                  <div className="col-span-12 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Ngày khởi hành</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center cursor-pointer">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                        20 thg 12 2025
                      </div>
                    </div>
                  </div>

                  {/* Return Date + Checkbox */}
                  <div className="col-span-12 md:col-span-2 relative group">
                    <div className="flex items-center gap-2 absolute right-4 top-2 z-10">
                      <input type="checkbox" id="roundTrip" className="w-4 h-4 accent-blue-500" />
                      <label htmlFor="roundTrip" className="text-gray-500 text-xs font-medium">Khứ hồi</label>
                    </div>
                    <div className="relative h-14 bg-gray-100 hover:bg-gray-50 transition-colors flex items-center cursor-pointer">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-base text-gray-400 font-medium truncate">
                        22 thg 12 2025
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="col-span-12 md:col-span-1 flex justify-end">
                    <Button 
                      className="h-14 w-14 bg-[#ff5e1f] hover:bg-[#e04f15] rounded-r-md rounded-l-none shrink-0"
                      onClick={() => router.push("/vi/flights/search")}
                    >
                      <Search className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div className="flex gap-4 mt-4 flex-wrap">
                <Button 
                  size="sm" 
                  className="rounded-full bg-[#007ce8] hover:bg-[#006bb3] text-white font-medium px-4 h-8"
                  onClick={() => router.push("/vi/flights/search")}
                >
                  Tìm kiếm
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                  <Grid className="w-4 h-4 mr-2" /> Khám phá ý tưởng chuyến bay
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                  <Calendar className="w-4 h-4 mr-2" /> Cảnh báo giá
                </Button>
              </div>
            </TabsContent>

            {/* Bus Tab */}
            <TabsContent value="bus" className="mt-0">
              {/* Search Bar Container */}
              <div className="bg-white rounded-lg p-2 shadow-xl">
                <div className="grid grid-cols-12 gap-0.5 items-center">
                  {/* From */}
                  <div className="col-span-12 md:col-span-3 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Điểm đi</div>
                    <div className="relative h-14 bg-white rounded-l-md hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="Hà Nội" 
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-base pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Swap Icon */}
                  <div className="hidden md:flex col-span-0 md:col-span-1 justify-center items-center">
                    <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors shadow-sm -mx-5 z-10">
                      <ArrowLeftRight className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>

                  {/* To */}
                  <div className="col-span-12 md:col-span-3 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Điểm đến</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="Sài Gòn" 
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-base pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Departure Date */}
                  <div className="col-span-12 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Ngày đi</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center cursor-pointer">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                        20 thg 12 2025
                      </div>
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="col-span-12 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Số hành khách</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors flex items-center cursor-pointer">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                        1 người lớn
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="col-span-12 md:col-span-1 flex justify-end">
                    <Button className="h-14 w-14 bg-[#ff5e1f] hover:bg-[#e04f15] rounded-r-md rounded-l-none shrink-0">
                      <Search className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Airport Transfer Tab */}
            <TabsContent value="transfer" className="mt-0">
              {/* Sub-options */}
              <div className="flex gap-2 mb-4">
                <Button size="sm" className="rounded-full bg-[#007ce8] hover:bg-[#006bb3] text-white font-medium px-6 h-8">
                  Đón sân bay
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                  Tiễn sân bay
                </Button>
              </div>

              {/* Search Bar Container */}
              <div className="bg-white rounded-lg p-2 shadow-xl">
                <div className="grid grid-cols-12 gap-0.5 items-center">
                  {/* Airport */}
                  <div className="col-span-12 md:col-span-3 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Sân bay</div>
                    <div className="relative h-14 bg-white rounded-l-md hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="Nội Bài (HAN)" 
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-base pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="col-span-12 md:col-span-3 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Điểm đến</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="Khách sạn, địa điểm..." 
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-base pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Pickup Date */}
                  <div className="col-span-12 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Ngày đón</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center cursor-pointer">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                        20 thg 12 2025
                      </div>
                    </div>
                  </div>

                  {/* Pickup Time */}
                  <div className="col-span-12 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Giờ đón</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors flex items-center cursor-pointer">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                        09:00
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="col-span-12 md:col-span-2 flex justify-end">
                    <Button className="h-14 w-full md:w-14 bg-[#ff5e1f] hover:bg-[#e04f15] rounded-r-md rounded-l-none shrink-0">
                      <Search className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Car Rental Tab */}
            <TabsContent value="car" className="mt-0">
              {/* Sub-options */}
              <div className="flex gap-2 mb-4">
                <Button size="sm" className="rounded-full bg-[#007ce8] hover:bg-[#006bb3] text-white font-medium px-6 h-8">
                  <Car className="w-4 h-4 mr-2" /> Tự lái
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                  <User className="w-4 h-4 mr-2" /> Có tài xế
                </Button>
              </div>

              {/* Search Bar Container */}
              <div className="bg-white rounded-lg p-2 shadow-xl">
                <div className="grid grid-cols-12 gap-0.5 items-center">
                  {/* Location */}
                  <div className="col-span-12 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Địa điểm thuê xe của bạn</div>
                    <div className="relative h-14 bg-white rounded-l-md hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="Điền thành phố, sân bay," 
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-sm pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="col-span-6 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Ngày bắt đầu</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center cursor-pointer">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-sm text-gray-700 font-medium truncate">
                        21 thg 12, 2025
                      </div>
                    </div>
                  </div>

                  {/* Start Time */}
                  <div className="col-span-6 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Giờ bắt đầu</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center cursor-pointer">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-sm text-gray-700 font-medium truncate">
                        09:00
                      </div>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="col-span-6 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Ngày kết thúc</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center cursor-pointer">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-sm text-gray-700 font-medium truncate">
                        23 thg 12, 2025
                      </div>
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="col-span-6 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Giờ kết thúc</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors flex items-center cursor-pointer">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-sm text-gray-700 font-medium truncate">
                        09:00
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="col-span-12 md:col-span-2 flex justify-end">
                    <Button className="h-14 w-full md:w-14 bg-[#ff5e1f] hover:bg-[#e04f15] rounded-r-md rounded-l-none shrink-0">
                      <Search className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="mt-0">
              {/* Search Bar Container */}
              <div className="bg-white rounded-lg p-2 shadow-xl">
                <div className="grid grid-cols-12 gap-0.5 items-center">
                  {/* Destination */}
                  <div className="col-span-12 md:col-span-5 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Tìm hoạt động</div>
                    <div className="relative h-14 bg-white rounded-l-md hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="Tìm địa điểm, hoạt động, tour..." 
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-base pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="col-span-12 md:col-span-4 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Địa điểm</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <Input 
                        placeholder="Thành phố, khu vực" 
                        className="pl-12 h-full w-full border-none shadow-none focus-visible:ring-0 text-base pt-6 pb-2 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-12 md:col-span-2 relative group">
                    <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Ngày tham gia</div>
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors flex items-center cursor-pointer">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                        20 thg 12 2025
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="col-span-12 md:col-span-1 flex justify-end">
                    <Button className="h-14 w-14 bg-[#ff5e1f] hover:bg-[#e04f15] rounded-r-md rounded-l-none shrink-0">
                      <Search className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category Tags */}
              <div className="flex gap-3 mt-4 flex-wrap">
                <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                  🎢 Công viên giải trí
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                  🏛️ Tham quan
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                  🚤 Tour du thuyền
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/20 font-medium px-4 h-8 bg-black/20 backdrop-blur-sm border border-white/10">
                  🎿 Thể thao mạo hiểm
                </Button>
              </div>
            </TabsContent>

            {/* More Tab */}
            <TabsContent value="more" className="mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                <Grid className="w-16 h-16 text-white/80 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Khám phá thêm dịch vụ</h3>
                <p className="text-white/80 mb-6">Nhiều dịch vụ du lịch khác đang chờ đón bạn</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors cursor-pointer">
                    <Hotel className="w-8 h-8 text-white mx-auto mb-2" />
                    <span className="text-white text-sm">Homestay</span>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors cursor-pointer">
                    <MapPin className="w-8 h-8 text-white mx-auto mb-2" />
                    <span className="text-white text-sm">Bảo hiểm du lịch</span>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors cursor-pointer">
                    <Plane className="w-8 h-8 text-white mx-auto mb-2" />
                    <span className="text-white text-sm">Visa</span>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors cursor-pointer">
                    <Calendar className="w-8 h-8 text-white mx-auto mb-2" />
                    <span className="text-white text-sm">Tour trọn gói</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

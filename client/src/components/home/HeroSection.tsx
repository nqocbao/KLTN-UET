"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, User, Hotel, Plane, Bus, Car, MapPin, Grid, Home, Building } from "lucide-react";

export function HeroSection() {
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
          App du lịch hàng đầu, một chạm đi bất cứ đâu
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
                value="activities" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:rounded-full bg-transparent text-white/90 hover:bg-white/10 rounded-full px-4 md:px-6 py-2 gap-2 text-sm md:text-base font-medium transition-all"
              >
                <Grid className="w-5 h-5" /> Hoạt động & Vui chơi
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
               <div className="flex justify-center gap-3 mb-4 flex-wrap">
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
               </div>

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
                    <div className="relative h-14 bg-white hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center cursor-pointer">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                      <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                        19 thg 12 2025 - 20 thg 12 2025
                      </div>
                    </div>
                  </div>

                  {/* Guests & Search Button */}
                  <div className="col-span-12 md:col-span-4 flex">
                    <div className="relative flex-1 h-14 bg-white hover:bg-gray-50 transition-colors cursor-pointer group rounded-l-none">
                       <div className="absolute left-4 top-2 text-gray-500 text-xs font-medium z-10">Khách và Phòng</div>
                       <div className="relative h-full flex items-center">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 mt-3" />
                          <div className="pl-12 pt-5 text-base text-gray-700 font-medium truncate">
                            2 người lớn, 0 Trẻ em, 1 phòng
                          </div>
                       </div>
                    </div>
                    
                    <Button className="h-14 w-16 bg-[#ff5e1f] hover:bg-[#e04f15] rounded-r-md rounded-l-none shrink-0">
                      <Search className="w-6 h-6 text-white" />
                    </Button>
                  </div>
               </div>
            </TabsContent>
            
            {/* Other tabs placeholders */}
            <TabsContent value="flights" className="mt-0 py-8 text-center text-white">
              Tìm kiếm Vé máy bay...
            </TabsContent>
             <TabsContent value="bus" className="mt-0 py-8 text-center text-white">
              Tìm kiếm Vé xe khách...
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

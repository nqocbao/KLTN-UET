"use client";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { FlightSearchHeader } from "@/components/flights/FlightSearchHeader";
import { FlightSearchSidebar } from "@/components/flights/FlightSearchSidebar";
import { FlightSearchCard, type Flight } from "@/components/flights/FlightSearchCard";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter, ChevronDown } from "lucide-react";

export default function FlightSearchPage() {
  // Mock Data
  const flights: Flight[] = [
    { 
      id: "1", airline: "VietJet Air", logo: "VJ", flightNumber: "VJ123",
      departureTime: "17:35", departureAirport: "SGN",
      arrivalTime: "19:05", arrivalAirport: "BKK",
      duration: "1h 30m", type: "Bay thẳng",
      price: "2.486.175 VND", originalPrice: "2.512.889 VND",
      isBest: true, tags: ["TVLKBAYDONGVUI giảm đến 600K"]
    },
    { 
      id: "2", airline: "Thai AirAsia", logo: "FD", flightNumber: "FD456",
      departureTime: "21:35", departureAirport: "SGN",
      arrivalTime: "23:10", arrivalAirport: "DMK",
      duration: "1h 35m", type: "Bay thẳng",
      price: "1.995.758 VND", 
      isBest: false, tags: ["Bay dưới 2 triệu"]
    },
    { 
      id: "3", airline: "Vietnam Airlines", logo: "VN", flightNumber: "VN789",
      departureTime: "09:00", departureAirport: "SGN",
      arrivalTime: "10:30", arrivalAirport: "BKK",
      duration: "1h 30m", type: "Bay thẳng",
      price: "3.200.000 VND", 
      isBest: false
    },
    { 
      id: "4", airline: "Bamboo Airways", logo: "QH", flightNumber: "QH101",
      departureTime: "14:15", departureAirport: "SGN",
      arrivalTime: "15:50", arrivalAirport: "BKK",
      duration: "1h 35m", type: "Bay thẳng",
      price: "2.800.000 VND", 
      isBest: false
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="blue" />
      
      {/* Spacer for fixed main header */}
      <div className="pt-[104px]">
         <FlightSearchHeader />
      </div>

      <div className="container mx-auto px-4 py-6">
         <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="hidden lg:block w-[280px] shrink-0">
               <FlightSearchSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
              {/* Quick Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <Button variant="outline" className="rounded-full h-8 text-xs font-medium border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                    <span className="mr-1">🏷️</span> Bay dưới 2 triệu
                  </Button>
                  <Button variant="outline" className="rounded-full h-8 text-xs font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                    🎓 Vé sinh viên
                  </Button>
                  <Button variant="outline" className="rounded-full h-8 text-xs font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                    🌙 Bay đêm
                  </Button>
              </div>

              {/* Sort Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex">
                   <div className="flex-1 border-r border-gray-100">
                      <Button variant="ghost" className="w-full h-16 flex flex-col items-start justify-center px-4 gap-0.5 rounded-none hover:bg-blue-50 group border-b-2 border-blue-600 bg-blue-50/30">
                         <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Giá thấp nhất</span>
                         <span className="text-sm font-bold text-gray-900">1.995.758 VND</span>
                         <span className="text-[10px] text-gray-400">1h 35m</span>
                      </Button>
                   </div>
                   <div className="flex-1">
                      <Button variant="ghost" className="w-full h-16 flex flex-col items-start justify-center px-4 gap-0.5 rounded-none hover:bg-gray-50">
                         <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Thời gian bay ngắn nhất</span>
                         <span className="text-sm font-bold text-gray-900">1h 25m</span>
                         <span className="text-[10px] text-gray-400">2.512.889 VND</span>
                      </Button>
                   </div>
                </div>
                
                <div className="w-full md:w-[240px]">
                   <Button variant="outline" className="w-full h-16 bg-white border-gray-200 flex items-center justify-between px-4 hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                         <ArrowUpDown className="w-4 h-4 text-gray-400" />
                         <div className="text-left">
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Ưu tiên bay thẳng</div>
                            <div className="text-sm text-gray-900 font-bold">1.995.758 VND</div>
                         </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                   </Button>
                </div>
              </div>

              {/* Banner / Section Title */}
              <div className="space-y-6">
                <div>
                   <h3 className="font-bold text-gray-900 mb-3">Best flight from your search!</h3>
                   <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#ff5e1f] text-white p-1 rounded-full text-[10px]">
                           %
                        </div>
                        <span className="font-bold text-red-600">Chuyến bay tốt nhất cho bạn</span>
                      </div>
                      <div className="text-gray-500 text-xs">Mức giá đặc biệt</div>
                   </div>
                </div>

                <div className="space-y-4">
                   {flights.filter(f => f.isBest).map(flight => (
                     <FlightSearchCard key={flight.id} flight={flight} />
                   ))}
                </div>

                <div>
                   <h3 className="font-bold text-gray-900 mb-3">Tất cả các chuyến bay</h3>
                   <div className="space-y-4">
                      {flights.filter(f => !f.isBest).map(flight => (
                        <FlightSearchCard key={flight.id} flight={flight} />
                      ))}
                   </div>
                </div>
              </div>
            </div>
         </div>
      </div>

      <Footer />
    </div>
  );
}

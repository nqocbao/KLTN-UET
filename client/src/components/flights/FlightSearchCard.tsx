"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plane, Luggage, Briefcase, Phone, Heart } from "lucide-react";
import { ContactDialog } from "@/components/common/ContactDialog";

export interface Flight {
  id: string;
  airline: string;
  logo: string; // URL or placeholder code
  flightNumber: string;
  departureTime: string;
  departureAirport: string;
  arrivalTime: string;
  arrivalAirport: string;
  duration: string;
  type: "Bay thẳng" | "1 điểm dừng";
  price: string;
  originalPrice?: string;
  isBest?: boolean; // Label hint
  tags?: string[];
}

interface FlightSearchCardProps {
  flight: Flight;
}

export function FlightSearchCard({ flight }: FlightSearchCardProps) {
  const [showContact, setShowContact] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
    <ContactDialog
      open={showContact}
      onOpenChange={setShowContact}
      itemType="flight"
      itemName={`${flight.airline} - ${flight.flightNumber}`}
    />
    <div className={`bg-white rounded-xl shadow-sm border ${flight.isBest ? "border-red-200" : "border-gray-200"} overflow-hidden hover:shadow-md transition-shadow`}>
      {/* Best Banner */}
      {flight.isBest && (
        <div className="bg-red-100 px-4 py-1 text-xs text-red-600 font-bold flex items-center gap-2">
          <span>%</span> Chuyến bay tốt nhất cho bạn
        </div>
      )}

      <div className="p-4 flex flex-col md:flex-row gap-4">
         {/* Airline Info */}
         <div className="w-full md:w-[200px] shrink-0">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
               {flight.logo}
             </div>
             <span className="font-semibold text-gray-900">{flight.airline}</span>
           </div>
           
           <div className="flex gap-2 text-xs text-gray-500">
             <div className="flex items-center gap-1 border border-gray-200 rounded px-1.5 py-0.5">
               <Luggage className="w-3 h-3" /> 20kg
             </div>
             <div className="flex items-center gap-1 border border-gray-200 rounded px-1.5 py-0.5">
               <Briefcase className="w-3 h-3" /> 7kg
             </div>
           </div>
           
           {flight.tags && (
              <div className="mt-2 text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                {flight.tags[0]}
              </div>
           )}
         </div>

         {/* Flight Time Info */}
         <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4">
               <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">{flight.departureTime}</div>
                  <div className="text-xs text-gray-500">{flight.departureAirport}</div>
               </div>
               
               <div className="flex-1 flex flex-col items-center px-4">
                  <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                  <div className="w-full h-px bg-gray-300 relative flex items-center justify-center">
                     <div className="absolute w-2 h-2 rounded-full border border-gray-300 bg-white left-0" />
                     <Plane className="w-3 h-3 text-gray-400 rotate-90" />
                     <div className={`absolute w-2 h-2 rounded-full border border-gray-300 ${flight.type === "Bay thẳng" ? "bg-white hidden" : "bg-white"} left-1/2 -translate-x-1/2`} />
                     <div className="absolute w-2 h-2 rounded-full border border-gray-300 bg-blue-500 right-0" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{flight.type}</div>
               </div>

               <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">{flight.arrivalTime}</div>
                  <div className="text-xs text-gray-500">{flight.arrivalAirport}</div>
               </div>
            </div>
         </div>

         {/* Price & Action */}
         <div className="w-full md:w-[200px] shrink-0 flex flex-col justify-between items-end pl-4 border-l border-gray-100">
            <div className="text-right">
              {flight.originalPrice && (
                 <div className="text-xs text-gray-400 line-through mb-0.5">{flight.originalPrice}</div>
              )}
              <div className="text-[#ff5e1f] text-xl font-bold">{flight.price}</div>
              <div className="text-xs text-gray-400">/khách</div>
            </div>

            <Button 
              className="w-full mt-2 bg-[#007ce8] hover:bg-[#006bb3] font-bold"
              onClick={() => setShowContact(true)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Liên hệ
            </Button>
            {isLoggedIn && (
              <Button 
                variant="ghost" 
                size="sm"
                className={`w-full h-7 text-xs mt-1 ${isSaved ? 'text-red-500' : 'text-gray-500'}`}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={`w-3 h-3 mr-1 ${isSaved ? 'fill-red-500' : ''}`} />
                {isSaved ? 'Đã lưu' : 'Lưu yêu thích'}
              </Button>
            )}
         </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex gap-6 text-xs font-medium text-gray-500">
         <span className="hover:text-blue-600 cursor-pointer">Chi tiết</span>
         <span className="hover:text-blue-600 cursor-pointer">Các lợi ích đi kèm</span>
         <span className="hover:text-blue-600 cursor-pointer">Hoàn vé</span>
         <span className="hover:text-blue-600 cursor-pointer">Đổi lịch</span>
         <span className="hover:text-blue-600 cursor-pointer">Khuyến mãi</span>
      </div>
    </div>
    </>
  );
}

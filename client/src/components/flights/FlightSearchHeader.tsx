"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Calendar, User, ChevronLeft, ChevronRight, Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function FlightSearchHeader() {
  const router = useRouter();
  
  // Fake dates for the strip
  const dates = [
    { day: "Thứ 2", date: "16 thg 12", price: "2.449.200 VND", active: false },
    { day: "Thứ 3", date: "17 thg 12", price: "2.000.000 VND", active: false },
    { day: "Thứ 4", date: "18 thg 12", price: "1.950.000 VND", active: false },
    { day: "Thứ 5", date: "19 thg 12", price: "1.995.758 VND", active: false },
    { day: "Thứ 6", date: "20 thg 12", price: "2.512.889 VND", active: false },
    { day: "Thứ 7", date: "21 thg 12", price: "2.468.000 VND", active: false },
    { day: "CN", date: "22 thg 12", price: "1.995.758 VND", active: true }, // MATCHING IMAGE
    { day: "Thứ 2", date: "23 thg 12", price: "1.504.000 VND", active: false },
    { day: "Thứ 3", date: "24 thg 12", price: "1.485.000 VND", active: false },
  ];

  return (
    <div className="bg-[#4bc3ff] pb-4">
      <div className="container mx-auto px-4">
        {/* Top Bar: Route Info */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 text-white">
           <div className="flex items-center gap-4 w-full md:w-auto">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/20">
               <ArrowLeft className="w-6 h-6" />
             </Button>
             
             <div className="bg-white/10 backdrop-blur-sm rounded px-4 py-2 flex-1 md:flex-none flex items-center justify-between gap-4 cursor-pointer hover:bg-white/20 transition-colors">
               <div className="flex flex-col">
                  <span className="font-bold flex items-center gap-2">
                    TP HCM (SGN) <span className="text-white/60">→</span> Bangkok (BKKA)
                  </span>
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> CN, 22 thg 12 2025</span>
                    <span className="w-px h-3 bg-white/30"></span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> 1 hành khách</span>
                    <span className="w-px h-3 bg-white/30"></span>
                    <span>Phổ thông</span>
                  </div>
               </div>
               <Search className="w-5 h-5 text-white/80" />
             </div>
           </div>

           <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Button variant="ghost" className="text-white text-sm hover:bg-white/20 gap-2">
                 <Bell className="w-4 h-4" /> Bật thông báo giá
              </Button>
           </div>
        </div>
        
        {/* Date Strip */}
        <div className="relative">
           <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-black/20 -ml-2 disabled:opacity-30">
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
           
           <Button variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-black/20 -mr-2">
             <ChevronRight className="w-6 h-6" />
           </Button>
        </div>
      </div>
    </div>
  );
}

// Helper icon since Search in Lucide might conflict if not handled

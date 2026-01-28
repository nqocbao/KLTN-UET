"use client";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";

export function FlightSearchSidebar() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-6">
       {/* Promo Sidebar Item */}
       <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#469ae3] p-2 rounded-full">
               <Plane className="w-5 h-5 text-white" />
            </div>
            <div className="text-xs font-bold text-gray-800">Giảm đến 600K bay nhóm</div>
          </div>
          <div className="text-[10px] text-gray-500 mb-3">Ưu đãi chỉ áp dụng trên app. Mở app xem ngay!</div>
          <div className="bg-white border border-dashed border-gray-300 rounded p-2 flex justify-between items-center">
             <span className="text-[10px] font-mono font-bold text-gray-400">TVLKBAYDONGVUI</span>
             <button className="text-[10px] font-bold text-blue-600">Sao chép</button>
          </div>
       </div>

       <div className="flex items-center justify-between">
         <h3 className="font-bold text-gray-900">Bộ lọc</h3>
         <Button variant="ghost" className="text-blue-600 text-[13px] h-auto p-0 hover:bg-transparent font-bold">Đặt lại</Button>
       </div>
       
       {/* Stops */}
       <div className="space-y-3">
         <h4 className="font-semibold text-sm">Số điểm dừng</h4>
         <div className="space-y-2">
           <div className="flex items-center space-x-2">
             <Checkbox id="direct" />
             <div className="grid gap-1.5 leading-none">
               <Label htmlFor="direct" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 Bay thẳng
               </Label>
               <p className="text-xs text-muted-foreground">1.995.758 VND</p>
             </div>
           </div>
           <div className="flex items-center space-x-2">
             <Checkbox id="one-stop" />
             <div className="grid gap-1.5 leading-none">
               <Label htmlFor="one-stop" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 1 điểm dừng
               </Label>
               <p className="text-xs text-muted-foreground">2.500.000 VND</p>
             </div>
           </div>
         </div>
       </div>

       <div className="h-px bg-gray-100" />

       {/* Time */}
       <div className="space-y-3">
         <h4 className="font-semibold text-sm">Thời gian bay</h4>
         <div className="px-2">
            <Slider defaultValue={[0, 24]} max={24} step={1} className="mt-6" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>00:00</span>
              <span>23:59</span>
            </div>
         </div>
       </div>

       <div className="h-px bg-gray-100" />

       {/* Airlines */}
       <div className="space-y-3">
         <h4 className="font-semibold text-sm">Hãng hàng không</h4>
         <div className="space-y-3">
            {[
              { name: "Air Australia", price: "4.975.539 VND", logo: "AA" },
              { name: "VietJet Air", price: "5.405.171 VND", logo: "VJ" },
              { name: "Vietnam Airlines", price: "5.905.886 VND", logo: "VN" },
              { name: "Bamboo Airways", price: "6.986.949 VND", logo: "QH" },
              { name: "Thai Airways", price: "6.682.209 VND", logo: "TG" },
            ].map((airline, idx) => (
              <div key={idx} className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                   <Checkbox id={`airline-${idx}`} />
                   <Label htmlFor={`airline-${idx}`} className="text-sm">{airline.name}</Label>
                 </div>
                 <span className="text-xs text-gray-500">{airline.price}</span>
              </div>
            ))}
         </div>
       </div>
    </div>
  );
}

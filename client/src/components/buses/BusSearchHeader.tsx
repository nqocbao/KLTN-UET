"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export function BusSearchHeader() {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-[104px] z-30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-gray-100 rounded-full p-2 md:p-1">
          {/* From */}
          <div className="flex-1 min-w-[150px] relative px-4 py-2 border-r border-gray-300">
            <div className="text-xs text-gray-500 mb-0.5">Điểm đi</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <input 
                type="text" 
                className="bg-transparent outline-none text-sm font-medium w-full"
                defaultValue="TP. Hồ Chí Minh"
              />
            </div>
          </div>

          {/* To */}
          <div className="flex-1 min-w-[150px] relative px-4 py-2 border-r border-gray-300">
            <div className="text-xs text-gray-500 mb-0.5">Điểm đến</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <input 
                type="text" 
                className="bg-transparent outline-none text-sm font-medium w-full"
                defaultValue="Đà Lạt"
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex-1 min-w-[130px] relative px-4 py-2 border-r border-gray-300">
            <div className="text-xs text-gray-500 mb-0.5">Ngày đi</div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium">Thứ 7, 18 thg 1</span>
            </div>
          </div>

          {/* Passengers */}
          <div className="flex-1 min-w-[120px] relative px-4 py-2">
            <div className="text-xs text-gray-500 mb-0.5">Số khách</div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium">2 người lớn</span>
            </div>
          </div>

          {/* Search Button */}
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 md:mr-1">
            Tìm
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, Wifi, Utensils, Car, CloudCog, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "@/components/common/ContactDialog";
import type { Hotel } from "@/types/api";

interface HotelSearchCardProps {
  hotel: Hotel;
  nights?: number;
}

export function HotelSearchCard({ hotel, nights = 1 }: HotelSearchCardProps) {
  const [showContact, setShowContact] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Mock discount logic for display purposes
  const perNightPrice = hotel.priceTwoSingleBed || 0;
  const originalPerNightPrice = perNightPrice * 1.2;
  
  const totalPrice = perNightPrice * nights;
  const originalTotalPrice = originalPerNightPrice * nights;


  console.log("hotel.images =>>>>>>", hotel.images)

  return (
    <>
    <ContactDialog
      open={showContact}
      onOpenChange={setShowContact}
      itemType="hotel"
      itemName={hotel.name}
    />
    <div className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow md:h-[240px]">
      {/* Image Section */}
      <div className="w-full md:w-[320px] h-[200px] md:h-full shrink-0 relative flex gap-0.5">
           <div className="w-3/4 h-full relative">
             <img 
               src={(hotel as any).image_url || hotel.images?.[0] || "https://placehold.co/600x400/png?text=Hotel+Image"} 
               alt={hotel.name}
               className="w-full h-full object-cover"
               onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/png?text=Hotel+Image")}
             />
          </div>
          <div className="w-1/4 h-full flex flex-col gap-0.5">
            {[1, 2, 3].map((i) => (
               <div key={i} className="flex-1 relative">
                 <img 
                   src={hotel.images?.[i] || `https://placehold.co/300x200/png?text=Room+${i}`}
                   alt="Room view" 
                   className="w-full h-full object-cover"
                   onError={(e) => (e.currentTarget.src = `https://placehold.co/300x200/png?text=Room+Fallback`)} 
                 />
                 {i === 3 && (hotel.images?.length || 0) > 4 && (
                   <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer hover:bg-black/70 backdrop-blur-sm">
                     Xem thêm +{(hotel.images?.length || 0) - 4}
                   </div>
                 )}
               </div>
            ))}
          </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
           <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{hotel.name}</h3>
           
           <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                <span className="text-sm">🏨</span> Khách sạn
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(hotel.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} 
                  />
                ))}
              </div>
           </div>

           <div className="flex items-center text-gray-500 text-sm mb-3">
             <MapPin className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
             <span className="truncate max-w-[300px]">
                {(hotel as any).address_id?.address_detail && `${(hotel as any).address_id.address_detail}, `}
                {(hotel as any).address_id?.ward_id?.name && `${(hotel as any).address_id.ward_id.name}, `}
                {(hotel as any).address_id?.district_id?.name && `${(hotel as any).address_id.district_id.name}, `}
                {(hotel as any).address_id?.province_id?.name || hotel.location}
             </span>
           </div>

           <div className="flex gap-4 text-gray-500">
             <div className="flex items-center text-xs gap-1"><Wifi className="w-3 h-3" /> Free Wifi</div>
             <div className="flex items-center text-xs gap-1"><Utensils className="w-3 h-3" /> Breakfast</div>
             <div className="flex items-center text-xs gap-1"><Car className="w-3 h-3" /> Parking</div>
             <div className="text-xs text-gray-400">+5 more</div>
           </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
           <span className="bg-blue-50 text-blue-600 text-xs font-bold px-1 py-0.5 rounded">
             {hotel.rating >= 4.5 ? "Trên cả tuyệt vời" : "Rất tốt"}
           </span>
           <span className="text-blue-700 font-bold text-sm">{hotel.rating}/5</span>
           <span className="text-gray-400 text-xs">(123 đánh giá)</span>
        </div>
      </div>

      {/* Price Section */}
      <div className="w-full md:w-[250px] border-t md:border-t-0 md:border-l border-gray-100 p-4 flex flex-col justify-end items-end bg-gray-50/50">
         <div className="text-xs text-green-600 font-medium flex items-center mb-1">
           <span className="bg-green-100 px-1 py-0.5 rounded mr-1">🔥</span>
           Ưu đãi đặc biệt
         </div>
         
         <div className="text-gray-400 text-xs line-through">
           {originalTotalPrice.toLocaleString()} VND
         </div>
         
         <div className="text-[#ff5e1f] text-xl font-bold">
           {totalPrice.toLocaleString()} VND
         </div>
         
         <div className="text-xs text-gray-500 mb-3">
           {nights > 1 ? `Tổng cho ${nights} đêm` : "/ phòng / đêm"}
         </div>
         <div className="text-xs text-gray-500 mb-3">
           Chưa bao gồm thuế và phí
         </div>

         <Button 
           className="w-full bg-[#ff5e1f] hover:bg-[#e04f15] text-white font-bold h-10"
           onClick={() => setShowContact(true)}
         >
           <Phone className="w-4 h-4 mr-2" />
           Liên hệ đặt phòng
         </Button>
         {isLoggedIn && (
           <Button 
             variant="outline" 
             size="sm"
             className={`w-full h-8 text-xs mt-2 ${isSaved ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-600'}`}
             onClick={() => setIsSaved(!isSaved)}
           >
             <Heart className={`w-3 h-3 mr-1 ${isSaved ? 'fill-red-500' : ''}`} />
             {isSaved ? 'Đã lưu' : 'Lưu yêu thích'}
           </Button>
         )}
      </div>
    </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Moon, User, Search, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { GuestRoomPicker, type GuestRoomValue } from "@/components/ui/guest-room-picker";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";

// Helper function to format date for display
function formatDateShort(date: Date | null | undefined): string {
  if (!date) return "";
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day} thg ${month} ${year}`;
}

const HOTEL_PARTNERS = [
  { name: "ACCOR", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4lBM65RjpI6HB13jgQCIiJ0K4nFNboiF7uQ&s" },
  { name: "MARRIOTT", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTesIYr9EveuGqfENVpqM9ixX4HUevOfBJag&s" },
  { name: "MINOR", src: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Minor_Hotels_Logo_New.png" },
  { name: "ODYSSEA", src: "https://www.odysseahotels.com/static/assets/image/sharing/logo-odyssea.png__302x108_q85_subsampling-2.png" },
  { name: "Fusion", src: "https://www.pngkey.com/png/full/370-3704853_fusion-logo-fusion-connect.png" },
  { name: "FLC", src: "https://static.careerlink.vn/image/2799b32da80f7703a6da364be223dccf" },
  { name: "Muong Thanh", src: "https://nhadattrungtamsaigon.com/wp-content/uploads/2021/08/Muong-Thanh-Group-logo-1.png" }
];

const PROMO_TABS = ["Mã giảm hot", "Ngân hàng", "Zalo Pay", "Điểm đến hot"];

const DOMESTIC_DESTINATIONS = [
  { name: "Phú Quốc", hotels: 921, image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop" },
  { name: "Đà Lạt", hotels: 1180, image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop" },
  { name: "Quy Nhơn", hotels: 333, image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop" },
  { name: "Vũng Tàu", hotels: 705, image: "https://images.unsplash.com/photo-1578923436325-4b6e85d3e5f0?w=800&h=600&fit=crop" },
  { name: "Đà Nẵng", hotels: 1361, image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop" },
  { name: "Nha Trang", hotels: 1024, image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop" },
  { name: "Phan Thiết", hotels: 497, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop" },
  { name: "Phú Yên", hotels: 18, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" }
];

const INTERNATIONAL_DESTINATIONS = [
  { name: "Bangkok", hotels: 5432, image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop" },
  { name: "Singapore", hotels: 3210, image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop" },
  { name: "Tokyo", hotels: 4567, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop" },
  { name: "Seoul", hotels: 3890, image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=600&fit=crop" },
  { name: "Paris", hotels: 4123, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop" },
  { name: "Dubai", hotels: 2876, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop" },
  { name: "Bali", hotels: 1987, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop" },
  { name: "Maldives", hotels: 876, image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop" }
];

const POPULAR_DESTINATIONS = [
  "Đà Nẵng", "Đà Lạt", "Tp. Hồ Chí Minh", "Vũng Tàu", 
  "Nha Trang", "Hà Nội", "Phan Thiết", "Huế", "Quy Nhơn", "Phú Quốc"
];

const FEATURED_HOTELS = [
  { 
    name: "Novotel Danang Premier Han River", 
    loc: "Hải Châu, Đà Nẵng", 
    rating: 9.1, 
    reviews: 1240, 
    price: "2.431.225", 
    oldPrice: "3.537.799", 
    discount: "30%", 
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&h=400&fit=crop",
    stars: 5 
  },
  { 
    name: "InterContinental Danang Sun Peninsula Resort", 
    loc: "Sơn Trà, Đà Nẵng", 
    rating: 9.6, 
    reviews: 859, 
    price: "12.336.623", 
    oldPrice: "15.390.476", 
    discount: "20%", 
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=400&fit=crop",
    stars: 5,
    badge: "Ưu đãi đặc biệt cho kỳ nghỉ dưỡng"
  },
  { 
    name: "Muong Thanh Luxury Da Nang Hotel", 
    loc: "Mỹ Khê, Đà Nẵng", 
    rating: 8.5, 
    reviews: 2158, 
    price: "1.318.715", 
    oldPrice: "1.824.954", 
    discount: "28%", 
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=400&fit=crop",
    stars: 4
  },
  { 
    name: "Sala Danang Beach Hotel", 
    loc: "Phước Mỹ, Đà Nẵng", 
    rating: 8.9, 
    reviews: "1,5k", 
    price: "1.226.206", 
    oldPrice: "1.663.636", 
    discount: "25%", 
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&h=400&fit=crop", 
    stars: 4,
    badge: "Gần biển, view cực đẹp" 
  },
];

const PAYMENT_PARTNERS = [
  { name: "Mastercard", src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },
  { name: "JCB", src: "https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg" },
  { name: "VISA", src: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
  { name: "AMEX", src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" },
  { name: "VietQR", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/VietQR_Logo.svg/1280px-VietQR_Logo.svg.png" },
  { name: "Momo", src: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png" },
  { name: "Vietcombank", src: "https://upload.wikimedia.org/wikipedia/vi/thumb/9/9d/Vietcombank_Logo.svg/3840px-Vietcombank_Logo.svg.png" },
  { name: "VIB", src: "https://upload.wikimedia.org/wikipedia/commons/5/55/LOGO-VIB-Blue.png" },
  { name: "Techcombank", src: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Techcombank_logo.png" },
  { name: "MB", src: "https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-MB-Bank-MBB.png" }
];

const WHY_BOOK_REASONS = [
  { 
    title: "Giá rẻ mỗi ngày với ưu đãi đặc biệt dành riêng cho ứng dụng", 
    desc: "Đặt phòng qua ứng dụng để nhận giá tốt nhất với các khuyến mãi tuyệt vời!", 
    icon: "🏷️" 
  },
  { 
    title: "Phương thức thanh toán an toàn và linh hoạt", 
    desc: "Giao dịch trực tuyến an toàn với nhiều lựa chọn như thanh toán tại cửa hàng tiện lợi, chuyển khoản ngân hàng...", 
    icon: "💳" 
  },
  { 
    title: "Hỗ trợ khách hàng 24/7", 
    desc: "Đội ngũ nhân viên hỗ trợ khách hàng luôn sẵn sàng giúp đỡ bạn trong từng bước của quá trình đặt vé.", 
    icon: "☎️" 
  },
  { 
    title: "Khách thực, đánh giá thực", 
    desc: "Hơn 10.000.000 đánh giá bởi du khách sẽ giúp bạn đưa ra lựa chọn đúng đắn.", 
    icon: "⭐" 
  },
];

export default function HotelsLandingPage() {
  const router = useRouter();
  
  const [guestRoom, setGuestRoom] = useState<GuestRoomValue>({
    rooms: 1,
    adults: 2,
    children: 0,
  });
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("rooms", guestRoom.rooms.toString());
    params.set("adults", guestRoom.adults.toString());
    params.set("children", guestRoom.children.toString());
    if (dateRange?.from) params.set("from", dateRange.from.toISOString());
    if (dateRange?.to) params.set("to", dateRange.to.toISOString());
    
    router.push(`/vi/hotels/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="transparent" />
      
      <main>
        {/* Hero Section with High-Res Background Image */}
        <section 
          className="relative pt-[120px] pb-40 overflow-hidden bg-cover bg-center bg-no-repeat min-h-[500px]"
          style={{ backgroundImage: 'url("https://i.pinimg.com/originals/23/eb/b5/23ebb5331484fbb9f582eecfd1fb8919.jpg")' }}
        >
          {/* Overlay to ensure text readability if needed */}
          <div className="absolute inset-0 bg-[#469ae3]/10 mix-blend-multiply" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Text Info */}
              <div className="lg:w-1/2 text-white space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  Tìm & đặt phòng khách sạn giá rẻ chỉ với 3 bước đơn giản!
                </h1>
                <p className="text-lg text-white/90">
                  Tìm ưu đãi khách sạn tốt nhất trên VivuTravel!
                </p>
              </div>
            </div>
        
          </div>
        </section>

        {/* Hotel Search Box - Overlapping */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
               <div className="bg-blue-50 p-1.5 rounded-full">
                 <Search className="w-4 h-4 text-blue-600" />
               </div>
               <span className="text-sm font-bold text-blue-600">Khách sạn xem gần đây</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
               {/* Location */}
               <div className="md:col-span-4 relative group">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Thành phố, địa điểm hoặc tên khách sạn:</div>
                  <div className="relative border border-gray-200 rounded-lg h-12 flex items-center hover:border-blue-400 transition-colors">
                     <MapPin className="ml-3 text-gray-400 w-5 h-5" />
                     <Input 
                        placeholder="Thành phố, khách sạn, điểm đến" 
                        className="border-none focus-visible:ring-0 text-sm font-medium" 
                     />
                  </div>
               </div>

               {/* Date Check-in */}
               <div className="md:col-span-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nhận phòng:</div>
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <div className="relative border border-gray-200 rounded-lg h-12 flex items-center px-3 gap-3 hover:border-blue-400 transition-colors cursor-pointer">
                       <Calendar className="text-gray-400 w-5 h-5 shrink-0" />
                       <span className="text-sm font-bold text-gray-700">
                         {dateRange?.from ? formatDateShort(dateRange.from) : "Chọn ngày"}
                       </span>
                    </div>
                  </DateRangePicker>
               </div>

               {/* Night Count */}
               <div className="md:col-span-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Số đêm:</div>
                  <div className="relative border border-gray-200 rounded-lg h-12 flex items-center px-3 gap-3 hover:border-blue-400 transition-colors cursor-pointer">
                     <Moon className="text-gray-400 w-5 h-5 shrink-0" />
                     <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">
                          {dateRange?.from && dateRange?.to 
                            ? `${Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} đêm`
                            : "1 đêm"
                          }
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                     </div>
                  </div>
               </div>

               {/* Date Check-out (Calculated) */}
               <div className="md:col-span-2">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Trả phòng:</div>
                  <div className="h-12 flex items-center px-1">
                     <span className="text-sm font-bold text-gray-800">
                       {dateRange?.to ? formatDateShort(dateRange.to) : "Chọn ngày"}
                     </span>
                  </div>
               </div>

               {/* Guests and Rooms */}
               <div className="md:col-span-3">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Khách và Phòng</div>
                  <GuestRoomPicker
                    value={guestRoom}
                    onChange={setGuestRoom}
                  >
                    <div className="relative border border-gray-200 rounded-lg h-12 flex items-center px-3 gap-3 hover:border-blue-400 transition-colors cursor-pointer">
                       <User className="text-gray-400 w-5 h-5 shrink-0" />
                       <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-700">
                            {`${guestRoom.adults} người lớn, ${guestRoom.children} Trẻ em, ${guestRoom.rooms} phòng`}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                       </div>
                    </div>
                  </GuestRoomPicker>
               </div>

               {/* Search Button */}
               <div className="md:col-span-1 flex items-end">
                  <Button 
                    className="w-full h-12 bg-[#ff5e1f] hover:bg-[#e04f15] text-white font-bold text-lg gap-2"
                    onClick={handleSearch}
                  >
                    <Search className="w-5 h-5" /> Tìm kiếm
                  </Button>
               </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
               <span className="bg-blue-100 p-0.5 rounded">💳</span>
               <span>Thanh Toán Tại Khách Sạn</span>
            </div>
          </div>
        </div>

        {/* Domestic Destinations Section */}
        <section className="container mx-auto px-4 py-16">
           <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Điểm đến yêu thích trong nước</h2>
              <p className="text-gray-500">Lên rừng xuống biển. Trọn vẹn Việt Nam</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Large card - First destination */}
              <div className="lg:col-span-2 lg:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
                <img 
                  src={DOMESTIC_DESTINATIONS[0].image}
                  alt={DOMESTIC_DESTINATIONS[0].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 min-h-[400px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-3xl font-bold mb-1">{DOMESTIC_DESTINATIONS[0].name}</h3>
                  <p className="text-sm text-white/90">{DOMESTIC_DESTINATIONS[0].hotels} khách sạn</p>
                </div>
              </div>

              {/* Medium cards - Next 3 destinations */}
              {DOMESTIC_DESTINATIONS.slice(1, 4).map((dest, idx) => (
                <div key={idx} className="lg:col-span-1 relative rounded-2xl overflow-hidden group cursor-pointer h-[195px]">
                  <img 
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold mb-0.5">{dest.name}</h3>
                    <p className="text-xs text-white/90">{dest.hotels} khách sạn</p>
                  </div>
                </div>
              ))}

              {/* Small cards - Remaining destinations */}
              {DOMESTIC_DESTINATIONS.slice(4).map((dest, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden group cursor-pointer h-[195px]">
                  <img 
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold mb-0.5">{dest.name}</h3>
                    <p className="text-xs text-white/90">{dest.hotels} khách sạn</p>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* International Destinations Section */}
        <section className="container mx-auto px-4 py-16">
           <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Điểm đến yêu thích nước ngoài</h2>
              <p className="text-gray-500">Bao La Thế Giới Bốn Bể Là Nhà</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Large card - First destination */}
              <div className="lg:col-span-2 lg:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
                <img 
                  src={INTERNATIONAL_DESTINATIONS[0].image}
                  alt={INTERNATIONAL_DESTINATIONS[0].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 min-h-[400px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-3xl font-bold mb-1">{INTERNATIONAL_DESTINATIONS[0].name}</h3>
                  <p className="text-sm text-white/90">{INTERNATIONAL_DESTINATIONS[0].hotels} khách sạn</p>
                </div>
              </div>

              {/* Medium cards - Next 3 destinations */}
              {INTERNATIONAL_DESTINATIONS.slice(1, 4).map((dest, idx) => (
                <div key={idx} className="lg:col-span-1 relative rounded-2xl overflow-hidden group cursor-pointer h-[195px]">
                  <img 
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold mb-0.5">{dest.name}</h3>
                    <p className="text-xs text-white/90">{dest.hotels} khách sạn</p>
                  </div>
                </div>
              ))}

              {/* Small cards - Remaining destinations */}
              {INTERNATIONAL_DESTINATIONS.slice(4).map((dest, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden group cursor-pointer h-[195px]">
                  <img 
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold mb-0.5">{dest.name}</h3>
                    <p className="text-xs text-white/90">{dest.hotels} khách sạn</p>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* Recommendation Section 1 */}
        <section className="container mx-auto px-4 py-12">
           <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">🌴</span>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Chơi cuối tuần gần nhà</h2>
           </div>

           <div className="flex gap-2 overflow-x-auto mb-8 scrollbar-hide">
              {POPULAR_DESTINATIONS.map((loc, idx) => (
                <button key={idx} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${idx === 0 ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-blue-500 hover:bg-gray-200"}`}>
                  {loc}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {FEATURED_HOTELS.map((h, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={h.img} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                       <MapPin className="w-3 h-3" /> {h.loc}
                    </div>
                    {h.badge && (
                       <div className="absolute bottom-0 left-0 right-0 bg-[#0194f3]/90 text-white text-[10px] font-bold px-3 py-1.5 backdrop-blur-sm">
                         {h.badge}
                       </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-[#ff5e1f] text-white text-[10px] font-bold px-2 py-0.5 rounded italic shadow-sm">Tiết kiệm {h.discount}</div>
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 min-h-[40px] leading-snug group-hover:text-blue-600 transition-colors uppercase">{h.name}</h3>
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < h.stars ? "fill-yellow-400" : "text-gray-200"}`} />)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                       <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded-sm text-[10px]">{h.rating}</div>
                       <span className="text-gray-400">({h.reviews} đánh giá)</span>
                    </div>
                    <div className="pt-2 text-[10px] text-gray-400 line-through leading-none">{h.oldPrice} VND</div>
                    <div className="text-[#ff5e1f] font-black text-base">{h.price} VND</div>
                    <div className="text-[9px] text-gray-500">Chưa bao gồm thuế và phí</div>
                  </div>
                </div>
              ))}
              <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center border border-gray-100 -mr-4 z-10 hover:bg-gray-50 group">
                 <ChevronRight className="w-6 h-6 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
           </div>
        </section>

        {/* Partners Section */}
        <section className="container mx-auto px-4 py-16 border-t border-gray-100">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Đối tác khách sạn</h3>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Đối tác khách sạn trong nước & quốc tế</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                       Chúng tôi hợp tác với các chuỗi khách sạn uy tín toàn cầu để mang đến cho bạn chỗ ở thoải mái và đáng tin cậy, dù bạn đi bất cứ đâu.
                    </p>
                 </div>
                 <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
                    {HOTEL_PARTNERS.map((partner, idx) => (
                      <div key={idx} className="h-16 flex items-center justify-center group cursor-pointer">
                        <img 
                          src={partner.src} 
                          alt={partner.name}
                          className="h-full w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                        />
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Đối tác thanh toán</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                       Chúng tôi hợp tác với các nhà cung cấp dịch vụ thanh toán hàng đầu để đảm bảo mọi giao dịch đều suôn sẻ, an toàn và dễ dàng.
                    </p>
                 </div>
                 <div className="grid grid-cols-4 md:grid-cols-5 gap-6">
                    {PAYMENT_PARTNERS.map((partner, idx) => (
                      <div key={idx} className="h-12 flex items-center justify-center group cursor-pointer">
                        <img 
                          src={partner.src} 
                          alt={partner.name}
                          className="h-full w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                        />
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Why Book with us */}
        <section className="bg-white border-t border-gray-100 py-16">
          <div className="container mx-auto px-4">
             <h2 className="text-2xl font-bold text-center mb-12">Tại sao nên đặt chỗ với VivuTravel?</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {WHY_BOOK_REASONS.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl">{item.icon}</div>
                    <h4 className="font-bold text-sm text-gray-900 leading-snug">{item.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

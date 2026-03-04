/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationAutocomplete, type LocationSuggestion } from "@/components/ui/location-autocomplete";
import { MapPin, Calendar, User, Search, ChevronRight, Star, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";

// Helper function to format date for display
function formatDateShort(date: Date | null | undefined): string {
  if (!date) return "";
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day} thg ${month} ${year}`;
}

const TOUR_PARTNERS = [
  { name: "Saigontourist", src: "https://saigontourist.net/uploads/noidung/logo-saigontourist.png" },
  { name: "Vietravel", src: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Vietravel.png" },
  { name: "TST Tourist", src: "https://tsttourist.vn/wp-content/uploads/2023/05/TST-TOURIST-LOGO-01.png" },
  { name: "Fiditour", src: "https://fiditour.com.vn/images/logo.png" },
  { name: "Hanoitourist", src: "https://hanoitourist.vn/images/logo.png" },
  { name: "BenThanh Tourist", src: "https://benthanhtravel.com/upload/photo/logo.png" }
];

const PROMO_TABS = ["Mã giảm hot", "Tour nội địa", "Tour quốc tế", "Tour miền Trung"];

const POPULAR_DESTINATIONS = [
  "Đà Nẵng", "Đà Lạt", "Phú Quốc", "Nha Trang", 
  "Hạ Long", "Sapa", "Hội An", "Phan Thiết", "Quy Nhơn", "Mũi Né"
];

const POPULAR_COUNTRIES = [
  { id: "1", name: "Trung Quốc", image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=800&fit=crop" },
  { id: "2", name: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop" },
  { id: "3", name: "Thái Lan", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=400&fit=crop" },
  { id: "4", name: "Châu Âu", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=400&fit=crop" },
  { id: "5", name: "Nhật Bản", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop" }
];

const FEATURED_TOURS = [
  { 
    name: "Tour Đà Nẵng - Hội An - Bà Nà 3N2Đ", 
    loc: "Đà Nẵng", 
    rating: 9.2, 
    reviews: 856, 
    price: "3.990.000", 
    oldPrice: "4.990.000", 
    discount: "20%", 
    img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&h=400&fit=crop",
    duration: "3N2Đ",
    stars: 5 
  },
  { 
    name: "Tour Phú Quốc - Khám Phá Đảo Ngọc 4N3Đ", 
    loc: "Phú Quốc", 
    rating: 9.4, 
    reviews: 1243, 
    price: "5.490.000", 
    oldPrice: "6.990.000", 
    discount: "21%", 
    img: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=400&fit=crop",
    duration: "4N3Đ",
    stars: 5,
    badge: "Tour trọn gói, không phụ thu"
  },
  { 
    name: "Tour Đà Lạt - Thành Phố Ngàn Hoa 3N2Đ", 
    loc: "Đà Lạt", 
    rating: 8.8, 
    reviews: 2341, 
    price: "2.790.000", 
    oldPrice: "3.490.000", 
    discount: "20%", 
    img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&h=400&fit=crop",
    duration: "3N2Đ",
    stars: 4
  },
  { 
    name: "Tour Nha Trang - Biển Xanh Cát Trắng 3N2Đ", 
    loc: "Nha Trang", 
    rating: 9.0, 
    reviews: "1,8k", 
    price: "3.290.000", 
    oldPrice: "4.190.000", 
    discount: "21%", 
    img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=500&h=400&fit=crop", 
    duration: "3N2Đ",
    stars: 4,
    badge: "Bao gồm vé tham quan" 
  },
];

const PAYMENT_PARTNERS = [
  { name: "Mastercard", src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },
  { name: "JCB", src: "https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg" },
  { name: "VISA", src: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
  { name: "AMEX", src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" },
  { name: "VietQR", src: "https://vietqr.vn/img/vietqr_logo.svg" },
  { name: "Momo", src: "https://developers.momo.vn/v3/assets/images/logo.svg" },
  { name: "Vietcombank", src: "https://inkythuatso.com/uploads/thumbnails/800/2021/11/logo-vietcombank-inkythuatso-01-30-09-21-50.jpg" },
  { name: "VIB", src: "https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-VIB-Ori.png" },
  { name: "Techcombank", src: "https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-Techcombank-Ori.png" },
  { name: "MB", src: "https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-MBBank-B-H.png" }
];

const WHY_BOOK_REASONS = [
  { 
    title: "Giá tour tốt nhất với ưu đãi độc quyền", 
    desc: "Đặt tour qua ứng dụng để nhận giá tốt nhất với các khuyến mãi hấp dẫn mỗi ngày!", 
    icon: "🏷️" 
  },
  { 
    title: "Thanh toán linh hoạt và bảo mật", 
    desc: "Nhiều hình thức thanh toán an toàn: thẻ tín dụng, chuyển khoản, ví điện tử...", 
    icon: "💳" 
  },
  { 
    title: "Hỗ trợ khách hàng nhiệt tình 24/7", 
    desc: "Đội ngũ tư vấn viên chuyên nghiệp luôn sẵn sàng hỗ trợ bạn mọi lúc mọi nơi.", 
    icon: "☎️" 
  },
  { 
    title: "Hướng dẫn viên chuyên nghiệp", 
    desc: "Đội ngũ HDV giàu kinh nghiệm, am hiểu địa phương, nhiệt tình phục vụ.", 
    icon: "⭐" 
  },
];

export default function ToursLandingPage() {
  const router = useRouter();
  
  const [location, setLocation] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<LocationSuggestion | null>(null);
  const [guests, setGuests] = useState(2);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });
  
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setSelectedDestination(suggestion);
    setLocation(suggestion.name);
  };
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Prioritize destination_id over location name
    if (selectedDestination?.id) {
      params.set("destination_id", selectedDestination.id);
    } else if (location) {
      params.set("location", location);
    }
    
    params.set("guests", guests.toString());
    if (dateRange?.from) params.set("from", dateRange.from.toISOString());
    if (dateRange?.to) params.set("to", dateRange.to.toISOString());
    
    router.push(`/vi/tours/search?${params.toString()}`);
  };

  const handleCountryClick = (countryId: string) => {
    router.push(`/vi/tours/search?country_id=${countryId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="transparent" />
      
      <main>
        {/* Hero Section */}
        <section 
          className="relative pt-[120px] pb-40 overflow-hidden bg-cover bg-center bg-no-repeat min-h-[500px]"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=800&fit=crop")' }}
        >
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-1/2 text-white space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  Khám phá Việt Nam cùng những tour trọn gói tuyệt vời!
                </h1>
                <p className="text-lg text-white/90">
                  Hàng ngàn tour du lịch hấp dẫn với giá ưu đãi đặc biệt!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tour Search Box */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
               <div className="bg-blue-50 p-1.5 rounded-full">
                 <Search className="w-4 h-4 text-blue-600" />
               </div>
               <span className="text-sm font-bold text-blue-600">Tìm kiếm tour du lịch</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
               {/* Destination */}
               <div className="md:col-span-4 relative group">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Điểm đến:</div>
                  <div className="relative border border-gray-200 rounded-lg h-12 flex items-center hover:border-blue-400 transition-colors">
                     <MapPin className="ml-3 text-gray-400 w-5 h-5" />
                     <div className="flex-1 pl-2">
                       <LocationAutocomplete 
                         value={location}
                         onChange={setLocation}
                         onSelectLocation={handleLocationSelect}
                         placeholder="Nhập điểm đến, tên tour hoặc địa điểm"
                         mode="destinations-only"
                         className="border-none focus-visible:ring-0 text-sm font-medium"
                       />
                     </div>
                  </div>
               </div>

               {/* Date Range */}
               <div className="md:col-span-2">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ngày khởi hành:</div>
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
                         {dateRange?.to && ` - ${formatDateShort(dateRange.to)}`}
                       </span>
                    </div>
                  </DateRangePicker>
               </div>

               {/* Guests */}
               <div className="md:col-span-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Số khách:</div>
                  <div className="relative border border-gray-200 rounded-lg h-12 flex items-center px-3 gap-3 hover:border-blue-400 transition-colors">
                     <User className="text-gray-400 w-5 h-5 shrink-0" />
                     <Input 
                        type="number" 
                        min="1"
                        value={guests === 0 ? "" : guests}
                        onChange={(e) => setGuests(e.target.value === "" ? 0 : parseInt(e.target.value))}
                        onBlur={(e) => { if (e.target.value === "" || guests < 1) setGuests(1); }}
                        className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm font-bold p-0" 
                     />
                  </div>
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
               <span className="bg-blue-100 p-0.5 rounded">🎫</span>
               <span>Tour trọn gói - An tâm du lịch</span>
            </div>
          </div>
        </div>

        {/* Popular Destinations Section */}
        <section className="container mx-auto px-4 py-12">
           <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Các điểm du lịch phổ biến</h2>
              <p className="text-gray-500">Bao La Thế Giới Bốn Bể Là Nhà</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* First country - Large Card */}
              <div 
                onClick={() => handleCountryClick(POPULAR_COUNTRIES[0].id)}
                className="relative lg:row-span-2 h-[400px] lg:h-full rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img 
                  src={POPULAR_COUNTRIES[0].image}
                  alt={POPULAR_COUNTRIES[0].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-3xl font-bold">{POPULAR_COUNTRIES[0].name}</h3>
                </div>
              </div>

              {/* Rest of countries - Small Cards */}
              {POPULAR_COUNTRIES.slice(1).map((country) => (
                <div 
                  key={country.id}
                  onClick={() => handleCountryClick(country.id)}
                  className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <img 
                    src={country.image}
                    alt={country.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-2xl font-bold">{country.name}</h3>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* Featured Tours Section */}
        <section className="container mx-auto px-4 py-12">
           <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">🏖️</span>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tour du lịch trong nước hot nhất</h2>
           </div>

           <div className="flex gap-2 overflow-x-auto mb-8 scrollbar-hide">
              {POPULAR_DESTINATIONS.map((loc, idx) => (
                <button key={idx} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${idx === 0 ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-blue-500 hover:bg-gray-200"}`}>
                  {loc}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {FEATURED_TOURS.map((tour, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={tour.img} alt={tour.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                       <MapPin className="w-3 h-3" /> {tour.loc}
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                       <Clock className="w-3 h-3" /> {tour.duration}
                    </div>
                    {tour.badge && (
                       <div className="absolute bottom-0 left-0 right-0 bg-[#0194f3]/90 text-white text-[10px] font-bold px-3 py-1.5 backdrop-blur-sm">
                         {tour.badge}
                       </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-[#ff5e1f] text-white text-[10px] font-bold px-2 py-0.5 rounded italic shadow-sm">Giảm {tour.discount}</div>
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 min-h-[40px] leading-snug group-hover:text-blue-600 transition-colors uppercase">{tour.name}</h3>
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < tour.stars ? "fill-yellow-400" : "text-gray-200"}`} />)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                       <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded-sm text-[10px]">{tour.rating}</div>
                       <span className="text-gray-400">({tour.reviews} đánh giá)</span>
                    </div>
                    <div className="pt-2 text-[10px] text-gray-400 line-through leading-none">{tour.oldPrice} VND</div>
                    <div className="text-[#ff5e1f] font-black text-base">{tour.price} VND</div>
                    <div className="text-[9px] text-gray-500">Giá tour trọn gói/khách</div>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Đối tác du lịch</h3>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Các công ty lữ hành uy tín hàng đầu</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                       Chúng tôi hợp tác với các công ty lữ hành uy tín nhất Việt Nam để mang đến cho bạn những chuyến đi an toàn, chất lượng cao.
                    </p>
                 </div>
                 <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
                    {TOUR_PARTNERS.map((partner, idx) => (
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
             <h2 className="text-2xl font-bold text-center mb-12">Tại sao nên đặt tour với VivuTravel?</h2>
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

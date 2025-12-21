"use client";

import { useState } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  ChevronRight, 
  ArrowRightLeft,
  Ticket,
  Percent,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

export default function FlightsLandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("one-way");

  return (
    <div className="min-h-screen bg-white">
      <Header variant="transparent" />
      
      <main>
        {/* Hero Section with Background Image */}
        <section 
          className="relative pt-[100px] pb-40 overflow-hidden bg-cover bg-center min-h-[500px]"
          style={{ backgroundImage: 'url("https://i.pinimg.com/736x/17/75/45/17754515c07b18f83874fadf39af0578.jpg")' }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="container mx-auto px-4 relative z-10">
             <div className="pt-20 pb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Tìm & đặt vé máy bay giá rẻ, deal bay hấp dẫn cùng VivuTravel
                </h1>
             </div>
          </div>
        </section>

        {/* Flight Search Box - Overlapping */}
        <div className="container mx-auto px-4 -mt-32 relative z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 max-w-6xl mx-auto">
            {/* Search Tabs & Filters Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex bg-gray-100 p-1 rounded-full w-fit">
                {[
                  { id: "one-way", label: "Một chiều" },
                  { id: "round-trip", label: "Khứ hồi" },
                  { id: "multi-city", label: "Nhiều thành phố" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeTab === tab.id ? "bg-[#1ba0e2] text-white shadow-md" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                   <Checkbox id="direct-flight" className="border-gray-300 data-[state=checked]:bg-[#1ba0e2] data-[state=checked]:border-[#1ba0e2]" />
                   <label htmlFor="direct-flight" className="text-sm font-medium text-gray-600 cursor-pointer">Bay thẳng</label>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer group">
                   <Users className="w-4 h-4 text-gray-400 group-hover:text-[#1ba0e2]" />
                   <span>1 Người lớn, 0 Trẻ em, 0 Em bé</span>
                   <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer group">
                   <Plane className="w-4 h-4 text-gray-400 group-hover:text-[#1ba0e2]" />
                   <span>Phổ thông</span>
                   <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Inputs Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Từ</div>
                <div className="relative h-12 border border-gray-200 rounded-lg flex items-center px-4 hover:border-[#1ba0e2] focus-within:border-[#1ba0e2] transition-all">
                  <Plane className="w-5 h-5 text-gray-400 rotate-45 mr-3" />
                  <Input placeholder="TP HCM (SGN)" className="border-none focus-visible:ring-0 p-0 font-bold" />
                </div>
              </div>

              <div className="md:col-span-1 flex justify-center pb-2">
                 <button className="w-10 h-10 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-all">
                    <ArrowRightLeft className="w-4 h-4 text-[#1ba0e2]" />
                 </button>
              </div>

              <div className="md:col-span-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Đến</div>
                <div className="relative h-12 border border-gray-200 rounded-lg flex items-center px-4 hover:border-[#1ba0e2] focus-within:border-[#1ba0e2] transition-all">
                  <Plane className="w-5 h-5 text-gray-400 -rotate-45 mr-3" />
                  <Input placeholder="Bangkok (BKK)" className="border-none focus-visible:ring-0 p-0 font-bold" />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Ngày khởi hành</div>
                <div className="relative h-12 border border-gray-200 rounded-lg flex items-center px-4 hover:border-[#1ba0e2] cursor-pointer">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm font-bold">22 thg 12, 2025</span>
                </div>
              </div>

              <div className="md:col-span-3">
                 <Button 
                   className="w-full h-12 bg-[#0194f3] hover:bg-[#017ccb] text-white font-bold text-lg rounded-xl"
                   onClick={() => router.push("/vi/flights/search")}
                 >
                   Tìm chuyến bay
                 </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#1ba0e2]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Tìm ý tưởng chuyến bay thú vị ở đây</span>
            </div>
          </div>
        </div>

        {/* Big Promo Banner Section */}
        <section className="container mx-auto px-4 py-16">
           <div className="w-full h-56 md:h-80 bg-gradient-to-r from-[#0194f3] to-[#01c4f3] rounded-2xl relative overflow-hidden flex items-center shadow-xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="container mx-auto px-12 relative z-10 flex flex-col items-start gap-4 text-white">
                 <div className="text-6xl md:text-8xl font-black tracking-tighter drop-shadow-xl">SALE</div>
                 <div className="text-4xl md:text-5xl font-black tracking-tighter">CUỐI NĂM</div>
                 <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-2 rounded-full font-bold">
                    23.12.2025 - 6.1.2026
                 </div>
                 <div className="text-2xl font-bold uppercase tracking-widest text-[#ffdf00]">Sắp diễn ra</div>
              </div>
              <div className="absolute right-12 bottom-12 hidden md:block">
                 <div className="bg-[#ff5e1f] text-white p-8 rounded-2xl shadow-2xl rotate-12 flex flex-col items-center">
                    <span className="text-sm font-bold font-mono">FLASH SALE</span>
                    <span className="text-5xl font-black">50%</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Promo Code Cards Section */}
        <section className="container mx-auto px-4 py-8">
           <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Đặt vé trên web, mở app dùng mã ngay!</h2>
           </div>

           <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {["Mã thanh toán", "Mã VivuTravel", "Mã đối tác"].map((tab, idx) => (
                <button key={idx} className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${idx === 0 ? "bg-[#0194f3] text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {tab}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { bank: "TPBank", title: "Giảm 500K VND với thẻ TPBank", desc: "Tối thiểu giao dịch 2.5 triệu đồng bằng thẻ tín dụng TPBank", code: "TPBCCKS500", color: "#ed1c24" },
                { bank: "TPBank", title: "Giảm 500K VND với thẻ TPBank", desc: "Tối thiểu 2.5 triệu VND bằng thẻ ghi nợ TPBank", code: "TPBDBKS500", color: "#ed1c24" },
                { bank: "SeaBank", title: "Giảm giá 300K VND", desc: "Giao dịch tối thiểu 5 triệu VND bằng thẻ tín dụng SeaBank", code: "SB300", color: "#ec2027" },
              ].map((promo, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 mb-4">
                     <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                        <span className="text-[10px] font-black italic" style={{ color: promo.color }}>{promo.bank}</span>
                     </div>
                     <div>
                        <h4 className="font-bold text-sm text-gray-900 leading-snug">{promo.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{promo.desc}</p>
                     </div>
                  </div>
                  <div className="pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                     <div className="bg-gray-50 border border-gray-200 rounded px-3 py-1.5 flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-mono font-bold text-gray-700">{promo.code}</span>
                     </div>
                     <button className="text-blue-600 text-xs font-bold hover:underline">Copy</button>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* Domestic Flight Deals */}
        <section className="container mx-auto px-4 py-16">
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#1ba0e2] p-1.5 rounded-full">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Vé máy bay nội địa giá tốt nhất!</h2>
           </div>

           <div className="flex gap-2 overflow-x-auto mb-8 scrollbar-hide">
              {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Huế", "Phú Quốc", "Nha Trang", "Quy Nhơn", "Cần Thơ"].map((loc, idx) => (
                <button key={idx} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${idx === 0 ? "bg-[#0194f3] text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {loc}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative h-44 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1599708138407-3539860492cb?w=500&h=400&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">MỘT CHIỀU</div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-gray-900">{idx < 3 ? "TP HCM - Hà Nội" : idx === 3 ? "Đà Nẵng - Hà Nội" : "Huế - Hà Nội"}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                       <Calendar className="w-3.5 h-3.5" /> {idx === 3 ? "14 thg 1 2026" : "4 thg 3 2026"}
                    </div>
                    <div className="text-[#ff5e1f] font-black text-base">793.363 VND</div>
                  </div>
                </div>
              ))}
           </div>
           
           <div className="flex justify-center mt-8">
              <Button variant="outline" className="rounded-xl border-[#0194f3] text-[#0194f3] font-bold px-8 hover:bg-[#0194f3] hover:text-white group">
                Xem thêm ưu đãi bay <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
        </section>

        {/* International Deal List Row */}
        <section className="bg-gray-50/50 py-16">
          <div className="container mx-auto px-4">
             <h2 className="text-2xl font-bold text-gray-900 mb-8">Tìm Kiếm Các Deal Bay Rẻ Từ Việt Nam</h2>
             
             <div className="flex gap-4 mb-8">
                <button className="bg-blue-100 border border-blue-200 text-[#0194f3] px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                   Một Chiều <ChevronDown size={14} />
                </button>
                <button className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-sm font-bold">Nội Địa</button>
                <button className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-sm font-bold">Quốc Tế</button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  { airline: "VietJet Air", route: "TP HCM (SGN) ↔ Bangkok (BKK)", date: "Th 4, 24 thg 12, 2025", price: "1.479.501" },
                  { airline: "VietJet Air", route: "TP HCM (SGN) ↔ Singapore (SIN)", date: "Th 6, 26 thg 12, 2025", price: "1.151.599" },
                  { airline: "VietJet Air", route: "Singapore (SIN) ↔ TP HCM (SGN)", date: "Th 3, 30 thg 12, 2025", price: "1.844.401" },
                  { airline: "Vietravel Airlines", route: "Bangkok (BKK) ↔ TP HCM (SGN)", date: "Th 6, 16 thg 1, 2026", price: "1.771.857" },
                ].map((deal, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center p-2">
                        <span className="text-red-600 font-bold text-[8px] italic tracking-tighter">VietJet</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 font-medium">{deal.airline}</div>
                        <div className="text-sm font-bold text-gray-900 uppercase">{deal.route}</div>
                        <div className="text-xs text-gray-400">{deal.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[#0194f3] font-black text-lg leading-none">{deal.price} VND</div>
                        <div className="text-[10px] text-gray-400 font-medium mt-1">Một Chiều</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#0194f3] group-hover:translate-x-1 transition-all" />
                    </div>
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

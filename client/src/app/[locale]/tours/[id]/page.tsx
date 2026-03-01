"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toursApi } from "@/lib/services";
import type { Tour, ItineraryDay } from "@/types/api";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Check, 
  X, 
  Info,
  Image as ImageIcon,
  Minus,
  Plus,
  Phone,
  Search,
  Filter
} from "lucide-react";

// Điều Khoản & Lưu Ý - Fix cứng cho tất cả các tour
const TOUR_POLICIES = {
  surcharges: [
    "Phụ thu phòng đơn: 324.000đ/khách/tour. Lễ: 540.000đ/khách/tour.",
    "Phụ thu phòng ba: 54.000đ/khách/tour. Lễ: 108.000đ/khách/tour."
  ],
  childPolicy: [
    "Dưới 2 tuổi: Miễn phí, ngồi chung ghế và sử dụng chung dịch vụ với người lớn.",
    "Từ 2 - 4 tuổi: 400.000đ, tiêu chuẩn 1 ghế trên xe.",
    "Từ 5 - 9 tuổi: 70% giá người lớn.",
    "Từ 10 tuổi: 100% giá người lớn."
  ],
  cancellation: [
    "Huỷ tour trước 10 ngày: Hoàn 100% tiền tour.",
    "Huỷ tour từ 7-9 ngày: Hoàn 70% tiền tour.",
    "Huỷ tour từ 4-6 ngày: Hoàn 50% tiền tour.",
    "Huỷ tour từ 1-3 ngày: Không hoàn tiền."
  ]
};

// Interface cho departure dates với return date và price
interface DepartureDate {
  date: string;
  returnDate: string;
  status: "available" | "contact";
  price: number;
}

// Helper function để generate departure dates từ tour data
const generateDepartureDates = (tour: Tour | null): DepartureDate[] => {
  if (!tour?.departure_dates || tour.departure_dates.length === 0) {
    return [];
  }
  
  return tour.departure_dates.map((dateStr) => {
    const date = new Date(dateStr);
    const returnDate = new Date(date);
    returnDate.setDate(returnDate.getDate() + (tour.duration_days || 3) - 1);
    
    return {
      date: date.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0],
      status: "available" as const,
      price: tour.adult_price || 0
    };
  });
};

// Helper function để parse description thành highlights
const parseHighlights = (description: string | undefined): string[] => {
  if (!description) return [];
  
  // Split by common separators like period, newline, or bullet points
  const parts = description.split(/[.。\n]/).filter(part => part.trim().length > 20);
  
  if (parts.length >= 3) {
    return parts.slice(0, 5).map(p => p.trim());
  }
  
  // If not enough parts, return the whole description as one highlight
  return [description];
};

export default function TourDetailPage() {
  const params = useParams();
  const tourId = params.id as string;
  
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllItinerary, setShowAllItinerary] = useState(false);
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  
  // Guest counters
  const [adults, setAdults] = useState(4);
  const [children59, setChildren59] = useState(0);
  const [children24, setChildren24] = useState(0);
  const [infants, setInfants] = useState(0);
  
  // Sticky sidebar ref
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [sidebarTop, setSidebarTop] = useState(0);

  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true);
      try {
        const res = await toursApi.getById(tourId);
        if (res.success && res.data) {
          setTour(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch tour", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (tourId) {
      fetchTour();
    }
  }, [tourId]);

  // Sticky sidebar effect
  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current && contentRef.current) {
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        const headerHeight = 100; // Height of fixed header
        
        // Check if we should make sidebar sticky
        if (contentRect.top <= headerHeight && contentRect.bottom > sidebarRect.height + headerHeight) {
          setIsSticky(true);
          setSidebarTop(headerHeight);
        } else if (contentRect.bottom <= sidebarRect.height + headerHeight) {
          // Sidebar should stick to bottom of content
          setIsSticky(false);
          setSidebarTop(contentRect.height - sidebarRect.height);
        } else {
          setIsSticky(false);
          setSidebarTop(0);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayOfWeek = days[date.getDay()];
    return `${dayOfWeek}, ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Get departure dates from tour data
  const departureDates = generateDepartureDates(tour);
  
  // Calculate total price
  const selectedDate = departureDates[selectedDateIndex];
  const adultPrice = selectedDate?.price || tour?.adult_price || 0;
  const childPrice = (tour?.child_price || adultPrice * 0.7);
  const totalPrice = (adults * adultPrice) + (children59 * childPrice * 0.7) + (children24 * 400000);
  const originalPrice = totalPrice * 1.15; // Simulated original price (15% higher)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="blue" />
        <div className="pt-[120px] container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-[400px] bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 rounded" />
                <div className="h-64 bg-gray-200 rounded" />
              </div>
              <div className="h-96 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use tour data or fallback
  const images = tour?.images?.length ? tour.images : [
    "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
    "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"
  ];

  const departureLocation = tour?.departure_location_id && typeof tour.departure_location_id === 'object' 
    ? tour.departure_location_id.name 
    : "Hồ Chí Minh";

  // Get highlights from description
  const highlights = parseHighlights(tour?.description);
  
  // Get itinerary from tour data
  const itinerary: ItineraryDay[] = tour?.itinerary || [];
  
  // Get included services detail from tour data
  const includedServicesDetail = tour?.included_services_detail;
  
  // Get excluded services from tour data
  const excludedServices = tour?.excluded_services || [];

  // Filter for modal
  const availableMonths = [...new Set(departureDates.map(d => new Date(d.date).getMonth()))];
  
  const filteredDates = selectedMonth !== null 
    ? departureDates.filter(d => new Date(d.date).getMonth() === selectedMonth)
    : departureDates;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="blue" />
      
      <main className="pt-[100px] px-4 md:px-48">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: "Tours", href: "/vi/tours" },
              { label: tour?.name || "Chi tiết tour" }
            ]}
            className="mb-4"
          />

          {/* Tour Title Section */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a3c61] mb-3 leading-tight">
              {tour?.name || "Chi tiết tour"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Khởi hành từ: <strong className="text-gray-800">{departureLocation}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Mã Tour: <strong className="text-gray-800">{tour?.tour_code || tour?._id?.slice(-6).toUpperCase() || "T0452"}</strong></span>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
            {/* Main Image */}
            <div className="lg:col-span-2 relative rounded-xl overflow-hidden h-[300px] lg:h-[350px] group">
              <img 
                src={images[selectedImageIndex]} 
                alt={tour?.name || "Tour image"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-orange-500 text-white font-semibold px-3 py-1">
                  {tour?.duration_days || 3}N{(tour?.duration_days || 3) - 1}Đ
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>{images.length} ảnh</span>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              {images.slice(0, 4).map((img, idx) => (
                <div 
                  key={idx}
                  className={`relative rounded-xl overflow-hidden h-[140px] lg:h-[168px] cursor-pointer transition-all duration-300 ${
                    selectedImageIndex === idx ? 'ring-3 ring-blue-500' : 'hover:opacity-90'
                  }`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img 
                    src={img} 
                    alt={`Tour image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">+{images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content with Sticky Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6" ref={contentRef}>
            {/* Left Content */}
            <div className="flex-1 space-y-6">
              {/* Tour Highlights */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1a3c61] mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  Điểm Nổi Bật Tour
                </h2>
                <ul className="space-y-3">
                  {highlights.length > 0 ? (
                    highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-sm leading-relaxed">{highlight}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">Chưa có thông tin điểm nổi bật.</li>
                  )}
                </ul>
              </Card>

              {/* Tour Itinerary */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#1a3c61] flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    Chương trình tour
                  </h2>
                  {itinerary.length > 0 && (
                    <button 
                      className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                      onClick={() => setShowAllItinerary(!showAllItinerary)}
                    >
                      Xem tất cả
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {itinerary.length > 0 ? (
                    itinerary.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50/50 transition-colors duration-300 cursor-pointer group"
                      >
                        {item.image && (
                          <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`text-xs font-bold px-2 py-0.5 ${
                              item.day === 0 
                                ? 'border-purple-400 text-purple-600 bg-purple-50' 
                                : 'border-orange-400 text-orange-600 bg-orange-50'
                            }`}>
                              {item.day === 0 ? 'Đêm 1' : `Ngày ${item.day}`}
                            </Badge>
                            {item.meals && item.meals.length > 0 && (
                              <span className="text-xs text-gray-500">
                                ({item.meals.join(', ')})
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-xl">
                      Chưa có thông tin chương trình tour.
                    </div>
                  )}
                </div>
              </Card>

              {/* Included Services */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1a3c61] mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                  Giá Tour Bao Gồm
                </h2>
                
                {includedServicesDetail ? (
                  <div className="space-y-4 text-sm text-gray-700">
                    {includedServicesDetail.transport && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Vận Chuyển:</h4>
                        <p>- {includedServicesDetail.transport}</p>
                      </div>
                    )}
                    {includedServicesDetail.accommodation && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Lưu Trú:</h4>
                        <p>- {includedServicesDetail.accommodation}</p>
                      </div>
                    )}
                    {(includedServicesDetail.meals || includedServicesDetail.guide || (includedServicesDetail.extras && includedServicesDetail.extras.length > 0)) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Khác:</h4>
                        {includedServicesDetail.meals && <p>- {includedServicesDetail.meals}</p>}
                        {includedServicesDetail.guide && <p>- {includedServicesDetail.guide}</p>}
                        {includedServicesDetail.extras?.map((extra, idx) => (
                          <p key={idx}>- {extra}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Chưa có thông tin dịch vụ bao gồm.</div>
                )}
              </Card>

              {/* Excluded Services */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1a3c61] mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                  Giá Tour Không Bao Gồm
                </h2>
                
                {excludedServices.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {excludedServices.map((service, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>-</span>
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 text-sm">Chưa có thông tin dịch vụ không bao gồm.</div>
                )}
              </Card>

              {/* Terms & Policies - Fixed for all tours */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1a3c61] mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                  Điều Khoản & Lưu Ý
                </h2>
                
                <div className="space-y-6 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2 underline underline-offset-2">Chính sách phụ thu</h4>
                    {TOUR_POLICIES.surcharges.map((item, idx) => (
                      <p key={idx}>- {item}</p>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Giá Trẻ Em:</h4>
                    {TOUR_POLICIES.childPolicy.map((item, idx) => (
                      <p key={idx}>- {item}</p>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2 underline underline-offset-2">Chính sách huỷ tour</h4>
                    {TOUR_POLICIES.cancellation.map((item, idx) => (
                      <p key={idx}>- {item}</p>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Sidebar - Sticky Price Box */}
            <div className="lg:w-[380px] shrink-0">
              <div 
                ref={sidebarRef}
                className={`transition-all duration-300 ${
                  isSticky 
                    ? 'lg:fixed lg:w-[380px]' 
                    : ''
                }`}
                style={{ 
                  top: isSticky ? `${sidebarTop}px` : 'auto',
                  zIndex: 40
                }}
              >
                <Card className="overflow-hidden shadow-xl border-0">
                  <div className="bg-gradient-to-r from-[#469ae3] to-[#9cc2e4] text-white p-4">
                    <h3 className="text-lg font-bold mb-1">Lịch Khởi Hành và Giá Tour</h3>
                    <p className="text-sm text-blue-100">Chọn Lịch Khởi Hành và Xem Giá:</p>
                  </div>

                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2 flex-wrap">
                      {departureDates.length > 0 ? (
                        <>
                          {(() => {
                            const startIdx = selectedDateIndex < 3 ? 0 : selectedDateIndex - 2;
                            const datesToShow = departureDates.slice(startIdx, startIdx + 3);
                            
                            return datesToShow.map((date, i) => {
                              const actualIdx = startIdx + i;
                              const isSelected = actualIdx === selectedDateIndex;
                              
                              return (
                                <div key={actualIdx} className="relative">
                                  <button
                                    onClick={() => setSelectedDateIndex(actualIdx)}
                                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                    }`}
                                  >
                                    {formatDateShort(date.date)}
                                  </button>
                                  {isSelected && (
                                    <span className="absolute -top-2 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              );
                            });
                          })()}
                          
                          <button 
                            className="px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-1.5 transition-all duration-300"
                            onClick={() => setShowDatesModal(true)}
                          >
                            <Calendar className="w-4 h-4" />
                            Xem tất cả ({departureDates.length})
                          </button>
                        </>
                      ) : (
                        <div className="text-gray-500 text-sm">Chưa có lịch khởi hành</div>
                      )}
                    </div>
                    
                    {departureDates.length > 0 && selectedDate && (
                      <div className="mt-3 p-2 bg-blue-50/50 rounded-lg flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-gray-600">
                          Ngày đã chọn: 
                          <strong className="text-blue-600 ml-1">
                            {formatDate(selectedDate.date)}
                          </strong>
                          <span className="mx-2 text-gray-400">→</span>
                          <strong className="text-blue-600">
                            {formatDate(selectedDate.returnDate)}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Guest Selection */}
                  <div className="p-4 space-y-3 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Người lớn</div>
                        <div className="text-xs text-gray-500">&gt; 9 tuổi</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-orange-500 font-medium">
                          x {formatPrice(adultPrice)}
                        </span>
                        <div className="flex items-center gap-1 ml-2">
                          <button 
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-semibold">{adults}</span>
                          <button 
                            onClick={() => setAdults(adults + 1)}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>


                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Trẻ em</div>
                        <div className="text-xs text-gray-500">5 - 9 tuổi</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 ml-2">
                          <button 
                            onClick={() => setChildren59(Math.max(0, children59 - 1))}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-semibold">{children59}</span>
                          <button 
                            onClick={() => setChildren59(children59 + 1)}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>


                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Trẻ em</div>
                        <div className="text-xs text-gray-500">2 - 4 tuổi</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 ml-2">
                          <button 
                            onClick={() => setChildren24(Math.max(0, children24 - 1))}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-semibold">{children24}</span>
                          <button 
                            onClick={() => setChildren24(children24 + 1)}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>


                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Trẻ nhỏ</div>
                        <div className="text-xs text-gray-500">&lt; 2 tuổi</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 ml-2">
                          <button 
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-semibold">{infants}</span>
                          <button 
                            onClick={() => setInfants(infants + 1)}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* Contact Info */}
                  <div className="px-4 py-2 border-b bg-blue-50/50">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Phone className="w-4 h-4" />
                      <span>Liên hệ để xác nhận chỗ</span>
                    </div>
                  </div>


                  {/* Price Summary */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Giá gốc</span>
                      <span className="line-through text-gray-400">{formatPrice(originalPrice)} đ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Tổng Giá Tour</span>
                      <span className="text-2xl font-bold text-orange-500">{formatPrice(totalPrice)} đ</span>
                    </div>
                  </div>


                  {/* CTA Button */}
                  <div className="p-4 pt-0">
                    <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      Yêu cầu đặt
                    </Button>
                  </div>
                </Card>


              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Departure Dates Modal */}
      <Dialog open={showDatesModal} onOpenChange={setShowDatesModal}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-[#469ae3] to-[#9cc2e4] text-white p-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lịch khởi hành & giá tour
              </DialogTitle>
              <p className="text-blue-100 text-sm mt-1">
                Chọn ngày khởi hành phù hợp với lịch trình của bạn
              </p>
            </DialogHeader>
          </div>

          <div className="px-5 py-3 bg-gray-50 border-b flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Lọc theo tháng:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedMonth(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  selectedMonth === null
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                Tất cả
              </button>
              {availableMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    selectedMonth === month
                      ? 'bg-blue-500 text-white shadow-md scale-105'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  Tháng {month + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-white text-sm font-bold text-gray-700 border-b sticky top-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Ngày khởi hành
            </div>
            <div>Ngày về</div>
            <div>Tình trạng chỗ</div>
            <div className="text-right">Giá</div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {filteredDates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Không có lịch khởi hành trong tháng này</p>
              </div>
            ) : (
              filteredDates.map((date, idx) => {
                const originalIdx = departureDates.findIndex(d => d.date === date.date);
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedDateIndex(originalIdx);
                      setShowDatesModal(false);
                    }}
                    className={`grid grid-cols-4 gap-4 px-5 py-4 text-sm cursor-pointer transition-all duration-300 group border-b last:border-b-0 ${
                      selectedDateIndex === originalIdx 
                        ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                        : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-white border-l-4 border-l-transparent hover:border-l-orange-400'
                    }`}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      animation: 'fadeInUp 0.3s ease-out forwards'
                    }}
                  >
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {formatDate(date.date)}
                    </div>
                    <div className="text-gray-600">
                      {formatDate(date.returnDate)}
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        date.status === 'available' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          date.status === 'available' ? 'bg-green-500' : 'bg-orange-500'
                        }`} />
                        {date.status === 'available' ? 'Còn chỗ' : 'Liên hệ'}
                      </span>
                    </div>
                    <div className="text-right flex items-center justify-end gap-3">
                      <span className="font-bold text-orange-500 text-base group-hover:scale-110 transition-transform origin-right">
                        {formatPrice(date.price)} đ
                      </span>
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                        <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Hiển thị <strong className="text-gray-900">{filteredDates.length}</strong> lịch khởi hành
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowDatesModal(false)}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}

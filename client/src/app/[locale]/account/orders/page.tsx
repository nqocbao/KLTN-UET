"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  tourName: string;
  tourImage: string;
  departureDate: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  price: number;
  guests: number;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  // Mock data - replace with actual API call
  const upcomingOrders: Order[] = [];
  const historyOrders: Order[] = [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { label: "Chờ xác nhận", class: "bg-yellow-100 text-yellow-700" },
      confirmed: { label: "Đã xác nhận", class: "bg-green-100 text-green-700" },
      completed: { label: "Hoàn thành", class: "bg-blue-100 text-blue-700" },
      cancelled: { label: "Đã hủy", class: "bg-red-100 text-red-700" },
    };
    const config = statusConfig[status];
    return (
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", config.class)}>
        {config.label}
      </span>
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-72 h-48 relative mb-6">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          {/* Cloud background */}
          <ellipse cx="200" cy="260" rx="150" ry="20" fill="#E8F4FD" />
          
          {/* Main cloud */}
          <path
            d="M120 200 Q100 200 100 180 Q100 160 120 160 Q120 140 140 140 Q160 140 160 160 Q180 150 200 160 Q220 150 240 160 Q260 140 280 140 Q300 140 300 160 Q320 160 320 180 Q320 200 300 200 Z"
            fill="#DCE9F3"
          />
          
          {/* Person on paper plane */}
          <g transform="translate(150, 120)">
            {/* Paper plane */}
            <path
              d="M0 60 L80 40 L60 80 Z"
              fill="#4CADD4"
              stroke="#3A9BC7"
              strokeWidth="2"
            />
            <path
              d="M0 60 L80 40 L40 60 Z"
              fill="#5EC6E8"
            />
            
            {/* Person body */}
            <ellipse cx="35" cy="35" rx="12" ry="12" fill="#FFE0D0" />
            <path
              d="M25 45 Q35 55 45 45"
              fill="#4CADD4"
              stroke="none"
            />
            {/* Hair */}
            <path
              d="M25 30 Q35 20 45 30"
              fill="#5A4A3A"
              stroke="none"
            />
            {/* Arm */}
            <path
              d="M45 45 L55 55"
              stroke="#FFE0D0"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
          
          {/* Small clouds */}
          <ellipse cx="80" cy="140" rx="25" ry="15" fill="#E8F4FD" />
          <ellipse cx="320" cy="100" rx="30" ry="18" fill="#E8F4FD" />
          <ellipse cx="350" cy="160" rx="20" ry="12" fill="#DCE9F3" />
          
          {/* Birds */}
          <path d="M60 80 Q65 75 70 80" stroke="#4CADD4" strokeWidth="2" fill="none" />
          <path d="M340 70 Q345 65 350 70" stroke="#4CADD4" strokeWidth="2" fill="none" />
        </svg>
      </div>
      
      <p className="text-gray-500 text-lg">
        Hiện tại VivuTravel chưa có đơn hàng nào!
      </p>
    </div>
  );

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <img
          src={order.tourImage}
          alt={order.tourName}
          className="w-32 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {order.tourName}
            </h3>
            {getStatusBadge(order.status)}
          </div>
          <div className="mt-2 space-y-1 text-sm text-gray-500">
            <p>Ngày khởi hành: {order.departureDate}</p>
            <p>Số khách: {order.guests} người</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-orange-500">
              {formatPrice(order.price)}
            </span>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-gray-200 rounded-none">
          <TabsTrigger
            value="upcoming"
            className={cn(
              "px-6 py-4 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            )}
          >
            Chuyến đi sắp tới
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={cn(
              "px-6 py-4 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            )}
          >
            Lịch sử chuyến đi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="p-6 m-0">
          {upcomingOrders.length > 0 ? (
            <div className="space-y-4">
              {upcomingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        <TabsContent value="history" className="p-6 m-0">
          {historyOrders.length > 0 ? (
            <div className="space-y-4">
              {historyOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

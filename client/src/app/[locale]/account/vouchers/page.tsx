"use client";

import { useState } from "react";
import { Ticket, Clock, Gift, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  expiryDate: string;
  isUsed: boolean;
}

export default function VouchersPage() {
  const [activeTab, setActiveTab] = useState<"available" | "used" | "expired">("available");

  // Mock data - replace with actual API call
  const vouchers: Voucher[] = [];

  const filteredVouchers = vouchers.filter((v) => {
    if (activeTab === "available") return !v.isUsed && new Date(v.expiryDate) > new Date();
    if (activeTab === "used") return v.isUsed;
    return new Date(v.expiryDate) <= new Date();
  });

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discountType === "percent") {
      return `Giảm ${voucher.discountValue}%`;
    }
    return `Giảm ${voucher.discountValue.toLocaleString()}đ`;
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Ticket className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg mb-2">Chưa có voucher nào</p>
      <p className="text-gray-400 text-sm mb-4">Hãy khám phá các ưu đãi đặc biệt từ VivuTravel</p>
      <Button className="bg-blue-600 hover:bg-blue-700">
        Khám phá ưu đãi
      </Button>
    </div>
  );

  const VoucherCard = ({ voucher }: { voucher: Voucher }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Left side - Discount */}
        <div className="w-32 bg-gradient-to-br from-orange-500 to-orange-600 flex flex-col items-center justify-center p-4 text-white">
          <Gift className="w-8 h-8 mb-2" />
          <span className="text-lg font-bold text-center">{formatDiscount(voucher)}</span>
        </div>
        
        {/* Right side - Details */}
        <div className="flex-1 p-4">
          <h3 className="font-semibold text-gray-900">{voucher.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{voucher.description}</p>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>HSD: {new Date(voucher.expiryDate).toLocaleDateString("vi-VN")}</span>
            </div>
            {voucher.minOrderValue && (
              <div className="flex items-center gap-1">
                <span>Đơn tối thiểu: {voucher.minOrderValue.toLocaleString()}đ</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
              {voucher.code}
            </code>
            <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              Sao chép
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { key: "available", label: "Có thể sử dụng" },
            { key: "used", label: "Đã sử dụng" },
            { key: "expired", label: "Đã hết hạn" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredVouchers.length > 0 ? (
          <div className="space-y-4">
            {filteredVouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

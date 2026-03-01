"use client";

import { useState, useEffect } from "react";
import { Gift, Star, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PointHistory {
  id: string;
  type: "earned" | "spent";
  points: number;
  description: string;
  date: string;
}

export default function PointsPage() {
  const [user, setUser] = useState<{ name: string; points?: number } | null>(null);
  const [history, setHistory] = useState<PointHistory[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser({ ...parsed, points: parsed.points || 0 });
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, []);

  const totalPoints = user?.points || 0;

  return (
    <div className="space-y-6">
      {/* Points Balance Card */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90">Điểm VivuPoint của bạn</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold">{totalPoints.toLocaleString()}</span>
              <span className="text-lg opacity-80">điểm</span>
            </div>
            <p className="text-sm opacity-75 mt-2">
              Tương đương <span className="font-semibold">{(totalPoints * 1000).toLocaleString()}đ</span> khi đổi thưởng
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <Gift className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* How to earn points */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Cách tích điểm VivuPoint
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Đặt tour du lịch</h4>
            <p className="text-sm text-gray-500 mt-1">Nhận 1% giá trị đơn hàng dưới dạng điểm thưởng</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Viết đánh giá</h4>
            <p className="text-sm text-gray-500 mt-1">Nhận 50 điểm cho mỗi đánh giá chất lượng</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Gift className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Giới thiệu bạn bè</h4>
            <p className="text-sm text-gray-500 mt-1">Nhận 200 điểm khi bạn bè đặt tour đầu tiên</p>
          </div>
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Lịch sử điểm thưởng</h3>
        </div>
        
        {history.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {history.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.description}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
                <span className={`font-semibold ${item.type === "earned" ? "text-green-600" : "text-red-600"}`}>
                  {item.type === "earned" ? "+" : "-"}{item.points}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Chưa có lịch sử điểm thưởng</p>
            <Button className="mt-4 bg-teal-600 hover:bg-teal-700">
              Đặt tour để tích điểm
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

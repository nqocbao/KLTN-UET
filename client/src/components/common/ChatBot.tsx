"use client";

import { Headset, X, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#0194f3] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Headset className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Hỗ trợ VivuTravel</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-white/80">Trực tuyến</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[85%]">
              Xin chào! 👋 Tôi là trợ lý ảo của VivuTravel. Tôi có thể giúp gì cho bạn hôm nay?
            </div>
            
            <div className="flex flex-col gap-2">
               <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Gợi ý chủ đề:</p>
               <div className="flex flex-wrap gap-2">
                  {["Đổi lịch bay", "Hoàn tiền khách sạn", "Khuyến mãi mới", "Vấn đề thanh toán"].map((item, idx) => (
                    <button key={idx} className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors">
                      {item}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
             <Input 
               placeholder="Nhập tin nhắn..." 
               className="flex-1 bg-gray-50 border-none focus-visible:ring-0 text-sm h-10"
             />
             <Button size="icon" className="bg-[#0194f3] hover:bg-[#017ccb] rounded-full w-10 h-10 shrink-0 shadow-md">
                <Send className="w-4 h-4" />
             </Button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="flex items-center gap-3">
        {!isOpen && (
           <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 text-[13px] font-bold text-gray-700 animate-in fade-in slide-in-from-right-4 duration-500">
             Bạn cần hỗ trợ?
           </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-[#0194f3] text-white rounded-xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 group"
          title="Hỗ trợ khách hàng"
        >
          <Headset className={`w-8 h-8 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'group-hover:shake'}`} />
        </button>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .group-hover\\:shake {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

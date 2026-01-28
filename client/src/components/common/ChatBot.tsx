"use client";

import { Headset, X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Xin chào! 👋 Tôi là trợ lý ảo của VivuTravel. Tôi có thể giúp gì cho bạn hôm nay?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      text: textToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Call backend API that proxies to RASA
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/chatbot/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: textToSend,
            sender: "user_" + Date.now(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // RASA returns array of bot responses
      if (Array.isArray(data) && data.length > 0) {
        const botMessages: Message[] = data.map((msg: any) => ({
          text: msg.text || msg.custom?.text || "Xin lỗi, tôi không hiểu.",
          sender: "bot" as const,
          timestamp: new Date(),
        }));
        setMessages((prev) => [...prev, ...botMessages]);
      } else {
        // Fallback response
        setMessages((prev) => [
          ...prev,
          {
            text: "Xin lỗi, có lỗi khi xử lý. Vui lòng thử lại sau.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Xin lỗi, không thể kết nối đến hệ thống. Vui lòng kiểm tra lại kết nối.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

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
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl shadow-sm text-sm max-w-[85%] ${
                    message.sender === "user"
                      ? "bg-[#0194f3] text-white rounded-tr-none"
                      : "bg-white text-gray-700 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      message.sender === "user"
                        ? "text-white/70 text-right"
                        : "text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies - only show at the beginning */}
            {messages.length === 1 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                  Gợi ý chủ đề:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Tìm khách sạn ở Hà Nội",
                    "Tìm tour du lịch",
                    "Gợi ý điểm đến",
                    "Giá khách sạn",
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(item)}
                      disabled={isLoading}
                      className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-50 border-none focus-visible:ring-0 text-sm h-10 text-gray-900"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#0194f3] hover:bg-[#017ccb] rounded-full w-10 h-10 shrink-0 shadow-md disabled:opacity-50"
            >
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
          <Headset
            className={`w-8 h-8 transition-transform duration-300 ${
              isOpen ? "rotate-90" : "group-hover:shake"
            }`}
          />
        </button>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: rotate(0);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }
        .group-hover\\:shake {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Bot, ChevronRight, Sparkles, X } from "lucide-react";
import type { Message } from "@/components/chatbot/types";
import { CATEGORIES, API_URL } from "@/components/chatbot/constants";
import { getSenderId, renderMarkdown, extractEntitiesFromMessages } from "@/components/chatbot/helpers";
import { HotelCard } from "@/components/chatbot/HotelCard";
import { TourCard } from "@/components/chatbot/TourCard";
import { FlightCard } from "@/components/chatbot/FlightCard";
import { TripPackageCard } from "@/components/chatbot/TripPackageCard";
import { WelcomeScreen } from "@/components/chatbot/WelcomeScreen";
import { EntityPanel } from "@/components/chatbot/EntityPanel";

export default function ChatbotPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "vi";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("itinerary");
  const [senderId] = useState<string>(getSenderId);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const ensureConversationId = useCallback(async (): Promise<string | null> => {
    if (conversationId) return conversationId;

    try {
      const response = await fetch(`${API_URL}/chatbot/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: null }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      const createdId = data?._id || null;
      if (createdId) setConversationId(createdId);
      return createdId;
    } catch {
      return null;
    }
  }, [conversationId]);

  useEffect(() => {
    void ensureConversationId();
  }, [ensureConversationId]);

  const extractedEntities = extractEntitiesFromMessages(messages);

  const sendMessage = useCallback(
    async (messageText?: string) => {
      const textToSend = messageText || inputMessage.trim();
      if (!textToSend || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        text: textToSend,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputMessage("");
      setIsLoading(true);

      try {
        const activeConversationId = await ensureConversationId();

        // Determine which endpoint to use based on active category
        const endpoint =
          activeCategory === "itinerary"
            ? `${API_URL}/chatbot/recommend`
            : `${API_URL}/chatbot/message`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: textToSend,
            sender: senderId,
            category: activeCategory,
            conversation_id: activeConversationId,
          }),
        });

        if (!response.ok) throw new Error("API error");

        const data = await response.json();

        // Handle itinerary recommendation response
        if (activeCategory === "itinerary" && data.trip_package) {
          const intro: Message = {
            id: Date.now().toString() + "_intro",
            text: data.text || "Đây là gợi ý lịch trình của tôi cho bạn:",
            sender: "bot",
            timestamp: new Date(),
          };
          const pkgMsg: Message = {
            id: Date.now().toString() + "_pkg",
            trip_package: data.trip_package,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, intro, pkgMsg]);
        } else if (Array.isArray(data) && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const botMessages: Message[] = data.map((msg: Record<string, any>, i: number) => {
            if (msg.custom?.type && Array.isArray(msg.custom?.items)) {
              return {
                id: Date.now().toString() + i,
                cards: { type: msg.custom.type, items: msg.custom.items },
                sender: "bot" as const,
                timestamp: new Date(),
              };
            }
            return {
              id: Date.now().toString() + i,
              text: msg.text || msg.custom?.text || "Xin lỗi, tôi không hiểu.",
              sender: "bot" as const,
              timestamp: new Date(),
            };
          });
          setMessages((prev) => [...prev, ...botMessages]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text:
                data.text ||
                "Xin lỗi, tôi chưa hiểu yêu cầu. Bạn thử diễn đạt khác nhé!",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "Xin lỗi, không thể kết nối đến hệ thống. Vui lòng thử lại sau.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [activeCategory, ensureConversationId, inputMessage, isLoading, senderId]
  );

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    if (messages.length > 0) {
      const catLabel = CATEGORIES.find((c) => c.id === id)?.label || id;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_sys",
          text: `[Đã chuyển sang chủ đề: ${catLabel}]`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm z-10">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Trợ lý lịch trình VivuTravel
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400">Trực tuyến</span>
            </div>
          </div>
        </div>

        {/* Sidebar toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-gray-500" />
          ) : (
            <Sparkles className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } lg:flex flex-col w-full lg:w-72 xl:w-80 bg-white border-r border-gray-100 p-4 overflow-y-auto flex-shrink-0 z-10 absolute lg:relative inset-0 lg:inset-auto`}
        >
          {/* Category selection */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Chủ đề
            </p>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategorySelect(cat.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extracted entity panel */}
          <EntityPanel entities={extractedEntities} />

          {/* Quick questions */}
          {(() => {
            const cat = CATEGORIES.find((c) => c.id === activeCategory);
            if (!cat) return null;
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Gợi ý câu hỏi
                  </p>
                </div>
                <div className="space-y-1.5">
                  {cat.quickReplies.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSidebarOpen(false);
                        sendMessage(q);
                      }}
                      className="flex items-center justify-between w-full text-left text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg px-3 py-2 group"
                    >
                      <span className="leading-snug">{q}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-400 flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </aside>

        {/* Chat area */}
        <main className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {!hasMessages ? (
              <WelcomeScreen
                activeCategory={activeCategory}
                onCategorySelect={handleCategorySelect}
                onQuickReply={(text) => {
                  setSidebarOpen(false);
                  sendMessage(text);
                }}
              />
            ) : (
              <div className="max-w-2xl mx-auto space-y-4 pb-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Bot avatar */}
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] ${
                        message.sender === "user" ? "items-end" : "items-start"
                      } flex flex-col gap-1`}
                    >
                      {/* Trip package card */}
                      {message.trip_package && (
                        <TripPackageCard pkg={message.trip_package} />
                      )}

                      {/* Card list */}
                      {message.cards && (
                        <div className="w-full space-y-2">
                          {message.cards.type === "hotel_cards" &&
                            message.cards.items.map((item, i) => (
                              <HotelCard key={i} item={item} />
                            ))}
                          {message.cards.type === "tour_cards" &&
                            message.cards.items.map((item, i) => (
                              <TourCard key={i} item={item} />
                            ))}
                          {message.cards.type === "flight_cards" &&
                            message.cards.items.map((item, i) => (
                              <FlightCard key={i} item={item} />
                            ))}
                        </div>
                      )}

                      {/* Text message */}
                      {message.text && (
                        <div
                          className={`rounded-2xl text-sm px-4 py-3 shadow-sm ${
                            message.sender === "user"
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                          } ${
                            message.text.startsWith("[") && message.text.endsWith("]")
                              ? "text-xs italic opacity-60 bg-gray-100 text-gray-500 border-0 shadow-none"
                              : ""
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {renderMarkdown(message.text)}
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <span className="text-[10px] text-gray-400 px-1">
                        {message.timestamp.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex gap-1 items-center h-5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  activeCategory === "itinerary"
                    ? "Hãy mô tả chuyến đi bạn mong muốn..."
                    : "Hãy mô tả câu hỏi trong một câu..."
                }
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:opacity-60 transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
                aria-label="Gửi"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

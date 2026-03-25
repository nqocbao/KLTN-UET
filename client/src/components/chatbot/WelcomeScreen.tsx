import { Bot, ChevronRight, RefreshCw } from "lucide-react";
import { CATEGORIES } from "./constants";

export function WelcomeScreen({
  activeCategory,
  onCategorySelect,
  onQuickReply,
}: {
  activeCategory: string;
  onCategorySelect: (id: string) => void;
  onQuickReply: (text: string) => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === activeCategory);
  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-12 px-4 overflow-y-auto">
      <div className="text-center mb-8 max-w-md">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Xin chào! 👋</h2>
        <p className="text-gray-500">Hôm nay tôi có thể làm gì để giúp bạn?</p>
      </div>

      <div className="w-full max-w-xl mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
          Khách sạn &amp; Di chuyển
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${
                  isActive
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-transparent bg-white hover:bg-gray-50 shadow-sm"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "text-blue-600" : "text-gray-600"}`} />
                </div>
                <span className="text-xs font-medium text-center text-gray-700 leading-tight">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {cat && (
        <div className="w-full max-w-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600">Có thể bạn muốn hỏi</p>
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-col gap-2">
            {cat.quickReplies.map((q, i) => (
              <button
                key={i}
                onClick={() => onQuickReply(q)}
                className="flex items-center justify-between w-full text-left bg-white hover:bg-blue-50 transition-colors rounded-xl px-4 py-3 text-sm text-gray-700 shadow-sm border border-gray-100 group"
              >
                <span>{q}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

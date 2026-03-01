"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapPin, Search, TrendingUp, Ticket, Globe, Building2 } from "lucide-react";
import { smartSearchApi, type SmartSearchResultItem } from "@/lib/services/smart-search.service";
import { cn } from "@/lib/utils";

export interface SmartSearchSuggestion extends SmartSearchResultItem {
  fullName?: string;
}

interface SmartSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: SmartSearchSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export function SmartSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Tìm tour, điểm đến...",
  className,
}: SmartSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SmartSearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen, value]);

  // Debounced search
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await smartSearchApi.search(value, 20);
        
        if (res.success && res.data) {
          // Flatten and combine all results with priority
          const allResults: SmartSearchSuggestion[] = [
            ...res.data.tours.map(t => ({ ...t, priority: 1 })),
            ...res.data.destinations.map(d => ({ ...d, priority: 2 })),
            ...res.data.provinces.map(p => ({ ...p, priority: 3 })),
            ...res.data.countries.map(c => ({ ...c, priority: 4 })),
          ];

          setSuggestions(allResults);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Failed to search", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: SmartSearchSuggestion) => {
    onChange(suggestion.name);
    setIsOpen(false);
    onSelect?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tour': return <Ticket className="w-4 h-4 text-orange-500" />;
      case 'destination': return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'province': return <Building2 className="w-4 h-4 text-green-500" />;
      case 'country': return <Globe className="w-4 h-4 text-purple-500" />;
      default: return <MapPin className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tour': return 'Tour';
      case 'destination': return 'Điểm đến';
      case 'province': return 'Tỉnh/TP';
      case 'country': return 'Quốc gia';
      default: return '';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const dropdown = mounted && isOpen && (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[400px] overflow-y-auto"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
      }}
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id}`}
              className={cn(
                "px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-4",
                selectedIndex === index ? "bg-blue-50 border-blue-500" : "border-transparent"
              )}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{suggestion.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {getTypeLabel(suggestion.type)}
                    </span>
                  </div>
                  
                  {suggestion.type === 'tour' && (
                    <div className="text-sm text-gray-600">
                      {suggestion.duration && `${suggestion.duration}N${suggestion.duration - 1}Đ`}
                      {suggestion.price && ` • ${formatPrice(suggestion.price)}`}
                      {suggestion.rating && ` • ⭐ ${suggestion.rating}`}
                    </div>
                  )}
                  
                  {suggestion.type === 'destination' && suggestion.city && (
                    <div className="text-sm text-gray-500">{suggestion.city}</div>
                  )}
                  
                  {suggestion.description && (
                    <div className="text-xs text-gray-400 line-clamp-1 mt-1">
                      {suggestion.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : value.length >= 2 ? (
        <div className="p-4 text-center text-gray-500">
          Không tìm thấy kết quả
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent border-none outline-none text-base text-gray-700",
            "placeholder:text-gray-400",
            className
          )}
        />
      </div>
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}

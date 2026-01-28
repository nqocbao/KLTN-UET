"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin, Search, TrendingUp, Globe } from "lucide-react";
import { locationsApi, provincesApi, destinationsApi } from "@/lib/services";
import type { Province, Destination } from "@/types/api";
import { cn } from "@/lib/utils";

export interface LocationSuggestion {
  id: string;
  name: string;
  type: "country" | "province" | "destination" | "district" | "ward";
  country?: string;
  country_id?: string;
  province?: string;
  province_id?: string;
  district?: string;
  district_id?: string;
  fullName?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectLocation?: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  onSelectLocation,
  placeholder = "Thành phố, địa điểm hoặc tên khách sạn",
  className,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  // Popular destinations for when input is empty
  const [popularLocations, setPopularLocations] = useState<LocationSuggestion[]>([]);

  // Set mounted state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when input position changes
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

  // Update position on scroll
  useEffect(() => {
    if (!isOpen) return;
    
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Fetch popular locations on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const [provincesRes, destinationsRes] = await Promise.all([
          provincesApi.getAll({ limit: 5 }),
          destinationsApi.getAll({ limit: 5 }),
        ]);

        const popular: LocationSuggestion[] = [];

        if (provincesRes.success && provincesRes.data) {
          provincesRes.data.forEach((province: Province) => {
            popular.push({
              id: province._id,
              name: province.name,
              type: "province",
            });
          });
        }

        if (destinationsRes.success && destinationsRes.data) {
          destinationsRes.data.forEach((destination: Destination) => {
            popular.push({
              id: destination._id,
              name: destination.name,
              type: "destination",
              country: destination.country,
            });
          });
        }

        setPopularLocations(popular);
      } catch (error) {
        console.error("Failed to fetch popular locations:", error);
        // Set fallback popular locations
        setPopularLocations([
          { id: "1", name: "Hà Nội", type: "province" },
          { id: "2", name: "Hồ Chí Minh", type: "province" },
          { id: "3", name: "Đà Nẵng", type: "province" },
          { id: "4", name: "Nha Trang", type: "province" },
          { id: "5", name: "Phú Quốc", type: "destination" },
        ]);
      }
    };

    fetchPopular();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions(popularLocations);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Use the new unified search API
        const searchRes = await locationsApi.search(value, 20);

        const results: LocationSuggestion[] = [];

        if (searchRes.success && searchRes.data) {
          searchRes.data.forEach((location: any) => {
            results.push({
              id: location._id,
              name: location.name,
              type: location.type,
              country: location.country,
              country_id: location.country_id,
              province: location.province,
              province_id: location.province_id,
              district: location.district,
              district_id: location.district_id,
              fullName: location.fullName || location.name,
            });
          });
        }

        setSuggestions(results);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, popularLocations]);

  // Handle click outside
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

  const handleSelect = useCallback(
    (suggestion: LocationSuggestion) => {
      onChange(suggestion.name);
      if (onSelectLocation) {
        onSelectLocation(suggestion);
      }
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [onChange, onSelectLocation]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
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
        setSelectedIndex(-1);
        break;
    }
  };

  const dropdownContent = isOpen && mounted && (
    <div
      ref={dropdownRef}
      className="absolute bg-white rounded-lg shadow-xl border border-gray-200 max-h-[400px] overflow-y-auto z-[9999]"
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
          {!value && (
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Địa điểm phổ biến
            </div>
          )}
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3",
                selectedIndex === index && "bg-blue-50"
              )}
            >
              <div className="flex-shrink-0">
                {suggestion.type === "country" ? (
                  <Globe className="w-5 h-5 text-indigo-500" />
                ) : (
                  <MapPin
                    className={cn(
                      "w-5 h-5",
                      suggestion.type === "destination"
                        ? "text-orange-500"
                        : suggestion.type === "district"
                        ? "text-green-500"
                        : suggestion.type === "ward"
                        ? "text-purple-500"
                        : "text-blue-500"
                    )}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {suggestion.fullName || suggestion.name}
                </div>
                {(suggestion.country || suggestion.province || suggestion.district) && (
                  <div className="text-xs text-gray-500">
                    {suggestion.country || suggestion.province || suggestion.district}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs text-gray-400 capitalize">
                  {suggestion.type === "country"
                    ? "Quốc gia"
                    : suggestion.type === "province" 
                    ? "Tỉnh/TP" 
                    : suggestion.type === "district"
                    ? "Quận/Huyện"
                    : suggestion.type === "ward"
                    ? "Phường/Xã"
                    : "Điểm đến"}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Không tìm thấy địa điểm</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 border-0 bg-transparent focus:outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
        />
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
}

"use client";

import * as React from "react";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIRPORTS, filterAirports, type AirportOption } from "@/data/airports";

interface AirportAutocompleteProps {
  value: string;           // IATA code, e.g. "SGN"
  onChange: (code: string) => void;
  placeholder?: string;
  className?: string;
}

export function AirportAutocomplete({
  value,
  onChange,
  placeholder = "Chọn sân bay...",
  className,
}: AirportAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Selected airport from IATA code
  const selected = React.useMemo(
    () => AIRPORTS.find((a) => a.code === value) ?? null,
    [value]
  );

  // Filtered dropdown list
  const filtered = React.useMemo(() => filterAirports(query, 8), [query]);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setQuery("");
    setOpen(true);
  };

  const handleSelect = (airport: AirportOption) => {
    onChange(airport.code);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  // Display text when dropdown closed
  const displayText = selected ? `${selected.city} (${selected.code})` : "";

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={open ? query : displayText}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none font-bold text-sm placeholder:font-normal placeholder:text-gray-400 text-gray-800"
      />

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-[9999] w-[320px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Search hint row */}
          {query === "" && (
            <div className="px-4 py-2 text-[11px] text-gray-400 font-medium border-b border-gray-100 uppercase tracking-wider bg-gray-50">
              Sân bay phổ biến
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-400 text-center">
              Không tìm thấy sân bay
            </div>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto">
              {filtered.map((airport) => {
                const isSelected = airport.code === value;
                return (
                  <li
                    key={airport.code}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(airport);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors",
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    )}
                  >
                    {/* Left: icon + city/airport */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Plane
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isSelected ? "text-blue-500" : "text-gray-300"
                        )}
                      />
                      <div className="min-w-0">
                        <div
                          className={cn(
                            "font-bold text-sm leading-tight truncate",
                            isSelected ? "text-blue-600" : "text-gray-800"
                          )}
                        >
                          {airport.city}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {airport.airport} · {airport.country}
                        </div>
                      </div>
                    </div>

                    {/* Right: IATA badge */}
                    <span
                      className={cn(
                        "shrink-0 text-xs font-bold px-2 py-0.5 rounded-md",
                        isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {airport.code}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

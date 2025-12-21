"use client";

import * as React from "react";
import { Minus, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface GuestRoomValue {
  rooms: number;
  adults: number;
  children: number;
}

interface GuestRoomPickerProps {
  value: GuestRoomValue;
  onChange: (value: GuestRoomValue) => void;
  children?: React.ReactNode;
  className?: string;
}

export function GuestRoomPicker({
  value,
  onChange,
  children,
  className,
}: GuestRoomPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempValue, setTempValue] = React.useState<GuestRoomValue>(value);

  // Sync temp value when opening
  React.useEffect(() => {
    if (open) {
      setTempValue(value);
    }
  }, [open, value]);

  const handleApply = () => {
    onChange(tempValue);
    setOpen(false);
  };

  const updateValue = (key: keyof GuestRoomValue, delta: number) => {
    setTempValue((prev) => {
      const newValue = prev[key] + delta;
      // Min limit checks
      if (newValue < 0) return prev;
      if (key === "rooms" && newValue < 1) return prev;
      if (key === "adults" && newValue < 1) return prev;
      
      return { ...prev, [key]: newValue };
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className={cn("w-80 p-6 bg-white", className)} align="end">
        <div className="space-y-6">
          {/* Rooms (Now editable) */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-base text-gray-700">Rooms</span>
              <span className="text-xs text-gray-400">Number of rooms</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={() => updateValue("rooms", -1)}
                disabled={tempValue.rooms <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center font-medium text-lg">{tempValue.rooms}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => updateValue("rooms", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Adults */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-base text-gray-700">Adults</span>
              <span className="text-xs text-gray-400">18+ yrs</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={() => updateValue("adults", -1)}
                disabled={tempValue.adults <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center font-medium text-lg">{tempValue.adults}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => updateValue("adults", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-base text-gray-700">Children</span>
              <span className="text-xs text-gray-400">0-17 yrs</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={() => updateValue("children", -1)}
                disabled={tempValue.children <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center font-medium text-lg">{tempValue.children}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => updateValue("children", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button 
            className="w-full bg-[#1ba0e2] hover:bg-[#158abe] text-white font-medium h-10 rounded-lg mt-4"
            onClick={handleApply}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiClient } from "@/lib/api-client";

interface Airport {
  _id: string;
  name: string;
  code: string;
  city: string;
  country: string;
}

interface AirportAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
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
  const [airports, setAirports] = React.useState<Airport[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch airports on mount
  React.useEffect(() => {
    const fetchAirports = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<{ success: boolean; data: Airport[] }>(
          "/admin/destinations?type=airport&limit=100"
        );
        setAirports(response.data);
      } catch (error) {
        console.error("Error fetching airports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirports();
  }, []);

  // Filter airports based on search
  const filteredAirports = React.useMemo(() => {
    if (!airports || airports.length === 0) return [];
    if (!searchQuery) return airports;
    
    const query = searchQuery.toLowerCase();
    return airports.filter(
      (airport) =>
        airport.name.toLowerCase().includes(query) ||
        airport.code.toLowerCase().includes(query) ||
        airport.city.toLowerCase().includes(query)
    );
  }, [airports, searchQuery]);

  // Find selected airport
  const selectedAirport = React.useMemo(() => {
    if (!airports || airports.length === 0) return null;
    return airports.find((airport) => airport.code === value || airport.name === value);
  }, [airports, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-start p-0 h-auto font-normal hover:bg-transparent",
            className
          )}
        >
          {selectedAirport ? (
            <span className="truncate">
              {selectedAirport.name} ({selectedAirport.code})
            </span>
          ) : (
            <span className="text-gray-400 truncate">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm sân bay..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Đang tải..." : "Không tìm thấy sân bay"}
            </CommandEmpty>
            <CommandGroup>
              {filteredAirports.map((airport) => (
                <CommandItem
                  key={airport._id}
                  value={airport.code}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : airport.name + " (" + airport.code + ")");
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === airport.code || value === airport.name + " (" + airport.code + ")"
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <Plane className="mr-2 h-4 w-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {airport.name} ({airport.code})
                    </span>
                    <span className="text-xs text-gray-500">
                      {airport.city}, {airport.country}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

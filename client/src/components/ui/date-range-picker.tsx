"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: DateRange
  onChange?: (date: DateRange | undefined) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  triggerRef?: any // Deprecated but kept for type compatibility during transition if needed, though we will remove usage
}

export function DateRangePicker({
  value,
  onChange,
  open,
  onOpenChange,
  className,
  children,
}: DateRangePickerProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          autoFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}

export type { DateRange }


"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  min?: number
  max?: number
  step?: number
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, defaultValue, onValueChange, ...props }, ref) => {
    // Simplified single slider for now
    const [localValue, setLocalValue] = React.useState(defaultValue?.[0] || min)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value)
      setLocalValue(val)
      onValueChange?.([val, max]) // Mimic dual range structure [val, max]
    }
    
    // Controlled vs Uncontrolled
    const displayValue = value ? value[0] : localValue

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
           type="range"
           min={min}
           max={max}
           step={step}
           value={displayValue}
           onChange={handleChange}
           className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
           {...props as any}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }

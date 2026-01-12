import * as React from "react"
import { CalendarIcon, Check } from "lucide-react"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
interface TimeFilterProps {
  value: string | DateRange | undefined
  onValueChange: (value: string | DateRange | undefined) => void
  className?: string
  isLoading?: boolean
  mode?: "simple" | "advanced" // New prop to control complexity
}
export function TimeFilter({ 
  value, 
  onValueChange, 
  className, 
  isLoading = false,
  mode = "simple" 
}: TimeFilterProps) {
  // Convert string value to DateRange for advanced mode
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    if (mode === "advanced" && typeof value === "string") {
      return convertStringToDateRange(value)
    }
    if (mode === "advanced" && value && typeof value === "object") {
      return value as DateRange
    }
    return undefined
  })
  // Temporary state for pending changes in advanced mode
  const [tempDateRange, setTempDateRange] = React.useState<DateRange | undefined>(dateRange)
  const [isOpen, setIsOpen] = React.useState(false)
  // Convert DateRange to string for simple mode
  const stringValue = React.useMemo(() => {
    if (mode === "simple") {
      return typeof value === "string" ? value : "30d"
    }
    return "30d"
  }, [value, mode])
  // Helper function to convert string to DateRange
  function convertStringToDateRange(timeRange: string): DateRange {
    const now = new Date()
    switch (timeRange) {
      case "7d":
        return {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          to: now,
        }
      case "30d":
        return {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: now,
        }
      case "90d":
        return {
          from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          to: now,
        }
      default:
        return {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: now,
        }
    }
  }
  // Helper function to convert DateRange to string
  function convertDateRangeToString(range: DateRange | undefined): string {
    if (!range?.from || !range?.to) return "30d"
    
    const now = new Date()
    const daysDiff = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 7) return "7d"
    if (daysDiff <= 30) return "30d"
    if (daysDiff <= 90) return "90d"
    return "90d"
  }
  // Handle date range changes in advanced mode
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    if (mode === "advanced") {
      // In advanced mode, only update temporary state
      setTempDateRange(newRange)
    } else {
      // In simple mode, apply immediately
      setDateRange(newRange)
      const stringValue = convertDateRangeToString(newRange)
      onValueChange(stringValue)
    }
  }
  // Handle applying the temporary date range
  const handleApply = () => {
    setDateRange(tempDateRange)
    onValueChange(tempDateRange)
    setIsOpen(false)
  }
  // Handle canceling changes
  const handleCancel = () => {
    setTempDateRange(dateRange)
    setIsOpen(false)
  }
  // Reset temporary state when popover opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setTempDateRange(dateRange)
    }
  }
  // Handle string value changes in simple mode
  const handleStringValueChange = (newValue: string) => {
    if (mode === "simple") {
      onValueChange(newValue)
    }
  }
  // Helper function to check which shortcut is currently active
  const getActiveShortcut = React.useMemo(() => {
    if (mode === "simple") return null
    
    const currentRange = isOpen ? tempDateRange : dateRange
    if (!currentRange?.from || !currentRange?.to) return null
    const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    const currentFrom = normalizeDate(currentRange.from)
    const currentTo = normalizeDate(currentRange.to)
    const today = normalizeDate(new Date())
    const yesterday = normalizeDate(new Date(Date.now() - 24 * 60 * 60 * 1000))
    
    // Check for Today
    if (currentFrom.getTime() === today.getTime() && currentTo.getTime() === today.getTime()) {
      return "Today"
    }
    
    // Check for Yesterday
    if (currentFrom.getTime() === yesterday.getTime() && currentTo.getTime() === yesterday.getTime()) {
      return "Yesterday"
    }
    
    // Check for Last 7 days
    const last7DaysStart = normalizeDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    if (currentFrom.getTime() === last7DaysStart.getTime() && currentTo.getTime() === today.getTime()) {
      return "Last 7 days"
    }
    
    // Check for Last 30 days
    const last30DaysStart = normalizeDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    if (currentFrom.getTime() === last30DaysStart.getTime() && currentTo.getTime() === today.getTime()) {
      return "Last 30 days"
    }
    
    // Check for Last 90 days
    const last90DaysStart = normalizeDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
    if (currentFrom.getTime() === last90DaysStart.getTime() && currentTo.getTime() === today.getTime()) {
      return "Last 90 days"
    }
    
    // Check for This month
    const thisMonthStart = normalizeDate(new Date(today.getFullYear(), today.getMonth(), 1))
    if (currentFrom.getTime() === thisMonthStart.getTime() && currentTo.getTime() === today.getTime()) {
      return "This month"
    }
    
    // Check for Last month
    const lastMonthStart = normalizeDate(new Date(today.getFullYear(), today.getMonth() - 1, 1))
    const lastMonthEnd = normalizeDate(new Date(today.getFullYear(), today.getMonth(), 0))
    if (currentFrom.getTime() === lastMonthStart.getTime() && currentTo.getTime() === lastMonthEnd.getTime()) {
      return "Last month"
    }
    
    return null
  }, [dateRange, tempDateRange, isOpen, mode])
  // Predefined date range shortcuts
  const shortcuts = [
    {
      label: "Today",
      getValue: () => {
        const today = new Date()
        return {
          from: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          to: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        }
      },
    },
    {
      label: "Yesterday",
      getValue: () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return {
          from: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
          to: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
        }
      },
    },
    {
      label: "Last 7 days",
      getValue: () => ({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
    {
      label: "Last 30 days",
      getValue: () => ({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
    {
      label: "Last 90 days",
      getValue: () => ({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
    {
      label: "This month",
      getValue: () => {
        const now = new Date()
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: new Date(),
        }
      },
    },
    {
      label: "Last month",
      getValue: () => {
        const now = new Date()
        return {
          from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          to: new Date(now.getFullYear(), now.getMonth(), 0),
        }
      },
    },
  ]
  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-9 w-48" />
      </div>
    )
  }
  // Simple mode - original TimeFilter behavior
  if (mode === "simple") {
    return (
      <div className={className}>
        {/* Desktop/Tablet Toggle Group */}
        <ToggleGroup
          type="single"
          value={stringValue}
          onValueChange={handleStringValueChange}
          variant="outline"
          className="hidden *:data-[slot=toggle-group-item]:!px-4 md:flex"
        >
          <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
          <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
          <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
        </ToggleGroup>
        
        {/* Mobile Select */}
        <Select value={stringValue} onValueChange={handleStringValueChange}>
          <SelectTrigger
            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate md:hidden"
            size="sm"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }
  // Advanced mode - rich date range picker
  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-auto justify-between font-normal"
          >
            {dateRange?.from && dateRange?.to ? (
              <>
                {(() => {
                  const today = new Date()
                  const isToday = dateRange.from.getTime() === dateRange.to.getTime() &&
                    dateRange.from.getDate() === today.getDate() &&
                    dateRange.from.getMonth() === today.getMonth() &&
                    dateRange.from.getFullYear() === today.getFullYear()
                  
                  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
                  const isYesterday = dateRange.from.getTime() === dateRange.to.getTime() &&
                    dateRange.from.getDate() === yesterday.getDate() &&
                    dateRange.from.getMonth() === yesterday.getMonth() &&
                    dateRange.from.getFullYear() === yesterday.getFullYear()
                  
                  if (isToday) return "Today"
                  if (isYesterday) return "Yesterday"
                  return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                })()}
              </>
            ) : (
              "Select date range"
            )}
            <CalendarIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start" 
          side="bottom" 
          sideOffset={4} 
          alignOffset={-200}
          avoidCollisions={true}
          collisionPadding={16}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex">
            {/* Shortcuts Sidebar */}
            <div className="border-r p-2 w-48">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  {shortcuts.map((shortcut, index) => {
                    const isActive = getActiveShortcut === shortcut.label
                    return (
                      <div key={shortcut.label}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-between text-sm whitespace-nowrap px-2 py-1 h-auto ${
                            isActive ? "bg-accent text-accent-foreground" : ""
                          }`}
                          onClick={() => setTempDateRange(shortcut.getValue())}
                        >
                          <span className={isActive ? "font-medium" : ""}>{shortcut.label}</span>
                          {isActive && <Check className="h-3 w-3" />}
                        </Button>
                        {index === 1 && <div className="my-2 border-t border-border-muted" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="p-3">
              <Calendar
                mode="range"
                selected={tempDateRange}
                onSelect={setTempDateRange}
                numberOfMonths={2}
                className="rounded-md border-0"
                defaultMonth={new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)}
                disabled={(date) => {
                  const today = new Date()
                  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                  return dateNormalized > todayNormalized
                }}
              />
            </div>
          </div>
          
          {/* Apply/Cancel Buttons */}
          <div className="flex justify-end gap-2 p-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!tempDateRange?.from || !tempDateRange?.to}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
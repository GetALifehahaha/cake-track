import React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const DatePicker = ({ selected, onSelect, className }) => {

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selected}
          className={cn("data-[empty=true]:text-muted-foreground justify-start text-left font-normal hover:bg-main-dark border-none bg-main-dark/50 rounded-sm w-full", className)}
        >
          {selected ? format(selected, "PPP") : <span>Select Date</span>}
          <CalendarIcon className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" collisionPadding={8} className="w-auto p-0 bg-main border-main-dark">
        <Calendar className="" mode="single" selected={selected} onSelect={(value) => onSelect(value)} />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker

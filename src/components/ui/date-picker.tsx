"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Converts a calendar Date (local midnight) to a "YYYY-MM-DD" key using
 * local-time components so it is safe to compare with ISO date strings
 * regardless of the host timezone.
 */
function toLocalDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  disabledDates,
  className,
}: {
  id?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  /** Range / custom disable predicate (e.g. before today, after max date). */
  disabled?: (date: Date) => boolean;
  /** ISO date strings ("YYYY-MM-DD") that are already booked and cannot be selected. */
  disabledDates?: string[];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const mergedDisabled = React.useCallback(
    (date: Date): boolean => {
      if (disabled?.(date)) return true;
      if (disabledDates && disabledDates.length > 0) {
        return disabledDates.includes(toLocalDateKey(date));
      }
      return false;
    },
    [disabled, disabledDates],
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        {/* type="button" is required to prevent accidental form submission */}
        <Button
          className={cn(
            "h-auto justify-start gap-2 px-0 font-semibold text-[#1a2b48] hover:bg-transparent hover:text-[#1a2b48]",
            !value && "text-neutral-400",
            className,
          )}
          id={id}
          type="button"
          variant="ghost"
        >
          <CalendarIcon aria-hidden className="size-4 shrink-0" />
          {value ? format(value, "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-0 [--accent:#1a2b48] [--accent-foreground:#ffffff] [--foreground:#1a2b48] [--muted:#eef1f6] [--muted-foreground:#64748b] [--popover:#ffffff] [--popover-foreground:#1a2b48] [--primary:#D68A6E] [--primary-foreground:#ffffff] [--ring:#1a2b48]"
      >
        <Calendar
          disabled={mergedDisabled}
          mode="single"
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          selected={value}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };

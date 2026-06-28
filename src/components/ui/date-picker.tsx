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

function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
}: {
  id?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "h-auto justify-start gap-2 px-0 font-semibold text-[#1a2b48] hover:bg-transparent hover:text-[#1a2b48]",
            !value && "text-neutral-400",
            className,
          )}
          id={id}
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
          disabled={disabled}
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

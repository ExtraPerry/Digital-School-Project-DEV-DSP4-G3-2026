"use client";

import { useState } from "react";
import { MapPin, Calendar, Sailboat, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { HeroSearchBar, HeroSearchDefaultValues } from "@/components/landing/hero-search-bar";
import type { BoatSearchFilters } from "@/queries/fetchBoats";

function formatDisplayDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function SearchSummaryBar({
  filters,
  ports,
  typeLabel,
}: {
  filters: BoatSearchFilters;
  ports: string[];
  typeLabel: string;
}) {
  const t = useTranslations("Pages.SearchPage");
  const [isOpen, setIsOpen] = useState(false);

  const defaultValues: HeroSearchDefaultValues = {
    port: filters.port,
    from: new Date(filters.from),
    to: new Date(filters.to),
    type: filters.types?.[0]?.toLowerCase() as HeroSearchDefaultValues["type"],
  };

  return (
    <div className="border-b border-neutral-200 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-[#1a2b48]">
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden className="size-4 text-[#D68A6E]" />
            {filters.port}
          </span>
          <span aria-hidden className="hidden text-neutral-300 sm:block">·</span>
          <span className="flex items-center gap-1.5">
            <Calendar aria-hidden className="size-4 text-[#D68A6E]" />
            {formatDisplayDate(filters.from)} — {formatDisplayDate(filters.to)}
          </span>
          <span aria-hidden className="hidden text-neutral-300 sm:block">·</span>
          <span className="flex items-center gap-1.5">
            <Sailboat aria-hidden className="size-4 text-[#D68A6E]" />
            {typeLabel}
          </span>
        </div>
        <Button
          className="shrink-0 gap-1.5 rounded-lg bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
          onClick={() => setIsOpen(true)}
          size="sm"
        >
          <Pencil aria-hidden className="size-3.5" />
          {t("modify_button")}
        </Button>
      </div>

      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl" side="top">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-[#1a2b48]">
              {t("modify_button")}
            </SheetTitle>
          </SheetHeader>
          <div className="flex justify-center py-4">
            <HeroSearchBar
              defaultValues={defaultValues}
              ports={ports}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

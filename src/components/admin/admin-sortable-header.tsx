"use client";

import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortDirection } from "@/types/AdminList";

export function AdminSortableHeader<TColumn extends string>({
  column,
  labelKey,
  activeColumn,
  direction,
  onSort,
  align = "left",
}: {
  column: TColumn;
  labelKey: string;
  activeColumn: TColumn;
  direction: SortDirection;
  onSort: (column: TColumn) => void;
  align?: "left" | "right";
}) {
  const t = useTranslations("Pages.AdminSpace");
  const isActive = activeColumn === column;
  const Icon = !isActive ? ChevronsUpDown : direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <TableHead
      //? aria-sort exposes the current ordering to assistive technology, which
      //? the icon alone does not.
      aria-sort={
        isActive ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn("text-[#5b6b7c]", align === "right" && "text-right")}
    >
      <button
        className={cn(
          "inline-flex items-center gap-1 rounded-sm font-medium transition-colors hover:text-[#1a2b48] focus-visible:ring-2 focus-visible:ring-[#1a2b48] focus-visible:outline-none",
          isActive && "text-[#1a2b48]",
        )}
        onClick={() => onSort(column)}
        type="button"
      >
        {t(labelKey)}
        <Icon
          aria-hidden
          className={cn("size-3.5", isActive ? "opacity-100" : "opacity-40")}
        />
        <span className="sr-only">
          {isActive
            ? direction === "asc"
              ? t("sort_ascending")
              : t("sort_descending")
            : t("sort_none")}
        </span>
      </button>
    </TableHead>
  );
}

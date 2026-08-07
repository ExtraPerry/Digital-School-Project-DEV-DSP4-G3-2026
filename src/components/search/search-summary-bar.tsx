"use client";

import { MapPin, Calendar, Sailboat } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchCriteriaDialog } from "@/components/search/search-criteria-dialog";
import { formatISODate } from "@/lib/dates";
import type { BoatSearchFilters } from "@/queries/fetchBoats";

/**
 * Recap of the criteria currently in effect, with the control that edits them.
 * Each one falls back to its neutral wording rather than disappearing, so the
 * bar keeps the same shape whether the visitor arrived from the hero search or
 * from the landing page's "See all" link.
 */
export function SearchSummaryBar({
  filters,
  ports,
  typeLabel,
  onApply,
}: {
  filters: BoatSearchFilters;
  ports: string[];
  /** Null when no boat type is selected. */
  typeLabel: string | null;
  onApply: (updates: Partial<BoatSearchFilters>) => void;
}) {
  const t = useTranslations("Pages.SearchPage");

  const criteria = [
    {
      id: "port",
      icon: MapPin,
      label: filters.port ?? t("criteria_all_ports"),
    },
    {
      id: "dates",
      icon: Calendar,
      label:
        filters.from && filters.to
          ? `${formatISODate(filters.from)} — ${formatISODate(filters.to)}`
          : t("criteria_any_dates"),
    },
    {
      id: "types",
      icon: Sailboat,
      label: typeLabel ?? t("criteria_all_types"),
    },
  ];

  return (
    <div className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2">
        <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-[#1a2b48] sm:gap-x-3">
          {criteria.map(({ id, icon: Icon, label }, index) => (
            <span className="flex min-w-0 items-center gap-1.5" key={id}>
              {index > 0 ? (
                <span aria-hidden className="mr-1 hidden text-neutral-300 sm:inline">
                  ·
                </span>
              ) : null}
              <Icon aria-hidden className="size-4 shrink-0 text-[#D68A6E]" />
              <span className="truncate">{label}</span>
            </span>
          ))}
        </p>

        <SearchCriteriaDialog
          filters={filters}
          onApply={onApply}
          ports={ports}
        />
      </div>
    </div>
  );
}

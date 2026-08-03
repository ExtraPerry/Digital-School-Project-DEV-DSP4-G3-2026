"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AdminFilterOption = { value: string; labelKey: string };

export type AdminFilterSelect = {
  id: string;
  labelKey: string;
  value: string;
  options: readonly AdminFilterOption[];
  onChange: (value: string) => void;
};

const SEARCH_DEBOUNCE_MS = 300;

export function AdminTableToolbar({
  search,
  onSearchChange,
  searchPlaceholderKey,
  filters = [],
  resultCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholderKey: string;
  filters?: readonly AdminFilterSelect[];
  resultCount: number | null;
}) {
  const t = useTranslations("Pages.AdminSpace");
  const [draft, setDraft] = useState(search);

  //? Local draft + debounce so each keystroke does not become a query key and
  //? a round-trip. Re-syncs when the parent resets filters.
  useEffect(() => {
    setDraft(search);
  }, [search]);

  useEffect(() => {
    if (draft === search) {
      return;
    }

    const timeout = setTimeout(() => onSearchChange(draft), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [draft, search, onSearchChange]);

  const hasActiveFilter =
    search.trim().length > 0 || filters.some((filter) => filter.value !== "ALL");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-56 flex-1 flex-col gap-1.5">
          <Label className="text-xs text-[#5b6b7c]" htmlFor="admin-search">
            {t("search_label")}
          </Label>
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
            />
            <Input
              className="pl-9"
              id="admin-search"
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t(searchPlaceholderKey)}
              type="search"
              value={draft}
            />
          </div>
        </div>

        {filters.map((filter) => (
          <div className="flex min-w-40 flex-col gap-1.5" key={filter.id}>
            <Label className="text-xs text-[#5b6b7c]" htmlFor={filter.id}>
              {t(filter.labelKey)}
            </Label>
            <Select onValueChange={filter.onChange} value={filter.value}>
              <SelectTrigger className="w-full" id={filter.id}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {hasActiveFilter ? (
          <Button
            className="h-9 border-neutral-200 text-[#1a2b48]"
            onClick={() => {
              setDraft("");
              onSearchChange("");
              filters.forEach((filter) => filter.onChange("ALL"));
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            <X aria-hidden className="size-3.5" />
            {t("filters_reset")}
          </Button>
        ) : null}
      </div>

      <p aria-live="polite" className="text-xs text-[#5b6b7c]">
        {resultCount === null
          ? t("loading")
          : t("results_count", { count: resultCount })}
      </p>
    </div>
  );
}

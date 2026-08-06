"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SearchBreadcrumbs } from "@/components/search/search-breadcrumbs";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { SearchSummaryBar } from "@/components/search/search-summary-bar";
import type {
  BoatFilterBounds,
  BoatSearchFilters,
} from "@/queries/fetchBoats";

export function SearchPageClient({
  filters,
  ports,
  bounds,
  searchParamsString,
}: {
  filters: BoatSearchFilters;
  ports: string[];
  bounds: BoatFilterBounds;
  searchParamsString: string;
}) {
  const t = useTranslations("Pages.SearchPage");
  const tLanding = useTranslations("Pages.LandingPage");
  const router = useRouter();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const typeLabel =
    filters.types && filters.types.length === 1
      ? tLanding(
          `search_type_${filters.types[0].toLowerCase()}` as Parameters<typeof tLanding>[0],
        )
      : filters.types && filters.types.length > 1
        ? filters.types
            .map((t) =>
              tLanding(
                `search_type_${t.toLowerCase()}` as Parameters<typeof tLanding>[0],
              ),
            )
            .join(", ")
        : tLanding("search_type_sailboat");

  function updateSearchParams(updates: Partial<BoatSearchFilters>) {
    const currentParams = new URLSearchParams(searchParamsString);

    if (updates.types !== undefined) {
      currentParams.delete("types");
      updates.types.forEach((t) => currentParams.append("types", t));
    }
    if (updates.skipperIncluded !== undefined) {
      if (updates.skipperIncluded) {
        currentParams.set("skipper", "true");
      } else {
        currentParams.delete("skipper");
      }
    }
    if (updates.minPrice !== undefined) {
      currentParams.set("minPrice", String(updates.minPrice));
    } else if ("minPrice" in updates) {
      currentParams.delete("minPrice");
    }
    if (updates.maxPrice !== undefined) {
      currentParams.set("maxPrice", String(updates.maxPrice));
    } else if ("maxPrice" in updates) {
      currentParams.delete("maxPrice");
    }
    if (updates.minLength !== undefined) {
      currentParams.set("minLength", String(updates.minLength));
    } else if ("minLength" in updates) {
      currentParams.delete("minLength");
    }
    if (updates.maxLength !== undefined) {
      currentParams.set("maxLength", String(updates.maxLength));
    } else if ("maxLength" in updates) {
      currentParams.delete("maxLength");
    }
    if (updates.equipment !== undefined) {
      currentParams.delete("equipment");
      updates.equipment.forEach((e) => currentParams.append("equipment", e));
    }
    if (updates.sortBy !== undefined) {
      if (updates.sortBy === "relevance") {
        currentParams.delete("sortBy");
      } else {
        currentParams.set("sortBy", updates.sortBy);
      }
    }
    if (updates.page !== undefined) {
      if (updates.page === 1) {
        currentParams.delete("page");
      } else {
        currentParams.set("page", String(updates.page));
      }
    }

    router.push(`/search?${currentParams.toString()}`);
    setIsMobileFiltersOpen(false);
  }

  return (
    <>
      <SearchSummaryBar filters={filters} ports={ports} typeLabel={typeLabel} />

      <div className="min-h-screen bg-[#f7f8fa]">
        <SearchBreadcrumbs port={filters.port} typeLabel={typeLabel} />

        <div className="mx-auto max-w-6xl px-6 pb-16 pt-4">
          {/* Mobile filters button */}
          <div className="mb-4 lg:hidden">
            <Button
              className="gap-2 rounded-xl border border-neutral-200 bg-white text-[#1a2b48] shadow-sm hover:bg-neutral-50"
              onClick={() => setIsMobileFiltersOpen(true)}
              variant="outline"
            >
              <SlidersHorizontal aria-hidden className="size-4" />
              {t("open_filters")}
            </Button>
          </div>

          <div className="flex gap-6">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
              <SearchFilters
                bounds={bounds}
                filters={filters}
                onApply={updateSearchParams}
              />
            </div>

            {/* Results */}
            <SearchResults
              filters={filters}
              onSortChange={(sortBy) => updateSearchParams({ sortBy, page: 1 })}
              searchParamsString={searchParamsString}
            />
          </div>
        </div>
      </div>

      {/* Mobile filters sheet */}
      <Sheet onOpenChange={setIsMobileFiltersOpen} open={isMobileFiltersOpen}>
        <SheetContent className="w-full overflow-y-auto" side="left">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-[#1a2b48]">
              {t("filters_title")}
            </SheetTitle>
          </SheetHeader>
          <SearchFilters
            bounds={bounds}
            filters={filters}
            onApply={updateSearchParams}
          />
        </SheetContent>
      </Sheet>

    </>
  );
}

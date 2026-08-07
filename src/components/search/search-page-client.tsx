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
    filters.types && filters.types.length > 0
      ? filters.types
          .map((type) =>
            tLanding(
              `search_type_${type.toLowerCase()}` as Parameters<
                typeof tLanding
              >[0],
            ),
          )
          .join(", ")
      : null;

  /**
   * Single writer for the query string, shared by the criteria dialog, the
   * sidebar and the sort select. A criterion set back to its neutral value is
   * deleted rather than serialised, so clearing everything lands on a bare
   * `/search` — the same URL the landing page's "See all" link opens.
   */
  function updateSearchParams(updates: Partial<BoatSearchFilters>) {
    const currentParams = new URLSearchParams(searchParamsString);

    function setOrDelete(key: string, value: string | null | undefined) {
      if (value === null || value === undefined || value === "") {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    }

    function setOrDeleteAll(key: string, values: readonly string[] | undefined) {
      currentParams.delete(key);
      values?.forEach((value) => currentParams.append(key, value));
    }

    //? Presence of the key — not its value — decides whether a param is
    //? rewritten, because `undefined` is how the sidebar says "cleared".
    //? Testing `!== undefined` would make unchecking the last boat type or the
    //? last equipment silently keep the old param.
    if ("port" in updates) {
      setOrDelete("port", updates.port);
    }
    if ("from" in updates) {
      setOrDelete("from", updates.from);
    }
    if ("to" in updates) {
      setOrDelete("to", updates.to);
    }
    if ("types" in updates) {
      setOrDeleteAll("types", updates.types);
      // The hero search bar still writes the singular `type`; dropping it keeps
      // a single source of truth once `types` has been written.
      currentParams.delete("type");
    }
    if ("skipperIncluded" in updates) {
      setOrDelete("skipper", updates.skipperIncluded ? "true" : null);
    }
    if ("minPrice" in updates) {
      setOrDelete("minPrice", updates.minPrice?.toString());
    }
    if ("maxPrice" in updates) {
      setOrDelete("maxPrice", updates.maxPrice?.toString());
    }
    if ("minLength" in updates) {
      setOrDelete("minLength", updates.minLength?.toString());
    }
    if ("maxLength" in updates) {
      setOrDelete("maxLength", updates.maxLength?.toString());
    }
    if ("equipment" in updates) {
      setOrDeleteAll("equipment", updates.equipment);
    }
    if ("sortBy" in updates) {
      setOrDelete(
        "sortBy",
        updates.sortBy === "relevance" ? null : updates.sortBy,
      );
    }
    if ("page" in updates) {
      setOrDelete("page", updates.page === 1 ? null : updates.page?.toString());
    }

    const queryString = currentParams.toString();

    router.push(queryString ? `/search?${queryString}` : "/search");
    setIsMobileFiltersOpen(false);
  }

  return (
    <>
      <SearchSummaryBar
        filters={filters}
        onApply={updateSearchParams}
        ports={ports}
        typeLabel={typeLabel}
      />

      <div className="min-h-screen bg-[#f7f8fa]">
        <SearchBreadcrumbs port={filters.port} typeLabel={typeLabel} />

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
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
              {/*
                Keyed on the query string: the sidebar seeds a TanStack Form
                from the URL once, so without a remount it would keep showing
                the previous boat types after the criteria dialog (or the back
                button) changed them.
              */}
              <SearchFilters
                bounds={bounds}
                filters={filters}
                key={`filters-${searchParamsString}`}
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
            key={`mobile-filters-${searchParamsString}`}
            onApply={updateSearchParams}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

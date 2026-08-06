"use client";

import { useLocale, useTranslations } from "next-intl";
import { BoatCard } from "@/components/boats/boat-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useBoats } from "@/hooks/useBoats";
import type { BoatSearchFilters } from "@/queries/fetchBoats";

const PAGE_SIZE = 12;

function buildPageHref(
  filters: BoatSearchFilters,
  page: number,
  currentParams: URLSearchParams,
) {
  const params = new URLSearchParams(currentParams);
  params.set("page", String(page));
  return `?${params.toString()}`;
}

function ResultSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="h-40 bg-neutral-200" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-3/4 rounded bg-neutral-200" />
        <div className="h-3 w-1/2 rounded bg-neutral-200" />
        <div className="h-5 w-1/3 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export function SearchResults({
  filters,
  onSortChange,
  searchParamsString,
}: {
  filters: BoatSearchFilters;
  onSortChange: (sortBy: BoatSearchFilters["sortBy"]) => void;
  searchParamsString: string;
}) {
  const t = useTranslations("Pages.SearchPage");
  const tLanding = useTranslations("Pages.LandingPage");
  const locale = useLocale();

  const { data, isPending, isError } = useBoats({
    ...filters,
    pageSize: PAGE_SIZE,
  });

  const currentParams = new URLSearchParams(searchParamsString);
  const totalCount = data?.totalCount ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      {/* Header: result count + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-700">
          {isPending ? (
            <span className="animate-pulse text-neutral-400">—</span>
          ) : totalCount === 0 ? (
            t("result_count_empty")
          ) : (
            t("result_count", {
              count: totalCount,
              port: filters.port,
              from: filters.from,
              to: filters.to,
            })
          )}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">{t("sort_label")} :</span>
          <select
            className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-[#1a2b48] outline-none focus:ring-2 focus:ring-[#D68A6E]/40"
            onChange={(event) =>
              onSortChange(
                event.target.value as BoatSearchFilters["sortBy"],
              )
            }
            value={filters.sortBy ?? "relevance"}
          >
            <option value="relevance">{t("sort_relevance")}</option>
            <option value="rating">{t("sort_rating")}</option>
            <option value="price_asc">{t("sort_price_asc")}</option>
            <option value="price_desc">{t("sort_price_desc")}</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {isError ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <p className="font-semibold text-[#1a2b48]">{t("empty_title")}</p>
          <p className="text-sm text-neutral-500">{t("empty_text")}</p>
        </div>
      ) : isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ResultSkeleton key={index} />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <p className="font-semibold text-[#1a2b48]">{t("empty_title")}</p>
          <p className="text-sm text-neutral-500">{t("empty_text")}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.boats.map((boat) => {
            const boatHref = filters.from && filters.to
              ? `/boats/${boat.id}?from=${filters.from}&to=${filters.to}`
              : `/boats/${boat.id}`;

            return (
              <BoatCard
                badgeLabel={
                  boat.badge
                    ? tLanding(`featured_badge_${boat.badge}`)
                    : undefined
                }
                boat={{
                  id: boat.id,
                  name: boat.name,
                  type: boat.type,
                  length_m: boat.length_m,
                  price_per_day: boat.price_per_day,
                  rating: boat.rating,
                  badge: boat.badge,
                  port_name: boat.port_name,
                  motorization: boat.motorization,
                  skipper_option: boat.skipper_option,
                }}
                coverImage={boat.coverImage}
                href={boatHref}
                imageAlt={t("boat_image_alt", {
                  name: boat.name,
                  type: tLanding(`search_type_${boat.type.toLowerCase()}`),
                  location: boat.port_name,
                })}
                key={boat.id}
                locale={locale}
                skipperLabel={
                  boat.skipper_option === "INCLUDED"
                    ? tLanding("featured_skipper_included")
                    : boat.skipper_option === "OPTIONAL"
                      ? tLanding("featured_skipper_optional")
                      : undefined
                }
                typeLabel={tLanding(
                  `search_type_${boat.type.toLowerCase()}`,
                )}
                unitLabel={t("price_unit")}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-2">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(filters, currentPage - 1, currentParams)}
                />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isCurrentPage = pageNumber === currentPage;
              const isNearCurrent = Math.abs(pageNumber - currentPage) <= 1;
              const isEdge = pageNumber === 1 || pageNumber === totalPages;

              if (!isNearCurrent && !isEdge) {
                if (pageNumber === 2 || pageNumber === totalPages - 1) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              }

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={buildPageHref(filters, pageNumber, currentParams)}
                    isActive={isCurrentPage}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href={buildPageHref(filters, currentPage + 1, currentParams)}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

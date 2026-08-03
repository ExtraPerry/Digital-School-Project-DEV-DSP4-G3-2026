"use client";

import { useCallback, useState } from "react";
import type { AdminListParams, SortDirection } from "@/types/AdminList";

//? Shared filter-state controller for the admin list screens.
//? Any change other than paging resets to page 1, otherwise narrowing a filter
//? can strand the administrator on a page that no longer exists.
export function useAdminFilters<
  TSortColumn extends string,
  TFilters extends AdminListParams<TSortColumn>,
>(defaultFilters: TFilters) {
  const [filters, setFilters] = useState<TFilters>(defaultFilters);

  const setSearch = useCallback((search: string) => {
    setFilters((current) => ({ ...current, search, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((current) => ({ ...current, page }));
  }, []);

  const setFilterValue = useCallback((key: keyof TFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }, []);

  //? Clicking the active column flips direction; a new column starts descending
  //? for dates and amounts, which is the useful default in a back-office.
  const toggleSort = useCallback((column: TSortColumn) => {
    setFilters((current) => {
      const nextDirection: SortDirection =
        current.sortColumn === column && current.sortDirection === "desc"
          ? "asc"
          : current.sortColumn === column
            ? "desc"
            : "desc";

      return {
        ...current,
        sortColumn: column,
        sortDirection: nextDirection,
        page: 1,
      };
    });
  }, []);

  return { filters, setSearch, setPage, setFilterValue, toggleSort };
}

export const ADMIN_PAGE_SIZE = 10;

export type SortDirection = "asc" | "desc";

//? Shared shape for every admin list screen. Filters are part of the TanStack
//? Query key, so each combination is cached independently.
export type AdminListParams<TSortColumn extends string> = {
  search: string;
  sortColumn: TSortColumn;
  sortDirection: SortDirection;
  page: number; //? 1-based.
};

export type PaginatedAdminList<TRow> = {
  rows: TRow[];
  total: number;
  page: number;
  pageCount: number;
};

//! PostgREST `.range()` is a 0-based inclusive slice, while the UI pages from 1.
export function pageToRange(page: number, pageSize = ADMIN_PAGE_SIZE) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * pageSize;

  return { from, to: from + pageSize - 1 };
}

export function buildPaginatedResult<TRow>(
  rows: TRow[],
  total: number | null,
  page: number,
  pageSize = ADMIN_PAGE_SIZE,
): PaginatedAdminList<TRow> {
  const safeTotal = total ?? 0;

  return {
    rows,
    total: safeTotal,
    page,
    pageCount: Math.max(1, Math.ceil(safeTotal / pageSize)),
  };
}

//! PostgREST `.or()` takes a comma-separated filter list, so a comma or a
//! parenthesis inside the user's search term would corrupt the expression.
//! Strip them rather than escaping, since neither is meaningful in a name,
//! email or boat name lookup.
export function sanitizeSearchTerm(term: string): string {
  return term.trim().replace(/[,()]/g, "");
}

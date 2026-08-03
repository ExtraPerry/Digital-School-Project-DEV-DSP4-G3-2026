import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";
import {
  ADMIN_PAGE_SIZE,
  buildPaginatedResult,
  pageToRange,
  sanitizeSearchTerm,
  type AdminListParams,
  type PaginatedAdminList,
} from "@/types/AdminList";

type ReviewRow = Database["public"]["Tables"]["boat_reviews"]["Row"];
type ModerationStatus = Database["public"]["Enums"]["review_moderation_status"];

export const ADMIN_REVIEWS_SORT_COLUMNS = ["created_at", "rating"] as const;

export type AdminReviewsSortColumn = (typeof ADMIN_REVIEWS_SORT_COLUMNS)[number];

export type AdminReviewsFilters = AdminListParams<AdminReviewsSortColumn> & {
  status: ModerationStatus | "ALL";
};

export const DEFAULT_ADMIN_REVIEWS_FILTERS: AdminReviewsFilters = {
  search: "",
  status: "ALL",
  sortColumn: "created_at",
  sortDirection: "desc",
  page: 1,
};

export type AdminReview = Pick<
  ReviewRow,
  | "id"
  | "rating"
  | "comment"
  | "author_name"
  | "created_at"
  | "moderation_status"
> & {
  boatId: string | null;
  boatName: string | null;
  reviewerName: string | null;
};

export type PaginatedAdminReviews = PaginatedAdminList<AdminReview>;

//! The `users!boat_reviews_reviewer_id_fkey` hint is REQUIRED. Since the
//! moderation migration, boat_reviews has two foreign keys to public.users
//! (reviewer_id and moderated_by), so a bare `users(...)` embed fails with
//! PGRST201 "more than one relationship was found".
export async function fetchAdminReviews(
  filters: AdminReviewsFilters,
): Promise<PaginatedAdminReviews> {
  const supabase = createSupabaseBrowserClient();
  const { from, to } = pageToRange(filters.page);

  let query = supabase
    .from("boat_reviews")
    .select(
      "id, rating, comment, author_name, created_at, moderation_status, boats(id, name), users!boat_reviews_reviewer_id_fkey(first_name, last_name)",
      { count: "exact" },
    );

  const search = sanitizeSearchTerm(filters.search);

  if (search.length > 0) {
    query = query.or(
      `comment.ilike.%${search}%,author_name.ilike.%${search}%`,
    );
  }

  if (filters.status !== "ALL") {
    query = query.eq("moderation_status", filters.status);
  }

  const { data, error, count } = await query
    .order(filters.sortColumn, {
      ascending: filters.sortDirection === "asc",
    })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch admin reviews: ${error.message}`);
  }

  const rows: AdminReview[] = (data ?? []).map((review) => {
    const reviewer = review.users;
    const reviewerName = reviewer
      ? [reviewer.first_name, reviewer.last_name].filter(Boolean).join(" ").trim()
      : "";

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      author_name: review.author_name,
      created_at: review.created_at,
      moderation_status: review.moderation_status,
      boatId: review.boats?.id ?? null,
      boatName: review.boats?.name ?? null,
      reviewerName: reviewerName.length > 0 ? reviewerName : null,
    };
  });

  return buildPaginatedResult(rows, count, filters.page, ADMIN_PAGE_SIZE);
}

//? Drives the sidebar badge drawn in the approved maquette. Uses a HEAD
//? request so only the count crosses the wire, never the rows.
export async function fetchAdminFlaggedReviewCount(): Promise<number> {
  const supabase = createSupabaseBrowserClient();

  const { count, error } = await supabase
    .from("boat_reviews")
    .select("id", { count: "exact", head: true })
    .eq("moderation_status", "FLAGGED");

  if (error) {
    throw new Error(`Failed to count flagged reviews: ${error.message}`);
  }

  return count ?? 0;
}

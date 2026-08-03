"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminReviews,
  type AdminReviewsFilters,
  type PaginatedAdminReviews,
} from "@/queries/fetchAdminReviews";

export const ADMIN_REVIEWS_QUERY_KEY_PREFIX = "admin-reviews" as const;

export function buildAdminReviewsQueryKey(filters: AdminReviewsFilters) {
  return [ADMIN_REVIEWS_QUERY_KEY_PREFIX, "list", filters] as const;
}

export function useAdminReviews(filters: AdminReviewsFilters) {
  return useSupabaseRealtime<PaginatedAdminReviews>({
    queryKey: buildAdminReviewsQueryKey(filters),
    queryFn: () => fetchAdminReviews(filters),
    realtimeSubscriptions: [
      { table: "boat_reviews", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

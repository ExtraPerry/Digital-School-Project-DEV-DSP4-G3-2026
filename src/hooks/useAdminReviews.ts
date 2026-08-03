"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminReviews,
  type AdminReview,
} from "@/queries/fetchAdminReviews";

export const ADMIN_REVIEWS_QUERY_KEY_PREFIX = "admin-reviews" as const;

export const ADMIN_REVIEWS_QUERY_KEY = [
  ADMIN_REVIEWS_QUERY_KEY_PREFIX,
] as const;

export function useAdminReviews() {
  return useSupabaseRealtime<AdminReview[]>({
    queryKey: ADMIN_REVIEWS_QUERY_KEY,
    queryFn: fetchAdminReviews,
    realtimeSubscriptions: [
      { table: "boat_reviews", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

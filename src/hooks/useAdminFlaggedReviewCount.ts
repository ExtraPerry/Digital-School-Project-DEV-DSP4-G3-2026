"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { fetchAdminFlaggedReviewCount } from "@/queries/fetchAdminReviews";

export const ADMIN_FLAGGED_REVIEWS_QUERY_KEY_PREFIX =
  "admin-flagged-reviews" as const;

export const ADMIN_FLAGGED_REVIEWS_QUERY_KEY = [
  ADMIN_FLAGGED_REVIEWS_QUERY_KEY_PREFIX,
] as const;

//? Drives the moderation badge on the admin sidebar (drawn in the maquette).
export function useAdminFlaggedReviewCount() {
  return useSupabaseRealtime<number>({
    queryKey: ADMIN_FLAGGED_REVIEWS_QUERY_KEY,
    queryFn: fetchAdminFlaggedReviewCount,
    realtimeSubscriptions: [
      { table: "boat_reviews", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

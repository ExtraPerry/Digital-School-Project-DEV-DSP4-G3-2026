"use client";

import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fetchMyReviews, type MyBoatReview } from "@/queries/fetchMyReviews";

export const MY_REVIEWS_QUERY_KEY = ["reviews", "mine"] as const;

export function useMyReviews() {
  const { data: currentUser } = useCurrentUser();

  return useSupabaseRealtime<MyBoatReview[]>({
    queryKey: MY_REVIEWS_QUERY_KEY,
    queryFn: fetchMyReviews,
    enabled: Boolean(currentUser?.id),
    realtimeSubscriptions: currentUser?.id
      ? [
          {
            table: "boat_reviews",
            filter: `reviewer_id=eq.${currentUser.id}`,
          },
        ]
      : [],
  });
}

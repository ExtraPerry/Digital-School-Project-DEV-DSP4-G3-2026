"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { MY_RESERVATIONS_QUERY_KEY } from "@/hooks/useBoatReservations";

type CreateBoatReviewInput = {
  boatId: string;
  reservationId: string;
  rating: number;
  comment: string;
  authorName: string;
  reviewerId: string;
};

export function useCreateBoatReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boatId,
      reservationId,
      rating,
      comment,
      authorName,
      reviewerId,
    }: CreateBoatReviewInput) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("boat_reviews")
        .insert({
          boat_id: boatId,
          reservation_id: reservationId,
          reviewer_id: reviewerId,
          author_name: authorName,
          rating,
          comment,
        })
        .select("id")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to create review");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: MY_RESERVATIONS_QUERY_KEY,
      });
      await queryClient.invalidateQueries({ queryKey: ["boats"] });
    },
  });
}

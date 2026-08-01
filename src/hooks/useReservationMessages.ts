"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import {
  fetchReservationMessages,
  type ReservationMessage,
} from "@/queries/fetchReservationMessages";

export function buildReservationMessagesQueryKey(reservationId: string) {
  return ["reservation-messages", reservationId] as const;
}

export function useReservationMessages(reservationId: string | null) {
  return useSupabaseRealtime<ReservationMessage[]>({
    queryKey: reservationId
      ? buildReservationMessagesQueryKey(reservationId)
      : (["reservation-messages", "none"] as const),
    queryFn: () => {
      if (!reservationId) {
        return Promise.resolve([]);
      }

      return fetchReservationMessages(reservationId);
    },
    enabled: Boolean(reservationId),
    realtimeSubscriptions: reservationId
      ? [
          {
            table: "reservation_messages",
            filter: `reservation_id=eq.${reservationId}`,
          },
        ]
      : [],
  });
}

type SendReservationMessageInput = {
  reservationId: string;
  senderId: string;
  content: string;
};

export function useSendReservationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      senderId,
      content,
    }: SendReservationMessageInput) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("reservation_messages")
        .insert({
          reservation_id: reservationId,
          sender_id: senderId,
          content,
        })
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to send message");
      }

      return data;
    },
    onSuccess: async (message) => {
      await queryClient.invalidateQueries({
        queryKey: buildReservationMessagesQueryKey(message.reservation_id),
      });
    },
  });
}

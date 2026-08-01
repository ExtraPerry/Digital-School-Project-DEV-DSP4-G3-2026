"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { MY_RESERVATIONS_QUERY_KEY } from "@/hooks/useBoatReservations";

type CreateBookingCheckoutInput = {
  boatId: string;
  startDate: Date;
  endDate: Date;
  locale: string;
};

type CreateBookingCheckoutResponse = {
  checkout_url?: string;
  reservation_id?: string;
  error?: string;
};

export function useCreateBookingCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boatId,
      startDate,
      endDate,
      locale,
    }: CreateBookingCheckoutInput) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.functions.invoke<
        CreateBookingCheckoutResponse
      >("create-booking-checkout", {
        body: {
          boat_id: boatId,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          locale,
        },
      });

      if (error) {
        const responseError =
          typeof data?.error === "string" ? data.error : null;
        throw new Error(responseError ?? error.message);
      }

      if (!data?.checkout_url) {
        throw new Error(data?.error ?? "Checkout URL missing");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: MY_RESERVATIONS_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["boats"],
      });
    },
  });
}

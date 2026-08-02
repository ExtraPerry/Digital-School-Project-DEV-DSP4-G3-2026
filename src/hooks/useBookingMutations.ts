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

async function readFunctionsErrorMessage(
  error: unknown,
  data: CreateBookingCheckoutResponse | null,
): Promise<string> {
  if (typeof data?.error === "string" && data.error.length > 0) {
    return data.error;
  }

  const context = (error as { context?: Response } | null)?.context;
  if (context && typeof context.json === "function") {
    try {
      const body = (await context.json()) as { error?: string; message?: string };
      if (typeof body.error === "string" && body.error.length > 0) {
        return body.error;
      }
      if (typeof body.message === "string" && body.message.length > 0) {
        return body.message;
      }
    } catch {
      // ignore JSON parse failures
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to start checkout";
}

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
        throw new Error(await readFunctionsErrorMessage(error, data));
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

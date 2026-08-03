"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminReservations,
  type AdminReservation,
} from "@/queries/fetchAdminReservations";

export const ADMIN_RESERVATIONS_QUERY_KEY_PREFIX = "admin-reservations" as const;

export const ADMIN_RESERVATIONS_QUERY_KEY = [
  ADMIN_RESERVATIONS_QUERY_KEY_PREFIX,
] as const;

//! KNOWN LIMITATION — public.boat_reservations is deliberately NOT a member of
//! the supabase_realtime publication: its only SELECT policy is
//! `to anon, authenticated using (true)`, so publishing it would broadcast
//! every booking to every connected client (see agent.md).
//! We therefore subscribe to payment_transactions instead, which IS published
//! and is written by the Stripe webhook in the same flow that flips a
//! reservation PENDING -> CONFIRMED. The pg_cron CONFIRMED -> COMPLETED
//! transition emits no event and is picked up on the next load or when the
//! 15 min staleTime expires.
export function useAdminReservations() {
  return useSupabaseRealtime<AdminReservation[]>({
    queryKey: ADMIN_RESERVATIONS_QUERY_KEY,
    queryFn: fetchAdminReservations,
    realtimeSubscriptions: [
      { table: "payment_transactions", filter: `id=neq.${NIL_UUID}` },
      { table: "boats", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

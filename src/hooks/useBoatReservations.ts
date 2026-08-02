"use client";

import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchBoatActiveReservations,
  fetchMyReservations,
  type BoatReservation,
  type BoatReservationWithDetails,
} from "@/queries/fetchBoatReservations";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const MY_RESERVATIONS_QUERY_KEY = ["bookings", "mine"] as const;

export function buildBoatReservationsQueryKey(boatId: string) {
  return ["bookings", "boat", boatId] as const;
}

export function useBoatActiveReservations(boatId: string | null) {
  return useSupabaseRealtime<BoatReservation[]>({
    queryKey: boatId
      ? buildBoatReservationsQueryKey(boatId)
      : (["bookings", "boat", "none"] as const),
    queryFn: () => {
      if (!boatId) {
        return Promise.resolve([]);
      }

      return fetchBoatActiveReservations(boatId);
    },
    enabled: Boolean(boatId),
    realtimeSubscriptions: boatId
      ? [
          {
            table: "boat_reservations",
            filter: `boat_id=eq.${boatId}`,
          },
        ]
      : [],
  });
}

export function useMyReservations() {
  const { data: currentUser } = useCurrentUser();

  return useSupabaseRealtime<BoatReservationWithDetails[]>({
    queryKey: MY_RESERVATIONS_QUERY_KEY,
    queryFn: fetchMyReservations,
    enabled: Boolean(currentUser?.id),
    realtimeSubscriptions: currentUser?.id
      ? [
          {
            table: "boat_reservations",
            filter: `renter_id=eq.${currentUser.id}`,
          },
        ]
      : [],
  });
}

"use client";

import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchBoatAvailabilitySlots,
  fetchOwnerAvailabilitySlots,
  type BoatAvailabilitySlot,
} from "@/queries/fetchBoatAvailabilitySlots";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const OWNER_AVAILABILITY_QUERY_KEY = ["owner-availability"] as const;

export function buildBoatAvailabilityQueryKey(boatId: string) {
  return ["boat-availability", boatId] as const;
}

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export function useOwnerAvailabilitySlots() {
  const { data: currentUser } = useCurrentUser();

  return useSupabaseRealtime<BoatAvailabilitySlot[]>({
    queryKey: OWNER_AVAILABILITY_QUERY_KEY,
    queryFn: fetchOwnerAvailabilitySlots,
    enabled: Boolean(currentUser?.id),
    realtimeSubscriptions: [
      {
        table: "boat_availability_time_slots",
        filter: `boat_id=neq.${NIL_UUID}`,
      },
    ],
  });
}

export function useBoatAvailabilitySlots(boatId: string | null) {
  return useSupabaseRealtime<BoatAvailabilitySlot[]>({
    queryKey: boatId
      ? buildBoatAvailabilityQueryKey(boatId)
      : (["boat-availability", "none"] as const),
    queryFn: () => {
      if (!boatId) {
        return Promise.resolve([]);
      }

      return fetchBoatAvailabilitySlots(boatId);
    },
    enabled: Boolean(boatId),
    realtimeSubscriptions: boatId
      ? [
          {
            table: "boat_availability_time_slots",
            filter: `boat_id=eq.${boatId}`,
          },
        ]
      : [],
  });
}

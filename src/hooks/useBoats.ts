"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  BoatSearchFilters,
  PaginatedBoats,
  fetchBoats,
} from "@/queries/fetchBoats";

export const BOATS_LIST_QUERY_KEY_PREFIX = "boats" as const;

export function buildBoatsQueryKey(filters: BoatSearchFilters) {
  return [BOATS_LIST_QUERY_KEY_PREFIX, "list", filters] as const;
}

export function useBoats(filters: BoatSearchFilters) {
  return useSupabaseRealtime<PaginatedBoats>({
    queryKey: buildBoatsQueryKey(filters),
    queryFn: () => fetchBoats(filters),
    realtimeSubscriptions: [
      { table: "boats", filter: `id=neq.${NIL_UUID}` },
      {
        table: "boat_availability_time_slots",
        filter: `boat_id=neq.${NIL_UUID}`,
      },
      { table: "boat_reservations", filter: `boat_id=neq.${NIL_UUID}` },
      // The RPC carries each result's cover image, so replacing a listing photo
      // has to invalidate the grid the same way a price change does.
      { table: "boat_media", filter: `boat_id=neq.${NIL_UUID}` },
    ],
  });
}

"use client";

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

// Nil UUID — no real row will ever have this ID, so these subscriptions
// effectively fire on any insert/update/delete in each table.
const NIL_UUID = "00000000-0000-0000-0000-000000000000";

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
    ],
  });
}

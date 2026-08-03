"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminBoats,
  type AdminBoatsFilters,
  type PaginatedAdminBoats,
} from "@/queries/fetchAdminBoats";

export const ADMIN_BOATS_QUERY_KEY_PREFIX = "admin-boats" as const;

export function buildAdminBoatsQueryKey(filters: AdminBoatsFilters) {
  return [ADMIN_BOATS_QUERY_KEY_PREFIX, "list", filters] as const;
}

export function useAdminBoats(filters: AdminBoatsFilters) {
  return useSupabaseRealtime<PaginatedAdminBoats>({
    queryKey: buildAdminBoatsQueryKey(filters),
    queryFn: () => fetchAdminBoats(filters),
    realtimeSubscriptions: [
      { table: "boats", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

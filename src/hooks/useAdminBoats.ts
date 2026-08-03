"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { fetchAdminBoats, type AdminBoat } from "@/queries/fetchAdminBoats";

export const ADMIN_BOATS_QUERY_KEY_PREFIX = "admin-boats" as const;

export const ADMIN_BOATS_QUERY_KEY = [
  ADMIN_BOATS_QUERY_KEY_PREFIX,
] as const;

export function useAdminBoats() {
  return useSupabaseRealtime<AdminBoat[]>({
    queryKey: ADMIN_BOATS_QUERY_KEY,
    queryFn: fetchAdminBoats,
    realtimeSubscriptions: [
      { table: "boats", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminPlatformStats,
  type AdminPlatformStats,
} from "@/queries/fetchAdminPlatformStats";

export const ADMIN_STATS_QUERY_KEY_PREFIX = "admin-stats" as const;

export const ADMIN_STATS_QUERY_KEY = [
  ADMIN_STATS_QUERY_KEY_PREFIX,
] as const;

export function useAdminPlatformStats() {
  return useSupabaseRealtime<AdminPlatformStats>({
    queryKey: ADMIN_STATS_QUERY_KEY,
    queryFn: fetchAdminPlatformStats,
    realtimeSubscriptions: [
      { table: "users", filter: `id=neq.${NIL_UUID}` },
      { table: "boats", filter: `id=neq.${NIL_UUID}` },
      { table: "payment_transactions", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { fetchAdminUsers, type AdminUser } from "@/queries/fetchAdminUsers";

export const ADMIN_USERS_QUERY_KEY_PREFIX = "admin-users" as const;

export const ADMIN_USERS_QUERY_KEY = [
  ADMIN_USERS_QUERY_KEY_PREFIX,
] as const;

export function useAdminUsers() {
  return useSupabaseRealtime<AdminUser[]>({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: fetchAdminUsers,
    realtimeSubscriptions: [
      { table: "users", filter: `id=neq.${NIL_UUID}` },
      { table: "user_roles", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

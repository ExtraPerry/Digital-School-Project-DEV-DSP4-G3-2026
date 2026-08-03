"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminUsers,
  type AdminUsersFilters,
  type PaginatedAdminUsers,
} from "@/queries/fetchAdminUsers";

export const ADMIN_USERS_QUERY_KEY_PREFIX = "admin-users" as const;

export function buildAdminUsersQueryKey(filters: AdminUsersFilters) {
  return [ADMIN_USERS_QUERY_KEY_PREFIX, "list", filters] as const;
}

export function useAdminUsers(filters: AdminUsersFilters) {
  return useSupabaseRealtime<PaginatedAdminUsers>({
    queryKey: buildAdminUsersQueryKey(filters),
    queryFn: () => fetchAdminUsers(filters),
    realtimeSubscriptions: [
      { table: "users", filter: `id=neq.${NIL_UUID}` },
      { table: "user_roles", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

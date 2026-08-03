"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminGlobalSearch,
  type AdminGlobalSearchHit,
} from "@/queries/fetchAdminGlobalSearch";

export const ADMIN_GLOBAL_SEARCH_QUERY_KEY_PREFIX =
  "admin-global-search" as const;

export function buildAdminGlobalSearchQueryKey(query: string) {
  return [ADMIN_GLOBAL_SEARCH_QUERY_KEY_PREFIX, query] as const;
}

//? `enabled` keeps the RPC from firing on every keystroke before the caller's
//? debounce settles, and on an empty field.
export function useAdminGlobalSearch(query: string) {
  const trimmed = query.trim();

  return useSupabaseRealtime<AdminGlobalSearchHit[]>({
    queryKey: buildAdminGlobalSearchQueryKey(trimmed),
    queryFn: () => fetchAdminGlobalSearch(trimmed),
    enabled: trimmed.length >= 2,
    realtimeSubscriptions: [
      { table: "users", filter: `id=neq.${NIL_UUID}` },
      { table: "boats", filter: `id=neq.${NIL_UUID}` },
      { table: "boat_reviews", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

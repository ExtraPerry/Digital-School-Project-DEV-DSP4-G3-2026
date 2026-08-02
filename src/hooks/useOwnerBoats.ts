"use client";

import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { fetchOwnerBoats, type OwnerBoat } from "@/queries/fetchOwnerBoats";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const OWNER_BOATS_QUERY_KEY = ["owner-boats"] as const;

export function useOwnerBoats() {
  const { data: currentUser } = useCurrentUser();
  const ownerId = currentUser?.id;

  return useSupabaseRealtime<OwnerBoat[]>({
    queryKey: OWNER_BOATS_QUERY_KEY,
    queryFn: fetchOwnerBoats,
    enabled: Boolean(ownerId),
    realtimeSubscriptions: ownerId
      ? [{ table: "boats", filter: `owner_id=eq.${ownerId}` }]
      : [],
  });
}

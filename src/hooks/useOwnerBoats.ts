"use client";

import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchOwnerBoatById,
  fetchOwnerBoats,
  type OwnerBoat,
} from "@/queries/fetchOwnerBoats";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const OWNER_BOATS_QUERY_KEY = ["owner-boats"] as const;
export const OWNER_BOAT_QUERY_KEY_PREFIX = "owner-boat" as const;

export function buildOwnerBoatQueryKey(boatId: string) {
  return [OWNER_BOAT_QUERY_KEY_PREFIX, boatId] as const;
}

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

/**
 * One listing, for the edit screen.
 *
 * The page used to call `useQuery` directly with an inline key, which left it
 * outside the Realtime invalidation every other Supabase read goes through —
 * publishing from a second tab, or an administrator taking the listing down,
 * left this form showing a status that was no longer true.
 */
export function useOwnerBoat(boatId: string) {
  return useSupabaseRealtime<OwnerBoat | null>({
    queryKey: buildOwnerBoatQueryKey(boatId),
    queryFn: () => fetchOwnerBoatById(boatId),
    enabled: Boolean(boatId),
    realtimeSubscriptions: boatId
      ? [{ table: "boats", filter: `id=eq.${boatId}` }]
      : [],
  });
}

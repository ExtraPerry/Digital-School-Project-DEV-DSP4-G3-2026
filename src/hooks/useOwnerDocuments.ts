"use client";

import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchOwnerDocuments,
  type OwnerDocument,
} from "@/queries/fetchOwnerDocuments";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const OWNER_DOCUMENTS_QUERY_KEY = ["owner-documents"] as const;

export function useOwnerDocuments() {
  const { data: currentUser } = useCurrentUser();
  const ownerId = currentUser?.id;

  return useSupabaseRealtime<OwnerDocument[]>({
    queryKey: OWNER_DOCUMENTS_QUERY_KEY,
    queryFn: fetchOwnerDocuments,
    enabled: Boolean(ownerId),
    realtimeSubscriptions: ownerId
      ? [{ table: "boat_documents", filter: `owner_id=eq.${ownerId}` }]
      : [],
  });
}

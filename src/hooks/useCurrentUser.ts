"use client"

import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { fetchCurrentUser } from "@/queries/fetchCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const CURRENT_USER_QUERY_KEY = ["current-user"] as const;

export function useCurrentUser() {
  const queryClient = useQueryClient();
  
  const cachedCurrentUser = queryClient.getQueryData<{ auth_id: string } | null>(
    CURRENT_USER_QUERY_KEY
  );
  const authId = cachedCurrentUser?.auth_id ?? null;

  const query = useSupabaseRealtime({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    realtimeSubscriptions: authId
      ? [{ table: "users", filter: `auth_id=eq.${authId}`}]
      : [],
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
          return;
        }

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
          return;
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    }
  }, [queryClient]);

  return query;
}

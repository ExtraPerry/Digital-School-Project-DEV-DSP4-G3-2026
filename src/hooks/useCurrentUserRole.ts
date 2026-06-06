"use client"

import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { fetchCurrentUserRole } from "@/queries/fetchCurrentUserRole";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const CURRENT_USER_ROLE_QUERY_KEY = ["current-user-role"] as const;

export function useCurrentUserRole() {
  const queryClient = useQueryClient();

  const cachedCurrentUserRole = queryClient.getQueryData<{ auth_id: string } | null>(
    CURRENT_USER_ROLE_QUERY_KEY
  );
  const authId = cachedCurrentUserRole?.auth_id ?? null;

  const query = useSupabaseRealtime({
    queryKey: CURRENT_USER_ROLE_QUERY_KEY,
    queryFn: fetchCurrentUserRole,
    realtimeSubscriptions: authId
      ? [{ table: "user_roles", filter: `auth_id=eq.${authId}` }]
      : [],
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          queryClient.setQueryData(CURRENT_USER_ROLE_QUERY_KEY, null);
          return;
        }

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          queryClient.invalidateQueries({ queryKey: CURRENT_USER_ROLE_QUERY_KEY });
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

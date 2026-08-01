"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { CURRENT_USER_QUERY_KEY } from "@/hooks/useCurrentUser";

type UpdateCurrentUserInput = {
  firstName: string;
  lastName: string;
  phone: string | null;
};

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ firstName, lastName, phone }: UpdateCurrentUserInput) => {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(authError?.message ?? "Not authenticated");
      }

      const { data, error } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone && phone.length > 0 ? phone : null,
        })
        .eq("auth_id", user.id)
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to update profile");
      }

      return data;
    },
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updatedUser);
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

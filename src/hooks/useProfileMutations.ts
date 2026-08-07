"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { CURRENT_USER_QUERY_KEY } from "@/hooks/useCurrentUser";

/**
 * Raised when the current password does not check out, so the UI can point the
 * error at that field instead of showing a generic failure.
 */
export const WRONG_CURRENT_PASSWORD = "WRONG_CURRENT_PASSWORD";

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

type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

/**
 * Changes the signed-in user's password.
 *
 * `auth.updateUser` alone would accept a new password on the strength of the
 * session cookie, so anyone reaching an unlocked browser could take the account
 * over. The current password is therefore re-checked first — `signInWithPassword`
 * against the same account is the reauthentication step, and it refreshes the
 * very session it verified, so nothing is invalidated by running it.
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: UpdatePasswordInput) => {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user?.email) {
        throw new Error(authError?.message ?? "Not authenticated");
      }

      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reauthError) {
        throw new Error(WRONG_CURRENT_PASSWORD);
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
  });
}

"use client"

import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];

export async function fetchCurrentUserRole(): Promise<UserRoleRow> {
  const supabase = createSupabaseBrowserClient();

  const { data: { user: authenticatedUserData }, error: authenticatedUserError } = await supabase.auth.getUser();

  if (authenticatedUserError || !authenticatedUserData) {
    throw new Error(`Failed to fetch authenticated user role data, reason : ${authenticatedUserError?.message}`);
  }

  const { data: userRoleData, error: userRoleError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("auth_id", authenticatedUserData.id)
    .single();

  if (userRoleError || !userRoleData) {
    throw new Error(`Failed to fetch authenticated user role data, reason : ${userRoleError?.message}`);
  }

  return userRoleData;
}

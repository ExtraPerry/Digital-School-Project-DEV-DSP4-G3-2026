"use client"

import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export async function fetchCurrentUser(): Promise<UserRow> {
  const supabase = createSupabaseBrowserClient();

  const { data: { user: authenticatedUserData }, error: authenticatedUserError } = await supabase.auth.getUser();
  
  if (authenticatedUserError || !authenticatedUserData) {
    throw new Error(`Failed to fetch authenticated user data, reason : ${authenticatedUserError?.message}`);
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authenticatedUserData.id)
    .single();

  if (userError || !userData) {
    throw new Error(`Failed to fetch authenticated user data, reason : ${userError?.message}`);
  }

  return userData;
}
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

export type OwnerBoat = Database["public"]["Tables"]["boats"]["Row"] & {
  ports: Pick<Database["public"]["Tables"]["ports"]["Row"], "id" | "name" | "slug"> | null;
};

export async function fetchOwnerBoats(): Promise<OwnerBoat[]> {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      `Failed to fetch owner boats: ${authError?.message ?? "not authenticated"}`,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(
      `Failed to fetch owner profile: ${profileError?.message ?? "missing profile"}`,
    );
  }

  const { data, error } = await supabase
    .from("boats")
    .select("*, ports(id, name, slug)")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch owner boats: ${error.message}`);
  }

  return (data ?? []) as OwnerBoat[];
}

export async function fetchOwnerBoatById(boatId: string): Promise<OwnerBoat> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("boats")
    .select("*, ports(id, name, slug)")
    .eq("id", boatId)
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to fetch boat ${boatId}: ${error?.message ?? "not found"}`,
    );
  }

  return data as OwnerBoat;
}

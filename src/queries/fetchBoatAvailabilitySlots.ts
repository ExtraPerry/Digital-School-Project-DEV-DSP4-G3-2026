import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

export type BoatAvailabilitySlot =
  Database["public"]["Tables"]["boat_availability_time_slots"]["Row"];

export async function fetchBoatAvailabilitySlots(
  boatId: string,
): Promise<BoatAvailabilitySlot[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("boat_availability_time_slots")
    .select("*")
    .eq("boat_id", boatId)
    .order("start_date", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch availability slots for boat ${boatId}: ${error.message}`,
    );
  }

  return data ?? [];
}

export async function fetchOwnerAvailabilitySlots(): Promise<
  BoatAvailabilitySlot[]
> {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      `Failed to fetch availability slots: ${authError?.message ?? "not authenticated"}`,
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

  const { data: boats, error: boatsError } = await supabase
    .from("boats")
    .select("id")
    .eq("owner_id", profile.id);

  if (boatsError) {
    throw new Error(`Failed to fetch owner boats: ${boatsError.message}`);
  }

  const boatIds = (boats ?? []).map((boat) => boat.id);

  if (boatIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("boat_availability_time_slots")
    .select("*")
    .in("boat_id", boatIds)
    .order("start_date", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch owner availability slots: ${error.message}`,
    );
  }

  return data ?? [];
}

import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

export type BoatReservation =
  Database["public"]["Tables"]["boat_reservations"]["Row"];

export type BoatReservationWithDetails = BoatReservation & {
  boats: {
    id: string;
    name: string;
    type: Database["public"]["Enums"]["boat_type"];
    price_per_day: number;
    ports: { name: string } | null;
  } | null;
  payment_transactions: {
    id: string;
    amount: number;
    commission_amount: number | null;
    owner_amount: number | null;
    status: string;
  } | null;
  // Unique reservation_id → PostgREST may return object or array depending on embed detection.
  boat_reviews: { id: string } | { id: string }[] | null;
};

export function reservationHasReview(
  reviews: BoatReservationWithDetails["boat_reviews"],
): boolean {
  if (!reviews) {
    return false;
  }

  if (Array.isArray(reviews)) {
    return reviews.length > 0;
  }

  return Boolean(reviews.id);
}

export async function fetchBoatActiveReservations(
  boatId: string,
): Promise<BoatReservation[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("boat_reservations")
    .select("*")
    .eq("boat_id", boatId)
    .in("status", ["PENDING", "CONFIRMED"])
    .order("start_date", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch active reservations for boat ${boatId}: ${error.message}`,
    );
  }

  return data ?? [];
}

export async function fetchMyReservations(): Promise<
  BoatReservationWithDetails[]
> {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      `Failed to fetch reservations: ${authError?.message ?? "not authenticated"}`,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(
      `Failed to fetch renter profile: ${profileError?.message ?? "missing profile"}`,
    );
  }

  const { data, error } = await supabase
    .from("boat_reservations")
    .select(
      `
      *,
      boats (
        id,
        name,
        type,
        price_per_day,
        ports ( name )
      ),
      payment_transactions (
        id,
        amount,
        commission_amount,
        owner_amount,
        status
      ),
      boat_reviews ( id )
    `,
    )
    .eq("renter_id", profile.id)
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch my reservations: ${error.message}`);
  }

  return (data ?? []) as BoatReservationWithDetails[];
}

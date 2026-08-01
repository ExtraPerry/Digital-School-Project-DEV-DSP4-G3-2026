import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

export type ReservationMessage =
  Database["public"]["Tables"]["reservation_messages"]["Row"];

export async function fetchReservationMessages(
  reservationId: string,
): Promise<ReservationMessage[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("reservation_messages")
    .select("*")
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch messages for reservation ${reservationId}: ${error.message}`,
    );
  }

  return data ?? [];
}

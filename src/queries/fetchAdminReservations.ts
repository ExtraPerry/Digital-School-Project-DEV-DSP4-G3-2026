import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

type ReservationRow = Database["public"]["Tables"]["boat_reservations"]["Row"];

export type AdminReservation = Pick<
  ReservationRow,
  | "id"
  | "start_date"
  | "end_date"
  | "status"
  | "total_amount"
  | "currency"
  | "created_at"
> & {
  boatName: string | null;
  renterName: string | null;
  renterEmail: string | null;
  paymentStatus: string | null;
};

export async function fetchAdminReservations(): Promise<AdminReservation[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("boat_reservations")
    .select(
      "id, start_date, end_date, status, total_amount, currency, created_at, boats(name), users(first_name, last_name, email), payment_transactions(status)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch admin reservations: ${error.message}`);
  }

  return (data ?? []).map((reservation) => {
    const renter = reservation.users;
    const renterName = renter
      ? [renter.first_name, renter.last_name].filter(Boolean).join(" ").trim()
      : "";
    //? payment_transactions.reservation_id is UNIQUE, so at most one row.
    const payment = Array.isArray(reservation.payment_transactions)
      ? reservation.payment_transactions[0]
      : reservation.payment_transactions;

    return {
      id: reservation.id,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      status: reservation.status,
      total_amount: reservation.total_amount,
      currency: reservation.currency,
      created_at: reservation.created_at,
      boatName: reservation.boats?.name ?? null,
      renterName: renterName.length > 0 ? renterName : null,
      renterEmail: renter?.email ?? null,
      paymentStatus: payment?.status ?? null,
    };
  });
}

import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";
import {
  ADMIN_PAGE_SIZE,
  buildPaginatedResult,
  pageToRange,
  sanitizeSearchTerm,
  type AdminListParams,
  type PaginatedAdminList,
} from "@/types/AdminList";

type ReservationRow = Database["public"]["Tables"]["boat_reservations"]["Row"];
type ReservationStatus = Database["public"]["Enums"]["reservation_status"];

export const ADMIN_RESERVATIONS_SORT_COLUMNS = [
  "created_at",
  "start_date",
  "end_date",
  "total_amount",
  "status",
] as const;

export type AdminReservationsSortColumn =
  (typeof ADMIN_RESERVATIONS_SORT_COLUMNS)[number];

export type AdminReservationsFilters =
  AdminListParams<AdminReservationsSortColumn> & {
    status: ReservationStatus | "ALL";
  };

export const DEFAULT_ADMIN_RESERVATIONS_FILTERS: AdminReservationsFilters = {
  search: "",
  status: "ALL",
  sortColumn: "created_at",
  sortDirection: "desc",
  page: 1,
};

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

export type PaginatedAdminReservations = PaginatedAdminList<AdminReservation>;

export async function fetchAdminReservations(
  filters: AdminReservationsFilters,
): Promise<PaginatedAdminReservations> {
  const supabase = createSupabaseBrowserClient();
  const { from, to } = pageToRange(filters.page);
  const search = sanitizeSearchTerm(filters.search);

  //? Searching by renter email means filtering on the embedded users row, which
  //? requires `!inner` so non-matching parents are excluded rather than
  //? returned with a null embed.
  const renterEmbed =
    search.length > 0
      ? "users!inner(first_name, last_name, email)"
      : "users(first_name, last_name, email)";

  let query = supabase
    .from("boat_reservations")
    .select(
      `id, start_date, end_date, status, total_amount, currency, created_at, boats(name), ${renterEmbed}, payment_transactions(status)`,
      { count: "exact" },
    );

  if (search.length > 0) {
    query = query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
      { referencedTable: "users" },
    );
  }

  if (filters.status !== "ALL") {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query
    .order(filters.sortColumn, {
      ascending: filters.sortDirection === "asc",
    })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch admin reservations: ${error.message}`);
  }

  const rows: AdminReservation[] = (data ?? []).map((reservation) => {
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

  return buildPaginatedResult(rows, count, filters.page, ADMIN_PAGE_SIZE);
}

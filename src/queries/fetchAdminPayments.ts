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

type PaymentRow = Database["public"]["Tables"]["payment_transactions"]["Row"];

export const ADMIN_PAYMENTS_SORT_COLUMNS = [
  "created_at",
  "amount",
  "commission_amount",
  "status",
] as const;

export type AdminPaymentsSortColumn =
  (typeof ADMIN_PAYMENTS_SORT_COLUMNS)[number];

export type AdminPaymentsFilters = AdminListParams<AdminPaymentsSortColumn> & {
  status: "ALL" | "PENDING" | "PAID" | "EXPIRED";
};

export const DEFAULT_ADMIN_PAYMENTS_FILTERS: AdminPaymentsFilters = {
  search: "",
  status: "ALL",
  sortColumn: "created_at",
  sortDirection: "desc",
  page: 1,
};

export type AdminPayment = Pick<
  PaymentRow,
  | "id"
  | "amount"
  | "commission_amount"
  | "owner_amount"
  | "status"
  | "provider"
  | "created_at"
> & {
  reservationId: string | null;
  boatName: string | null;
};

export type AdminPaymentTotals = {
  //? Gross merchandise value — everything charged to renters.
  grossVolume: number;
  //? Platform revenue: commission on settled (PAID) transactions only.
  platformCommission: number;
  //? Recorded as owed to owners. Stripe Connect is not implemented, so this
  //? is a bookkeeping figure — no payout is actually transferred.
  ownerPayable: number;
  paidCount: number;
};

export type PaginatedAdminPayments = PaginatedAdminList<AdminPayment>;

export async function fetchAdminPayments(
  filters: AdminPaymentsFilters,
): Promise<PaginatedAdminPayments> {
  const supabase = createSupabaseBrowserClient();
  const { from, to } = pageToRange(filters.page);
  const search = sanitizeSearchTerm(filters.search);

  //? Boat name lives two levels down, so searching it needs both embeds inner.
  const reservationEmbed =
    search.length > 0
      ? "boat_reservations!inner(id, boats!inner(name))"
      : "boat_reservations(id, boats(name))";

  let query = supabase
    .from("payment_transactions")
    .select(
      `id, amount, commission_amount, owner_amount, status, provider, created_at, ${reservationEmbed}`,
      { count: "exact" },
    );

  if (search.length > 0) {
    query = query.ilike("boat_reservations.boats.name", `%${search}%`);
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
    throw new Error(`Failed to fetch admin payments: ${error.message}`);
  }

  const rows: AdminPayment[] = (data ?? []).map((payment) => ({
    id: payment.id,
    amount: payment.amount,
    commission_amount: payment.commission_amount,
    owner_amount: payment.owner_amount,
    status: payment.status,
    provider: payment.provider,
    created_at: payment.created_at,
    reservationId: payment.boat_reservations?.id ?? null,
    boatName: payment.boat_reservations?.boats?.name ?? null,
  }));

  return buildPaginatedResult(rows, count, filters.page, ADMIN_PAGE_SIZE);
}

//! Totals are deliberately computed over EVERY payment row, not just the
//! current page, so the summary cards do not silently change as the
//! administrator pages through the table.
export async function fetchAdminPaymentTotals(): Promise<AdminPaymentTotals> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("payment_transactions")
    .select("amount, commission_amount, owner_amount, status");

  if (error) {
    throw new Error(`Failed to fetch admin payment totals: ${error.message}`);
  }

  return (data ?? []).reduce<AdminPaymentTotals>(
    (accumulator, payment) => {
      accumulator.grossVolume += Number(payment.amount ?? 0);

      if (payment.status === "PAID") {
        accumulator.platformCommission += Number(payment.commission_amount ?? 0);
        accumulator.ownerPayable += Number(payment.owner_amount ?? 0);
        accumulator.paidCount += 1;
      }

      return accumulator;
    },
    { grossVolume: 0, platformCommission: 0, ownerPayable: 0, paidCount: 0 },
  );
}

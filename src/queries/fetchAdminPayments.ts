import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

type PaymentRow = Database["public"]["Tables"]["payment_transactions"]["Row"];

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

export type AdminPayments = {
  payments: AdminPayment[];
  totals: AdminPaymentTotals;
};

export async function fetchAdminPayments(): Promise<AdminPayments> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("payment_transactions")
    .select(
      "id, amount, commission_amount, owner_amount, status, provider, created_at, boat_reservations(id, boats(name))",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch admin payments: ${error.message}`);
  }

  const payments: AdminPayment[] = (data ?? []).map((payment) => ({
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

  const totals = payments.reduce<AdminPaymentTotals>(
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

  return { payments, totals };
}

"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminPaymentTotals,
  type AdminPaymentTotals,
} from "@/queries/fetchAdminPayments";

export const ADMIN_PAYMENT_TOTALS_QUERY_KEY_PREFIX =
  "admin-payment-totals" as const;

export const ADMIN_PAYMENT_TOTALS_QUERY_KEY = [
  ADMIN_PAYMENT_TOTALS_QUERY_KEY_PREFIX,
] as const;

//? Separate from the paginated list so the summary cards stay whole-dataset
//? figures rather than page-scoped ones.
export function useAdminPaymentTotals() {
  return useSupabaseRealtime<AdminPaymentTotals>({
    queryKey: ADMIN_PAYMENT_TOTALS_QUERY_KEY,
    queryFn: fetchAdminPaymentTotals,
    realtimeSubscriptions: [
      { table: "payment_transactions", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminPayments,
  type AdminPayments,
} from "@/queries/fetchAdminPayments";

export const ADMIN_PAYMENTS_QUERY_KEY_PREFIX = "admin-payments" as const;

export const ADMIN_PAYMENTS_QUERY_KEY = [
  ADMIN_PAYMENTS_QUERY_KEY_PREFIX,
] as const;

export function useAdminPayments() {
  return useSupabaseRealtime<AdminPayments>({
    queryKey: ADMIN_PAYMENTS_QUERY_KEY,
    queryFn: fetchAdminPayments,
    realtimeSubscriptions: [
      { table: "payment_transactions", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

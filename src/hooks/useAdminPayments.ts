"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminPayments,
  type AdminPaymentsFilters,
  type PaginatedAdminPayments,
} from "@/queries/fetchAdminPayments";

export const ADMIN_PAYMENTS_QUERY_KEY_PREFIX = "admin-payments" as const;

export function buildAdminPaymentsQueryKey(filters: AdminPaymentsFilters) {
  return [ADMIN_PAYMENTS_QUERY_KEY_PREFIX, "list", filters] as const;
}

export function useAdminPayments(filters: AdminPaymentsFilters) {
  return useSupabaseRealtime<PaginatedAdminPayments>({
    queryKey: buildAdminPaymentsQueryKey(filters),
    queryFn: () => fetchAdminPayments(filters),
    realtimeSubscriptions: [
      { table: "payment_transactions", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

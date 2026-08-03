"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  fetchAdminAuditLog,
  type AdminAuditEntry,
} from "@/queries/fetchAdminAuditLog";

export const ADMIN_AUDIT_QUERY_KEY_PREFIX = "admin-audit" as const;

export const ADMIN_AUDIT_QUERY_KEY = [
  ADMIN_AUDIT_QUERY_KEY_PREFIX,
] as const;

export function useAdminAuditLog() {
  return useSupabaseRealtime<AdminAuditEntry[]>({
    queryKey: ADMIN_AUDIT_QUERY_KEY,
    queryFn: fetchAdminAuditLog,
    realtimeSubscriptions: [
      { table: "admin_audit_log", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

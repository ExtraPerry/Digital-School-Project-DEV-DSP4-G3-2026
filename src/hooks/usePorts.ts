"use client";

import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { fetchPorts, type PortOption } from "@/queries/fetchPorts";

export const PORTS_QUERY_KEY = ["ports"] as const;

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export function usePorts() {
  return useSupabaseRealtime<PortOption[]>({
    queryKey: PORTS_QUERY_KEY,
    queryFn: fetchPorts,
    realtimeSubscriptions: [
      { table: "ports", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

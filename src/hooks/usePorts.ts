"use client";

import { NIL_UUID } from "@/constants/Realtime";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { fetchPorts, type PortOption } from "@/queries/fetchPorts";

export const PORTS_QUERY_KEY = ["ports"] as const;

export function usePorts() {
  return useSupabaseRealtime<PortOption[]>({
    queryKey: PORTS_QUERY_KEY,
    queryFn: fetchPorts,
    realtimeSubscriptions: [
      { table: "ports", filter: `id=neq.${NIL_UUID}` },
    ],
  });
}

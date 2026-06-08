"use client"

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DEFAULT_TANSTACK_QUERY_STALE_TIME_IN_MS } from "@/constants/TanstackQuery";

export function TanstackQueryClient({
  children,
}: {
  children: ReactNode,
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_TANSTACK_QUERY_STALE_TIME_IN_MS,
      }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
"use client";

import { DEFAULT_TANSTACK_QUERY_STALE_TIME_IN_MS } from "@/constants/TanstackQuery";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";
import { QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

type SupabasePublicTables = keyof Database["public"]["Tables"];
type SupabasePublicTableColumns<TTable extends SupabasePublicTables> =
  keyof Database["public"]["Tables"][TTable]["Row"] & string;

//! NOTE: refer to supabase documentation for how the filter works.
//! Supabase documentation URL : "https://supabase.com/docs/guides/realtime/postgres-changes".
export type StandardRealtimeFilterActions = "eq"| "neq"| "lt"| "lte"| "gt"| "gte";
export type StandardRealtimeFilterTypes<
  TTable extends SupabasePublicTables,
  TColumns extends SupabasePublicTableColumns<TTable>,
> = `${TColumns}=${StandardRealtimeFilterActions}.${string}`; //? The string content is usually a singular value of a word, number or boolean.
export type IncludeRealtimeFilterType<
  TTable extends SupabasePublicTables,
  TColumns extends SupabasePublicTableColumns<TTable>,
> = `${TColumns}=in.(${string})`; //? The string content is of the following style => "(value)" or "(value1, value2)" or "(value1, value2, value3)" self repeating pattern for value4 & etc...

//! The generic types are a decleration of intent.
//! This isn't a catch all, but will serve to catch most minor typoes when it comes to the instruction structure itself and/or the table/column names.
//! If you can't find the table or column you are looking for make sure that the "@/lib/supabase/database.types" file is up to date.
export type RealtimeSubscriptionForTable<TTable extends SupabasePublicTables> = {
  table: TTable,
  filter:
    | StandardRealtimeFilterTypes<TTable, SupabasePublicTableColumns<TTable>>
    | IncludeRealtimeFilterType<TTable, SupabasePublicTableColumns<TTable>>,
};
export type RealtimeSubscription = {
  [TTable in SupabasePublicTables]: RealtimeSubscriptionForTable<TTable>;
}[SupabasePublicTables];

export type UseRealtimeQueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  realtimeSubscriptions: RealtimeSubscription[];
  enabled?: boolean;
};

export function useSupabaseRealtime<TData>({
  queryKey,
  queryFn,
  realtimeSubscriptions,
  enabled = true,
}: UseRealtimeQueryOptions<TData>) {
  const queryClient = useQueryClient();

  //* Actual query request of the caller of this function.
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: DEFAULT_TANSTACK_QUERY_STALE_TIME_IN_MS,
  });

  //* Caching of serialized values for supabase realtime (only needs to be updated if the query itself is different).
  const serializedQueryKey = useMemo(
    () => JSON.stringify(queryKey),
    [queryKey],
  );
  const serializedSubscriptions = useMemo(
    () => JSON.stringify(realtimeSubscriptions),
    [realtimeSubscriptions],
  );

  //* Invalidation logic on supabase realtime event.
  useEffect(() => {
    if (!enabled) return;

    const subscriptions: RealtimeSubscription[] = JSON.parse(
      serializedSubscriptions,
    );
    if (subscriptions.length === 0) return;

    const supabase = createSupabaseBrowserClient();

    //* Insures a unique channel is requested per call of the useSupabaseRealtime hook.
    const channelTopic = `realtime:${serializedQueryKey}:${crypto.randomUUID()}`;
    const channel = supabase.channel(channelTopic);

    for (const subscription of subscriptions) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: subscription.table,
          filter: subscription.filter ? subscription.filter : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        },
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    queryClient,
    enabled,
    serializedQueryKey,
    serializedSubscriptions,
    queryKey,
  ]);

  //* The requested query with supabase realtime.
  return query;
}

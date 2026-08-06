"use client";

import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { BoatImage, toCoverImage } from "@/lib/boats";
import { Constants, Database } from "@/lib/supabase/database.types";

export type BoatEquipment =
  (typeof Constants.public.Enums.boat_equipment)[number];
export type BoatType = (typeof Constants.public.Enums.boat_type)[number];

export type BoatSearchFilters = {
  port: string;
  from: string;
  to: string;
  types?: BoatType[];
  minPrice?: number;
  maxPrice?: number;
  minLength?: number;
  maxLength?: number;
  skipperIncluded?: boolean;
  equipment?: BoatEquipment[];
  sortBy?: "relevance" | "rating" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
};

export type BoatSearchResult =
  Database["public"]["Functions"]["search_available_boats"]["Returns"][number];

/**
 * A search row with its cover resolved to a public Storage URL. The RPC returns
 * the cover's bucket and path; turning those into a URL needs a Supabase
 * client, so it happens here rather than in the component tree.
 */
export type BoatSearchRow = BoatSearchResult & {
  coverImage: BoatImage | null;
};

export type PaginatedBoats = {
  boats: BoatSearchRow[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type BoatFilterBounds = {
  minPrice: number;
  maxPrice: number;
  minLength: number;
  maxLength: number;
};

export async function fetchBoats(
  filters: BoatSearchFilters,
): Promise<PaginatedBoats> {
  const supabase = createSupabaseBrowserClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  const { data, error } = await supabase.rpc("search_available_boats", {
    p_port_name: filters.port,
    p_from_date: filters.from,
    p_to_date: filters.to,
    ...(filters.types ? { p_boat_types: filters.types } : {}),
    ...(filters.minPrice !== undefined ? { p_min_price: filters.minPrice } : {}),
    ...(filters.maxPrice !== undefined ? { p_max_price: filters.maxPrice } : {}),
    ...(filters.minLength !== undefined ? { p_min_length: filters.minLength } : {}),
    ...(filters.maxLength !== undefined ? { p_max_length: filters.maxLength } : {}),
    p_skipper_included: filters.skipperIncluded ?? false,
    ...(filters.equipment ? { p_equipment: filters.equipment } : {}),
    p_sort_by: filters.sortBy ?? "relevance",
    p_page: page,
    p_page_size: pageSize,
  });

  if (error) {
    throw new Error(`Failed to search boats: ${error.message}`);
  }

  const rows = data ?? [];
  const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

  const boats = rows.map((row) => ({
    ...row,
    coverImage: toCoverImage(supabase, row),
  }));

  return { boats, totalCount, page, pageSize };
}

export async function fetchBoatFilterBounds(
  portName: string,
): Promise<BoatFilterBounds> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.rpc("get_boat_filter_bounds", {
    p_port_name: portName,
  });

  if (error) {
    throw new Error(`Failed to fetch filter bounds: ${error.message}`);
  }

  const row = data?.[0];
  return {
    minPrice: row?.min_price ?? 0,
    maxPrice: row?.max_price ?? 5000,
    minLength: row?.min_length ?? 5,
    maxLength: row?.max_length ?? 30,
  };
}

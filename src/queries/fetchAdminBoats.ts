import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";
import {
  ADMIN_PAGE_SIZE,
  buildPaginatedResult,
  pageToRange,
  sanitizeSearchTerm,
  type AdminListParams,
  type PaginatedAdminList,
} from "@/types/AdminList";

type BoatRow = Database["public"]["Tables"]["boats"]["Row"];
type BoatType = Database["public"]["Enums"]["boat_type"];

export const ADMIN_BOATS_SORT_COLUMNS = [
  "created_at",
  "name",
  "price_per_day",
  "rating",
] as const;

export type AdminBoatsSortColumn = (typeof ADMIN_BOATS_SORT_COLUMNS)[number];

export type AdminBoatsFilters = AdminListParams<AdminBoatsSortColumn> & {
  type: BoatType | "ALL";
  published: "ALL" | "PUBLISHED" | "DRAFT";
};

export const DEFAULT_ADMIN_BOATS_FILTERS: AdminBoatsFilters = {
  search: "",
  type: "ALL",
  published: "ALL",
  sortColumn: "created_at",
  sortDirection: "desc",
  page: 1,
};

export type AdminBoat = Pick<
  BoatRow,
  | "id"
  | "name"
  | "type"
  | "price_per_day"
  | "rating"
  | "is_published"
  | "created_at"
> & {
  portName: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
};

export type PaginatedAdminBoats = PaginatedAdminList<AdminBoat>;

//? Unpublished drafts are included: the existing boats SELECT policy already
//? grants administrators visibility of every row, published or not.
export async function fetchAdminBoats(
  filters: AdminBoatsFilters,
): Promise<PaginatedAdminBoats> {
  const supabase = createSupabaseBrowserClient();
  const { from, to } = pageToRange(filters.page);

  let query = supabase
    .from("boats")
    .select(
      "id, name, type, price_per_day, rating, is_published, created_at, ports(name), users(first_name, last_name, email)",
      { count: "exact" },
    );

  const search = sanitizeSearchTerm(filters.search);

  if (search.length > 0) {
    query = query.ilike("name", `%${search}%`);
  }

  if (filters.type !== "ALL") {
    query = query.eq("type", filters.type);
  }

  if (filters.published !== "ALL") {
    query = query.eq("is_published", filters.published === "PUBLISHED");
  }

  const { data, error, count } = await query
    .order(filters.sortColumn, {
      ascending: filters.sortDirection === "asc",
    })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch admin boats: ${error.message}`);
  }

  const rows: AdminBoat[] = (data ?? []).map((boat) => {
    const owner = boat.users;
    const ownerName = owner
      ? [owner.first_name, owner.last_name].filter(Boolean).join(" ").trim()
      : "";

    return {
      id: boat.id,
      name: boat.name,
      type: boat.type,
      price_per_day: boat.price_per_day,
      rating: boat.rating,
      is_published: boat.is_published,
      created_at: boat.created_at,
      portName: boat.ports?.name ?? null,
      ownerName: ownerName.length > 0 ? ownerName : null,
      ownerEmail: owner?.email ?? null,
    };
  });

  return buildPaginatedResult(rows, count, filters.page, ADMIN_PAGE_SIZE);
}

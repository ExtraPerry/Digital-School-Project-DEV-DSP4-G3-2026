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

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type UserRoleType = Database["public"]["Enums"]["user_roles_type"];
type UserAccountStatus = Database["public"]["Enums"]["user_account_status"];

//! Only own columns of public.users. PostgREST cannot order a parent table by
//! an embedded column, so `role` is not sortable.
export const ADMIN_USERS_SORT_COLUMNS = [
  "created_at",
  "email",
  "last_name",
  "account_status",
] as const;

export type AdminUsersSortColumn = (typeof ADMIN_USERS_SORT_COLUMNS)[number];

export type AdminUsersFilters = AdminListParams<AdminUsersSortColumn> & {
  role: UserRoleType | "ALL";
  status: UserAccountStatus | "ALL";
};

export const DEFAULT_ADMIN_USERS_FILTERS: AdminUsersFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
  sortColumn: "created_at",
  sortDirection: "desc",
  page: 1,
};

export type AdminUser = Pick<
  UserRow,
  | "id"
  | "auth_id"
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
  | "created_at"
  | "account_status"
> & {
  role: UserRoleType | null;
  //? public.check_role_requirements() blocks promotion to any elevated role
  //? unless the profile carries both an email and a phone number.
  canBePromoted: boolean;
};

export type PaginatedAdminUsers = PaginatedAdminList<AdminUser>;

//? Cross-user reads rely on the "Admins can view all users" /
//? "Admins can view all user roles" policies. A non-admin caller simply
//? receives their own row, never an error.
export async function fetchAdminUsers(
  filters: AdminUsersFilters,
): Promise<PaginatedAdminUsers> {
  const supabase = createSupabaseBrowserClient();
  const { from, to } = pageToRange(filters.page);

  //? `!inner` is required when filtering on the embedded role, otherwise
  //? PostgREST returns the parent row with a null embed instead of excluding it.
  const roleEmbed = filters.role === "ALL" ? "user_roles(role)" : "user_roles!inner(role)";

  let query = supabase
    .from("users")
    .select(
      `id, auth_id, first_name, last_name, email, phone, created_at, account_status, ${roleEmbed}`,
      { count: "exact" },
    );

  const search = sanitizeSearchTerm(filters.search);

  if (search.length > 0) {
    query = query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
    );
  }

  if (filters.role !== "ALL") {
    query = query.eq("user_roles.role", filters.role);
  }

  if (filters.status !== "ALL") {
    query = query.eq("account_status", filters.status);
  }

  const { data, error, count } = await query
    .order(filters.sortColumn, {
      ascending: filters.sortDirection === "asc",
    })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch admin users: ${error.message}`);
  }

  const rows: AdminUser[] = (data ?? []).map((user) => ({
    id: user.id,
    auth_id: user.auth_id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    account_status: user.account_status,
    role: user.user_roles?.role ?? null,
    canBePromoted: Boolean(user.email?.trim() && user.phone?.trim()),
  }));

  return buildPaginatedResult(rows, count, filters.page, ADMIN_PAGE_SIZE);
}

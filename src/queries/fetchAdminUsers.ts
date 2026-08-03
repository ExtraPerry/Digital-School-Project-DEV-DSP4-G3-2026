import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type UserRoleType = Database["public"]["Enums"]["user_roles_type"];

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

//? Cross-user reads rely on the "Admins can view all users" /
//? "Admins can view all user roles" policies. A non-admin caller simply
//? receives their own row, never an error.
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, auth_id, first_name, last_name, email, phone, created_at, account_status, user_roles(role)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch admin users: ${error.message}`);
  }

  return (data ?? []).map((user) => ({
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
}

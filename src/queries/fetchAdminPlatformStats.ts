import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";

export type AdminPlatformStats = {
  totalUsers: number;
  publishedBoats: number;
  reservationsThisMonth: number;
  commissionThisMonth: number;
};

//? The RPC is SECURITY DEFINER and raises 42501 for non-administrators,
//? so a non-admin caller surfaces as a thrown error rather than empty stats.
export async function fetchAdminPlatformStats(): Promise<AdminPlatformStats> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.rpc("admin_platform_stats");

  if (error) {
    throw new Error(`Failed to fetch admin platform stats: ${error.message}`);
  }

  const row = data?.[0];

  if (!row) {
    throw new Error("Failed to fetch admin platform stats: no row returned");
  }

  return {
    totalUsers: Number(row.total_users),
    publishedBoats: Number(row.published_boats),
    reservationsThisMonth: Number(row.reservations_this_month),
    commissionThisMonth: Number(row.commission_this_month),
  };
}

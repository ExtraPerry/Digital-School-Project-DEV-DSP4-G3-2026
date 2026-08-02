import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

export type MyBoatReview = Database["public"]["Tables"]["boat_reviews"]["Row"] & {
  boats: {
    id: string;
    name: string;
    type: Database["public"]["Enums"]["boat_type"];
    ports: { name: string } | null;
  } | null;
};

export async function fetchMyReviews(): Promise<MyBoatReview[]> {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      `Failed to fetch reviews: ${authError?.message ?? "not authenticated"}`,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(
      `Failed to fetch reviewer profile: ${profileError?.message ?? "missing profile"}`,
    );
  }

  const { data, error } = await supabase
    .from("boat_reviews")
    .select(
      `
      *,
      boats (
        id,
        name,
        type,
        ports ( name )
      )
    `,
    )
    .eq("reviewer_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch my reviews: ${error.message}`);
  }

  return (data ?? []) as MyBoatReview[];
}

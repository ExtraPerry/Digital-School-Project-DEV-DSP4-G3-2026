import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

type ReviewRow = Database["public"]["Tables"]["boat_reviews"]["Row"];

export type AdminReview = Pick<
  ReviewRow,
  | "id"
  | "rating"
  | "comment"
  | "author_name"
  | "created_at"
  | "moderation_status"
> & {
  boatId: string | null;
  boatName: string | null;
  reviewerName: string | null;
};

//! The `users!boat_reviews_reviewer_id_fkey` hint is REQUIRED. Since the
//! moderation migration, boat_reviews has two foreign keys to public.users
//! (reviewer_id and moderated_by), so a bare `users(...)` embed fails with
//! PGRST201 "more than one relationship was found".
export async function fetchAdminReviews(): Promise<AdminReview[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("boat_reviews")
    .select(
      "id, rating, comment, author_name, created_at, moderation_status, boats(id, name), users!boat_reviews_reviewer_id_fkey(first_name, last_name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch admin reviews: ${error.message}`);
  }

  return (data ?? []).map((review) => {
    const reviewer = review.users;
    const reviewerName = reviewer
      ? [reviewer.first_name, reviewer.last_name].filter(Boolean).join(" ").trim()
      : "";

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      author_name: review.author_name,
      created_at: review.created_at,
      moderation_status: review.moderation_status,
      boatId: review.boats?.id ?? null,
      boatName: review.boats?.name ?? null,
      reviewerName: reviewerName.length > 0 ? reviewerName : null,
    };
  });
}

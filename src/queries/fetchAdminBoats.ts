import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

type BoatRow = Database["public"]["Tables"]["boats"]["Row"];

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

//? Unpublished drafts are included: the existing boats SELECT policy already
//? grants administrators visibility of every row, published or not.
export async function fetchAdminBoats(): Promise<AdminBoat[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("boats")
    .select(
      "id, name, type, price_per_day, rating, is_published, created_at, ports(name), users(first_name, last_name, email)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch admin boats: ${error.message}`);
  }

  return (data ?? []).map((boat) => {
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
}

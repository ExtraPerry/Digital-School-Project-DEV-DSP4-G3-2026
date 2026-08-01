import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

export type PortOption = Pick<
  Database["public"]["Tables"]["ports"]["Row"],
  "id" | "name" | "slug"
>;

export async function fetchPorts(): Promise<PortOption[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("ports")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch ports: ${error.message}`);
  }

  return data ?? [];
}
